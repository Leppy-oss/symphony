const assert = require('assert');
const search = require('../util/search-ex');

module.exports = {
    mostRecentStateValue: 0,
    existingStateNames: [],
    states: [],
    State: class {
        constructor(name, value=null) {
            assert(!module.exports.existingStateNames.includes(name), 'States running within the same instance of the client must have unique names');
            if (value === null) value = module.exports.mostRecentStateValue++;
            this.value = value;
            this.name = name;
            module.exports.existingStateNames.push(this.name);
            this.start = (self) => {};
            /**
             * @param {function} change 
             */
            this.loop = (self, change) => {};
            /**
             * @param {function} change 
             */
            this.terminate = (self, change) => {};
            module.exports.states.push(this);
        }
        /**
         * @param {function} func 
         * @returns The instance of the state whose function is being set
         */
        setStart(func) {
            this.start = func;
            return this;
        }
        /**
         * @param {function} func 
         * @returns The instance of the state whose function is being set
         */
        setLoop(func) {
            this.loop = func;
            return this;
        }
        /**
         * @param {function} func 
         * @returns The instance of the state whose function is being set
         */
        setTerminate(func) {
            this.terminate = func;
            return this;
        }
    },
    createState: (name, value=null) => {
        return new module.exports.State(name, value);
    },
    getStates: () => {
        return module.exports.states;
    },
    getState: (name=null, value=null) => {
        const allCurrentStates = module.exports.getStates();
        assert(name !== null || value !== null && allCurrentStates.length > 0);
        if (name !== null) return search(allCurrentStates, 'name', name);
        return search(allCurrentStates, 'value', value);
    }
}