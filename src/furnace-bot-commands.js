const mineflayer = require('mineflayer');
const Logger = require('./logger');
const Command = require('./command-pair');
const { minecraftData, isSmeltable } = require('./util/mcdata-ex');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')

module.exports = {
    'grab chest': new Command(
        /**
         * @param {mineflayer.Bot} bot 
         * @param {Logger} logger
         */
        async (bot, logger) => {
            bot.chat('Grabbing smeltable items from nearest chest');
            const chest_id = minecraftData.blocksByName['chest'].id;
            const chest = await bot.openContainer(bot.findBlock({
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
         * @param {mineflayer.Bot} bot
         * @param {Logger} logger
         */
        async (bot, logger) => {
            bot.chat('Printing debug info to log');
            console.log(bot.inventory.items())
        })
}