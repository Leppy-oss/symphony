const chalk = require('chalk');
const colors = require('./logger-colors');
const assert = require('assert');

module.exports = class {
    constructor(botName = null) {
        this.botName = botName;
    }
    bindBotName = (username) => {
        this.botName = username;
    }
    mcLog = (username, ...msg) => {
        console.log(`<${username}>:`, ...msg);
    }
    chatLog = (username, msg) => {
        if (!require('../../index').botUsernames.includes(username)) this.mcLog(colors.player(username), colors.chat(msg));
    }
    log = (...msg) => {
        assert(this.botName.length > 0);
        this.mcLog(colors.bot(this.botName), ...msg);
    }
    actionLog = (msg) => {
        this.log(colors.action(msg));
    }
    warningLog = (msg) => {
        this.log(colors.error(msg));
    }
    debugLog = (msg) => {
        this.log(colors.debug(msg));
    }
}