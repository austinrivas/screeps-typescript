const pathStyle = { visualizePathStyle: { stroke: '#ffaa00' } };

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

    findStorageContainers: function (creep: Creep): Structure[] {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                    structure.store.getUsedCapacity(RESOURCE_ENERGY) > 50);
            }
        });
    },

    findUnoccupiedStorageContainers: function (creep: Creep): Structure[] {
        return creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                    !structure.pos.lookFor(LOOK_CREEPS).length);
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
        let containerAtLocation = this.getContainerAtLocation(creep),
            storageStructures = this.findStorageStructure(creep),
            containers = []
        if (creep.store.getFreeCapacity() > 0) {
            if (storageStructures.length) {
                containers = _.sortBy(this.findStorageContainers(creep), (c: StructureContainer) => {
                    return c.store.getFreeCapacity()
                });

                if (containers.length) {
                    let container = containers[0];
                    if (creep.withdraw(container, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(container, pathStyle)
                    }
                } else {
                    this.harvestResource(creep);
                }
            } else {
                this.harvestResource(creep);
            }
        } else {
            if (containerAtLocation && storageStructures.length == 0) {
                this.harvestResource(creep);
            } else {
                containers = this.findUnoccupiedStorageContainers(creep);

                if (storageStructures.length > 0) {
                    this.transferEnergyToStorage(creep, storageStructures[0]);
                } else if (containers.length) {
                    let container = containers[0];
                    creep.moveTo(container, pathStyle);
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
