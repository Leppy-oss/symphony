const assert = require('assert');
const Command = require('../command');
const search = require('../util/search-ex');

module.exports = {
    mostRecentStateValue: 0,
    existingStateNames: [],
    states: [],
    State: class {
        constructor(name, value = null) {
                assert(!module.exports.existingStateNames.includes(name), 'States running within the same instance of the client must have unique names');
                if (value === null) value = module.exports.mostRecentStateValue++;
                this.value = value;
                this.name = name;
                module.exports.existingStateNames.push(this.name);
                this.start = new Command(async (bot) => {});
                this.loop = new Command(async (bot) => {});
                this.terminate = new Command(async (bot) => {});
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
        setTerminate(command) {
            this.terminate = command;
            return this;
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
    hasStates: () => {
        return module.exports.states.length > 0;
    }
}