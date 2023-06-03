const state = require('./state');

module.exports = {
    StateController: class {
        /**
         * @param {state.State} initialState 
         */
        constructor(initialState) {
            this.state = initialState;
        }

        /**
         * @param {state.State} newState 
         */
        changeState = (newState) => {
            if (typeof newState == state.State) this.state = newState;
            else if (typeof newState == Number) this.state = state.getState(null, newState);
            else this.state = state.getState(newState);
        }

        update = () => {
            this.state.loop(this.state, this.changeState);
        }
    }
}

state.createState('b').setLoop((self, change) => {
    console.log(self.name);
    change('a');
});

const stateController = new module.exports.StateController(new state.State('a').setLoop((self, change) => {
    console.log(self.name);
    change('b');
}));

setInterval(stateController.update, 1000)