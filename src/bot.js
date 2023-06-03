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
require('dotenv').config({ path: '.env' });
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
            this.chatActions = this.chatActions.bind(this);
        }
        update() {
            super.update();
        }
        init() {
            super.init();
        }
        setState(state) {
            this.controller.changeState(state);
        }
        deathHandler() {
            super.deathHandler();
        }
        loginHandler() {
            super.loginHandler();
        }
        async chatActions(message) {
            await super.chatActions(message);
            if (message in commands) await commands[message].action(this)
        }
    }
};