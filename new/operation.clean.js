Creep.prototype.cleanRoom = function () {
    let sentence = ['Cleaning', 'Room', this.memory.targetRoom];
    let word = Game.time % sentence.length;
    this.say(sentence[word], true);
    if (this.room.name !== this.memory.targetRoom) {
        return this.shibMove(new RoomPosition(25, 25, this.memory.targetRoom), {range: 23});
    }
    this.borderCheck();
    let creeps = this.pos.findClosestByRange(FIND_CREEPS);
    if (this.room.controller.reservation || creeps) {
        Game.rooms[this.memory.overlord].memory.cleaningTargets = _.filter(Game.rooms[this.memory.overlord].memory.cleaningTargets, (t) => t.name !== this.memory.targetRoom);
        this.suicide();
    }
    let target = this.pos.findClosestByPath(FIND_STRUCTURES);
    if (!target) {
        switch (this.signController(this.room.controller, 'Room cleaned courtesy of #overlords.')) {
            case OK:
                Game.rooms[this.memory.overlord].memory.cleaningTargets = _.filter(Game.rooms[this.memory.overlord].memory.cleaningTargets, (t) => t.name !== this.memory.targetRoom);
                this.suicide();
                break;
            case ERR_NOT_IN_RANGE:
                this.shibMove(this.room.controller);
        }
    } else {
        switch (this.dismantle(target)) {
            case ERR_NOT_IN_RANGE:
                this.shibMove(target, {ignoreCreeps: false, repathChance: 0.5});
                break;
            case OK:
                return true;

        }
    }
};