const assert = require('assert');
const Command = require('./command');
const search = require('../util/search-ex');

module.exports = {
    mostRecentStateValue: 0,
    existingStateNames: [],
    states: [],
    State: class {
        constructor(name=null, value=null) {
            assert(!module.exports.existingStateNames.includes(name), 'States running within the same instance of the client must have unique names');
            if (value === null) value = module.exports.mostRecentStateValue++;
            if (name === null) name = 'ANONYMOUS_STATE'.concat(toString(value));
            this.value = value;
            this.name = name;
            module.exports.existingStateNames.push(this.name);
            this.start = new Command(async (bot) => {});
            this.loop = new Command(async (bot) => {});
            this.stop = new Command(async (bot) => {});
            this.terminationCondition = new Command(async (bot) => {return true});
            this.dynamic = true;
            this.shouldTerminate = true;
            this.caller = null;
            this.nextState = null;
            module.exports.states.push(this);
        }
        /**
         * @param {Command} command 
         * @returns The instance of the state whose Command is being set
         */
        setStart(command) {
            this.start = command;
            return this;
        }
        /**
         * @param {Command} command 
         * @returns The instance of the state whose Command is being set
         */
        setLoop(command) {
            this.loop = command;
            return this;
        }
            /**
             * @param {Command} command 
             * @returns The instance of the state whose Command is being set
             */
        setStop(command) {
            this.stop = command;
            return this;
        }
        next(state) {
            this.nextState = state;
            this.nextState.caller = this;
            return (this.nextState);
        }
        /**
         * @param {Command} condition 
         * @returns The instance of the state whose Command is being set
         */
        repeat(condition=null) {
            this.shouldTerminate = false;
            if (condition !== null) this.terminationCondition = condition;
            else this.terminationCondition = new Command(async (bot) => false);
            return this;
        }
        /**
         * @returns The instance of the state whose Command is being set
         */
        terminate() {
            // this.shouldTerminate = true;
            // if (!module.exports.hasState('TERMINATION')) module.exports.createState('TERMINATION');
            // this.nextState = module.exports.getState('TERMINATION');
            return this;
        }
        isDynamic() {
            return this.dynamic;
        }
        /**
         * @returns The instance of the state whose Command is being set
         */
        assertStatic() {
            this.dynamic = false;
        }
        /**
         * @returns The instance of the state whose Command is being set
         */
        assertDynamic() {
            this.dynamic = true;
        }
    },
    createState: (name, value = null) => {
        return new module.exports.State(name, value);
    },
    getStates: () => {
        return module.exports.states;
    },
    getState: (name = null, value = null) => {
        const allCurrentStates = module.exports.getStates();
        assert(name !== null || value !== null && allCurrentStates.length > 0);
        if (name !== null) return search(allCurrentStates, 'name', name);
        return search(allCurrentStates, 'value', value);
    },
    hasState: (name = null, value = null) => {
        return module.exports.getState(name, value) != false;
    },
    hasStates: () => {
        return module.exports.states.length > 0;
    }
}