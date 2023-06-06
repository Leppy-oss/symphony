const BotEx = require('../bots/base/bot-ex');

module.exports = class {
    /**
     * @param {(bot: BotEx) => boolean | void} action 
     */
    constructor(action) {
        this.action = action;
    }
    /**
     * @param {(bot: BotEx) => boolean | void} action 
     */
    bindAction = (action) => {
        this.action = action;
    }
}