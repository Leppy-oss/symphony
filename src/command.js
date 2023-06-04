const mineflayer = require('mineflayer');
const Logger = require('./logger');
const BotEx = require('./bot-ex');

module.exports = class {
    /**
     * @param {function(BotEx)} action 
     */
    constructor(action) {
        this.action = action;
    }
    /**
     * @param {function(BotEx)} action 
     */
    bindAction = (action) => {
        this.action = action;
    }
}