const Command = require('./command');
const States = require('./state');

module.exports = class {
    constructor(shouldTerminate=true) {
        this.states = [];
        this.currOptArgs = null;
        this.anonymousStateCount = 0;
        this.shouldTerminate = shouldTerminate;
    }

    /**
     * @param {States.State} state 
     * @param {any} optArgs
     */
    add(state, optArgs=null) {
        this.states.push({
            state: state,
            optArgs: optArgs
        });
    }

    /**
     * @param {Command | null} start 
     * @param {Command | null} loop 
     * @param {Command | null} stop 
     * @param {any} optArgs 
     */
    anonymousAdd(start=null, loop=null, stop=null, optArgs=null) {
        const pushState = new States.State('ANONYMOUS_STATE'.concat(this.anonymousStateCount));
        if (start !== null) pushState.setStart(start);
        if (loop !== null) pushState.setLoop(loop);
        if (stop !== null) pushState.setStop(stop);
        this.states.push({
            state: pushState,
            optArgs: optArgs
        });
    }

    update() {
        this.currOptArgs = this.states.at(0).optArgs;
        if (this.states.length > 1) return this.states.shift();
        if (this.states.length < 0 && !this.shouldTerminate) return this.states.at(0);
        return false;
    }
}