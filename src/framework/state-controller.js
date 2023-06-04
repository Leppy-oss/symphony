const state = require('./state');

module.exports = class {
    /**
     * @param {state.State | null} initialState 
     */
    constructor(initialState = null) {
        if (initialState === null) {
            if (!state.hasStates()) state.createState('DEFAULT');
            this.state = state.getState('DEFAULT');
        } else this.state = initialState;
        this.update = this.update.bind(this);
        this.changeState = this.changeState.bind(this);
    }

    /**
     * @param {state.State} newState 
     */
    async changeState(newState) {
        this.state.terminate(this.state, this.changeState);
        if (typeof newState == state.State) this.state = newState;
        else if (typeof newState == Number) this.state = state.getState(null, newState);
        else this.state = state.getState(newState);
        this.state.start(bot);
    }

    async update (bot) {
        await this.state.loop.action(bot);
    }
}