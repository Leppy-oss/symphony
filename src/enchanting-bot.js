const options = require('./bot-options');
const chalk = require('chalk');
const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const minecraftData = require('minecraft-data')('1.19');
const BotEx = require('./bot-ex');
const Logger = require('./logger');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')
const commands = require('./enchanting-bot-commands');
const Command = require('./command');
require('dotenv').config({ path: '.env' });
const StateManager = require('./framework/state');
const StateController = require('./framework/state-controller');
const Bot = require('./bot');

module.exports = class extends Bot {
    constructor(username, password, auth) {
        super(username, password, auth, commands);
        StateManager.createState('DISCONNECTING').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.client.chat('Goodbye master');
                await bot.client.waitForTicks(10)
                bot.disconnect();
            }
        ))
    }
}