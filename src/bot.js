const BotEx = require('./bot-ex');
const commands = require('./enchanting-bot-commands');

module.exports = class extends BotEx {
    constructor(username, password, auth, commands) {
        super(username, password, auth);
        this.States = module.exports.States;
        this.chatActions = this.chatActions.bind(this);
        this.commands = commands;
    }
    async update() {
        await super.update();
    }
    init() {
        super.init();
    }
    async setState(state) {
        await this.controller.changeState(state);
    }
    deathHandler() {
        super.deathHandler();
    }
    loginHandler() {
        super.loginHandler();
    }
    async chatActions(message) {
        await super.chatActions(message);
        if (message in commands) await this.commands[message].action(this)
    }
}