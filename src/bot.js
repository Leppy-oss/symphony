const options = require('./bot-options');
const chalk = require('chalk');
const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const minecraftData = require('minecraft-data')('1.19');
const BotEx = require('./bot-ex');
const Logger = require('./logger');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')
const commands = require('./furnace-bot-commands');
require('dotenv').config({path:'.env'});
const StateManager = require('./framework/state');
const StateController = require('./framework/state-controller');

module.exports = {
    States: {
        IDLE: 0,
        RECONNECTING: 1,
        COMING: 2,
        FOLLOWING: 3,
        LOOK_AT: 4
    },
    Bot: class extends BotEx {
        constructor(username, password, auth) {
            super(username, password, auth);
            this.States = module.exports.States;
        }
        update = () => {
            super.update();
        }
        init = () => {
            super.init();
        }
        setState = (state) => {
            this.controller.changeState(state);
        }
        deathHandler = () => {
            super.deathHandler();
        }
        loginHandler = () => {
            super.loginHandler();
        }
        chatActions = (message) => {
            super.chatActions(message);
            if (message in commands) commands[message].action(this.client)
        }
        kickHandler = (reason) => {
            this.log(null, chalk.ansi256(196)('Bot was kicked for reason ' + reason));
            if(this.botOptions.autoReconnect) setTimeout(this.reconnect, this.botOptions.reconnectTimeout);
        }
        errorHandler = (e) => {
            this.log(null, chalk.ansi256(196)('An error occurred - ' + e))
        }
    }
};