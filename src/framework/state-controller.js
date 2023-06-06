const State = require('./state');
const Queue = require('./state-queue');

module.exports = class {
    /**
     * @param {state.State | null} initialState 
     */
    constructor(initialStates=null) {
        this.queues = [];
        this.states = [];
        if (initialStates === null) {
            if (!State.hasState('DEFAULT')) State.createState('DEFAULT');
            const state = State.getState('DEFAULT');
            this.queueState
        } else this.states = initialStates;
        this.update = this.update.bind(this);
        this.stateChange = this.stateChange.bind(this);
        this.add = this.add.bind(this);
    }

    /**
     * @param {State.State} newState 
     */
    async stateChange(state, bot) {
        await state.stop.action(bot);
        const nextState = state.nextState;
        const index = this.states.findIndex((_state) => _state === state);
        if (nextState !== null) {
            this.states.at(index) = nextState;
            await nextState.start.action(bot);
        }
        else if (state.shouldTerminate && await state.terminationCondition.action(bot)) this.states.splice(index, index + 1); // terminate the state sequence
    }

    async update(bot) {
        const statesToChange = [];
        for (const i in this.states) {
            const state = this.states[i];
            const ret = await state.loop.action(bot);
            if (ret === undefined || ret) statesToChange.push(state);
        }
        for (const _state of statesToChange) await this.stateChange(_state, bot);
    }

    async add(state, bot) {
        if (typeof state === 'string' || state instanceof String) state = State.getState(state);
        this.states.push(state);
        await state.start.action(bot);
    }
}