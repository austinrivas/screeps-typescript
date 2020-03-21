import { ErrorMapper } from "utils/ErrorMapper";
import roleHarvester from 'role.harvester'
import roleUpgrader from 'role.upgrader'
import roleBuilder from 'role.builder'

function clearMemory() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
}

function logEnergyAvailable() {
  for (var name in Game.rooms) {
    console.log(`Room:${name}:energy: ${Game.rooms[name].energyAvailable}`);
  }
}

function logGameTime() {
  console.log(`Game Time: ${Game.time}`);
}

export function getCreeps(role: string): Creep[] {
  let creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
  console.log(`Role:${role}:pop: ${creeps.length}`);
  return creeps;
}

export function getSpawn(name: string): StructureSpawn | null {
  return Game.spawns[name];
}

export function spawnCreep(name: string, role: string, body: BodyPartConstant[], spawn: StructureSpawn) {
  let newName: string = name + Game.time;
  console.log(`spawn:${spawn.name}:spawning:${role}: ${newName}`);
  spawn.spawnCreep(body, newName,
    { memory: { role: role } });
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  logGameTime();
  logEnergyAvailable();
  clearMemory();

  let harvesters: Creep[] = getCreeps('harvester'),
    builders: Creep[] = getCreeps('builder'),
    upgraders: Creep[] = getCreeps('upgrader'),
    spawn: StructureSpawn | null = getSpawn('Spawn1');

  if (spawn) {
    if (harvesters.length < 2) {
      spawnCreep('Harvester', 'harvester', [WORK, CARRY, MOVE], spawn);
    } else if (upgraders.length < 2) {
      spawnCreep('Upgrader', 'upgrader', [WORK, CARRY, MOVE], spawn);
    } else if (builders.length < 2) {
      spawnCreep('Builder', 'builder', [WORK, CARRY, MOVE], spawn);
    }

    if (spawn.spawning) {
      let spawningCreep: Creep = Game.creeps[spawn.spawning.name];
      spawn.room.visual.text(
        '🛠️' + spawningCreep.memory.role,
        spawn.pos.x + 1,
        spawn.pos.y,
        { align: 'left', opacity: 0.8 });
    }
  }

  let tower: StructureTower | null = Game.getObjectById('TOWER_ID');
  if (tower) {
    let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
    if (closestDamagedStructure) {
      tower.repair(closestDamagedStructure);
    }

    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    }
  }

  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }
});
