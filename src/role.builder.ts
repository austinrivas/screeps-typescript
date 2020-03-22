const pathStyle = { visualizePathStyle: { stroke: '#ffaa00' } };

let roleBuilder = {

    findClosestDamagedStructures: function (creep: Creep): Structure | null {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax &&
                structure.structureType !== STRUCTURE_WALL
        });
    },

    findStorageContainers: function (creep: Creep): Structure[] {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) >= 50);
            }
        });
    },

    run: function (creep: Creep) {
        let damagedStructure = this.findClosestDamagedStructures(creep),
            constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvesting = true;
            creep.memory.building = false;
            creep.memory.repairing = false;
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
            if (damagedStructure) {
                creep.memory.building = false;
                creep.memory.upgrading = false;
                creep.memory.repairing = true;
                creep.say('🚧 repair');
            } else if (constructionSites.length) {
                creep.memory.repairing = false;
                creep.memory.upgrading = false;
                creep.memory.building = true;
                creep.say('🚧 build');
            } else {
                creep.memory.repairing = false;
                creep.memory.upgrading = true;
                creep.memory.building = false;
                creep.say('⚡ upgrade');
            }
        } else if (!creep.memory.harvesting) {
            if (damagedStructure) {
                creep.memory.upgrading = false;
                creep.memory.building = false;
                creep.memory.repairing = true;
                creep.say('🚧 repair');
            } else if (constructionSites.length) {
                creep.memory.upgrading = false;
                creep.memory.repairing = false;
                creep.memory.building = true;
                creep.say('🚧 build');
            } else {
                creep.memory.repairing = false;
                creep.memory.upgrading = true;
                creep.memory.building = false;
                creep.say('⚡ upgrade');
            }
        }

        if (creep.memory.building) {
            let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length) {
                if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], pathStyle);
                }
            }
        } else if (creep.memory.repairing && damagedStructure && creep.repair(damagedStructure) == ERR_NOT_IN_RANGE) {
            creep.moveTo(damagedStructure, pathStyle);
        } else if (creep.memory.upgrading) {
            let room: Room = creep.room,
                controller: StructureController | undefined = room.controller
            if (controller && creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, pathStyle);
            }
        } else if (creep.memory.harvesting) {
            let containers = _.sortBy(this.findStorageContainers(creep), (c: StructureContainer) => {
                return c.store.getFreeCapacity()
            });

            if (containers.length) {
                let container = containers[0];
                if (creep.withdraw(container, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container, pathStyle)
                }
            } else {
                let sources = creep.room.find(FIND_SOURCES);
                if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], pathStyle);
                }
            }
        }
    }
};

export default roleBuilder;
