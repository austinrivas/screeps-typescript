let roleHarvester = {
    getContainerAtLocation: function (creep: Creep): Structure | null {
        let structures: Structure[] = creep.pos.lookFor(LOOK_STRUCTURES).filter((structure) => {
            return structure.structureType == STRUCTURE_CONTAINER;
        })

        return structures[0];
    },

    findStorageStructure: function (creep: Creep): Structure[] {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
    },

    harvestResource: function (creep: Creep): void {
        let sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    },

    run: function (creep: Creep): void {
        if (creep.store.getFreeCapacity() > 0) {
            this.harvestResource(creep);
        } else {
            let container = this.getContainerAtLocation(creep),
                storageStructures = this.findStorageStructure(creep);
            if (container && storageStructures.length == 0) {
                this.harvestResource(creep);
            } else {
                if (storageStructures.length > 0) {
                    this.transferEnergyToStorage(creep, storageStructures[0]);
                } else {
                    this.harvestResource(creep);
                }
            }
        }
    },

    transferEnergyToStorage: function (creep: Creep, target: Structure): void {
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
        }
    }
};

export default roleHarvester;
