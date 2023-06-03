const chalk = require('chalk');
const colors = require('./logger-colors');
const assert = require('assert');

module.exports = class {
    constructor(botName=null) {
        this.botName = botName;
    }
    bindBotName = (username) => {
        this.botName = username;
    }
    mcLog = (username, ...msg) => {
        console.log(`<${username}>:`, ...msg);
    }
    chatLog = (username, msg) => {
        if (!require('../index').botUsernames.includes(username)) this.mcLog(chalk.ansi256(colors.player)(username), chalk.ansi256(colors.chat)(msg));
    }
    log = (...msg) => {
        assert(this.botName.length > 0);
        this.mcLog(chalk.ansi256(colors.bot)(this.botName), msg);
    }
    actionLog = (msg) => {
        this.log(chalk.ansi256(colors.action)(msg));
    }
    warningLog = (msg) => {
        this.log(chalk.ansi256(colors.error)(msg));
    }
}