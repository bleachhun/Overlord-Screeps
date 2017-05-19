var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleDefenderRanged = require('role.defenderRanged');
var roleDefender = require('role.defender');
var roleHauler = require('role.Hauler');
var roleExpediter = require('role.Expediter');
var roleScout = require('role.Scout');
var roleDumpTruck = require('role.DumpTruck');
var roleWorker = require('role.worker');
var roleWallRepairer = require('role.wallRepairer');
var roleStationaryBuilder = require('role.StationaryBuilder');
const profiler = require('screeps-profiler');
const spawnsCreation = require('respawn');
const creepBalancer = require('balancer');
const autoBuild = require('autoBuild');
const towerControl = require('role.Tower');

// This line monkey patches the global prototypes.
profiler.enable();

module.exports.loop = function () {
    profiler.wrap(function () {

        for (var name in Memory.creeps) {
            if (!Game.creeps[name]) {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:' + name);
            }
        }

        //HOSTILE CHECK//
        var closestHostile = Game.spawns['spawn1'].room.find(FIND_HOSTILE_CREEPS);
        if (closestHostile[0]) {
            var pos = new RoomPosition(43, 22, 'E41N96');
            pos.createFlag('combatBuild');
        } else if (Game.flags.combatBuild) {
            Game.flags.combatBuild.remove();
        }

        //Every 15 ticks
        if (Game.time % 15 === 0) {
            spawnsCreation.run();
            creepBalancer.run();
        }

        //Every 100 ticks
        if (Game.time % 100 === 0) {
            autoBuild.run();
        }

        //Tower Management
        var tower = Game.getObjectById('591d48b421061c6c5b9bfaea');
        if (tower) {
            towerControl.run(tower);
        }

        for (var name in Game.creeps) {
            var creep = Game.creeps[name];
            if (creep.memory.role === 'stationaryHarvester') {
                roleHarvester.run(creep);
            }
            if (creep.memory.role === 'hauler') {
                roleHauler.run(creep);
            }
            if (creep.memory.role === 'expediter') {
                roleExpediter.run(creep);
            }
            if (creep.memory.role === 'dumpTruck') {
                roleDumpTruck.run(creep);
            }
            if (creep.memory.role === 'worker') {
                roleWorker.run(creep);
            }
            if (creep.memory.role === 'upgrader') {
                roleUpgrader.run(creep);
            }
            if (creep.memory.role === 'wallRepairer') {
                roleWallRepairer.run(creep);
            }
            if (creep.memory.role === 'stationaryBuilder') {
                roleStationaryBuilder.run(creep);
            }
            if (creep.memory.role === 'rangedDefender') {
                roleDefenderRanged.run(creep);
            }
            if (creep.memory.role === 'defender') {
                roleDefender.run(creep);
            }
            if (creep.memory.role === 'scout') {
                roleScout.run(creep);
            }
        }
    });
}