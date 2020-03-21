import _ from 'lodash'
const pathStyle = { visualizePathStyle: { stroke: '#ffaa00' } };

let roleBuilder = {

    findClosestDamagedStructures: function (creep: Creep): Structure | null {
        return creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
    },

    findStorageContainers: function (creep: Creep): Structure[] {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
            }
        });
    },

    run: function (creep: Creep) {
        let damagedStructure = this.findClosestDamagedStructures(creep);
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvesting = true;
            creep.memory.building = false;
            creep.memory.repairing = false;
            creep.say('🔄 harvest');
        } else if (creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
            if (damagedStructure) {
                creep.memory.building = false;
                creep.memory.repairing = true;
                creep.say('🚧 repair');
            } else {
                creep.memory.repairing = false;
                creep.memory.building = true;
                creep.say('🚧 build');
            }
        } else if (!creep.memory.harvesting) {
            if (damagedStructure) {
                creep.memory.building = false;
                creep.memory.repairing = true;
                creep.say('🚧 repair');
            } else {
                creep.memory.repairing = false;
                creep.memory.building = true;
                creep.say('🚧 build');
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
        } else if (creep.memory.harvesting) {
            let containers = _.sortBy(this.findStorageContainers(creep), (c: StructureContainer) => {
                return c.store.getFreeCapacity()
            });

            if (containers.length) {
                let container = containers[0];
                console.log(container);
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
