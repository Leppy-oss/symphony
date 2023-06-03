const mineflayer = require('mineflayer');
const Logger = require('./logger');

module.exports = class {
    /**
     * @param {function(mineflayer.Bot, Logger)} action 
     */
    constructor(action) {
        this.action = action;
    }
    /**
     * @param {function(mineflayer.Bot)} action 
     */
    bindAction = (action) => {
        this.action = action;
    }
}