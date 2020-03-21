const pathStyle = { visualizePathStyle: { stroke: '#ffaa00' } };

let roleUpgrader = {

    findStorageContainers: function (creep: Creep): Structure[] {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
            }
        });
    },

    run: function (creep: Creep) {

        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if (creep.memory.upgrading) {
            let room: Room = creep.room,
                controller: StructureController | undefined = room.controller
            if (controller && creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller, pathStyle);
            }
        }
        else {
            let containers = this.findStorageContainers(creep);

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

export default roleUpgrader;
