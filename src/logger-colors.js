const chalk = require('chalk');

module.exports = {
    login: chalk.ansi256(120),
    master: chalk.ansi256(196),
    kick: chalk.ansi256(196),
    disconnect: chalk.ansi256(196),
    error: chalk.ansi256(196),
    spawn: chalk.ansi256(75),
    player: chalk.ansi256(98),
    chat: chalk.ansi256(255),
    action: chalk.ansi256(214),
    attemptReconnect: chalk.ansi256(154),
    successfulReconnect: chalk.ansi256(112),
    unsuccessfulReconnect: chalk.ansi256(196),
    bot: chalk.ansi256(201),
    death: chalk.ansi256(125),
    debug: chalk.ansi256(61)
}