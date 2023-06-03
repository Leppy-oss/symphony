const mineflayer = require('mineflayer');
const Logger = require('./logger');
const Command = require('./command-pair');
const BotEx = require('./bot-ex');
const colors = require('./logger-colors');
const { minecraftData, isSmeltable } = require('./util/mcdata-ex');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')

module.exports = {
    'grab chest': new Command(
        /**
         * @param {BotEx} botEx
         */
        async(botEx) => {
            botEx.client.chat('Grabbing smeltable items from nearest chest');
            const chest_id = minecraftData.blocksByName['chest'].id;
            const chest = await botEx.client.openContainer(botEx.client.findBlock({
                matching: chest_id,
                maxDistance: 5
            }));
            for (item of chest.containerItems()) {
                if (isSmeltable(item)) await chest.withdraw(item.type, null, chest.containerCount(item.type));
            }
            chest.close();
        }),
    'print': new Command(
        /**
         * @param {BotEx} botEx
         */
        async(botEx) => {
            botEx.client.chat('Printing debug info to log');
            console.log(botEx.client.inventory.items())
        }),
    'kys': new Command(
        /**
         * @param {BotEx} botEx
         */
        async(botEx) => {
            botEx.client.chat('Goodbye master');
            await botEx.client.waitForTicks(10)
            botEx.disconnect();
        }),
    'come': new Command(
        /**
         * @param {BotEx} botEx
         */
        async(botEx) => {
            const target = botEx.client.players[botEx.master].entity;
            if (!target) {
                botEx.client.chat('Apologies master, cannot see you');
                return;
            }
            botEx.logger.actionLog('Coming to master');
            botEx.client.chat('Coming, master');
            botEx.goto(target.position, 0, true, true);
        }),
    'follow': new Command(
        /**
         * @param {BotEx} botEx 
         */
        async(botEx) => {
            if (!botEx.client.players[botEx.master].entity) {
                botEx.client.chat('Apologies master, cannot see you');
                return;
            }
            botEx.logger.actionLog('Now following master');
            botEx.client.chat('Following, master');
            botEx.followMaster();
        }),
    'stop': new Command(
        /**
         * @param {BotEx} botEx 
         */
        async(botEx) => {
            botEx.logger.actionLog('Stopping all actions');
            botEx.setState(botEx.States.IDLE);
            botEx.client.chat('Stopping all actions, master');
        }),
    'look at me': new Command(
        /**
         * @param {BotEx} botEx
         */
        async(botEx) => {
            botEx.logger.log(chalk.ansi256(colors.action)('Looking at master ').concat(chalk.ansi256(colors.master)(botEx.master)));
            botEx.setState(botEx.States.LOOK_AT);
            botEx.client.chat('Looking at you, master');
        })
}