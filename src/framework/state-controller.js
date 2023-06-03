const state = require('./state');

module.exports = {
    StateController: class {
        /**
         * @param {state.State | null} initialState 
         */
        constructor(initialState=null) {
            if (initialState === null) {
                if (!state.getState()) state.createState('IDLE');
                this.state = state.getState('IDLE');
            }
            else this.state = initialState;
        }

        /**
         * @param {state.State} newState 
         */
        changeState = (newState) => {
            this.state.terminate(this.state, this.changeState);
            if (typeof newState == state.State) this.state = newState;
            else if (typeof newState == Number) this.state = state.getState(null, newState);
            else this.state = state.getState(newState);
            this.state.start(this.state);
        }

        update = () => {
            this.state.loop(this.state, this.changeState);
        }
    }
}