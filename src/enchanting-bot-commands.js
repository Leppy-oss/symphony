const chalk = require('chalk');
const Command = require('./command');
const BotEx = require('./bot-ex');
const colors = require('./logger-colors');
const { minecraftData, isSmeltable, canBeEnchanted, isEnchantable } = require('./util/mcdata-ex');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')

module.exports = {
    'open etable': new Command(
        /**
         * @param {BotEx} botEx 
         */
        async (botEx) => {
            const table_id = minecraftData.blocksByName['enchanting_table'].id;
            const lapis_id = minecraftData.itemsByName['lapis_lazuli'].id;
            const table_block = botEx.client.findBlock({
                matching: table_id,
                maxDistance: 20
            });
            if (table_block.position.distanceTo(botEx.client.entity.position) > 3) await botEx.goto(table_block.position, 1);
            const table = await botEx.client.openEnchantmentTable(table_block);
            botEx.logger.debugLog(`Bot currently has ${botEx.client.experience.level} levels`);
            const lapis = table.items().find(item => item.type == lapis_id);
            const sword = table.items().find(item => item.name.includes('sword') && isEnchantable(item));

            if (lapis && sword) {
                botEx.logger.actionLog('Attempting to enchant sword with 3rd tier enchantment');
                await botEx.client.moveSlotItem(sword.slot, 0);
                await botEx.client.moveSlotItem(lapis.slot, 1);
                await botEx.client.waitForTicks(10);
                await table.enchant(2);
                botEx.logger.actionLog('Enchanted item');
                await botEx.client.waitForTicks(10);
                await botEx.client.moveSlotItem(0, 2);
                await botEx.client.moveSlotItem(1, 3);
                botEx.logger.actionLog('Completed enchanting sequence');
            }
            table.close();
        }
    ),
    'grab chest': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.client.chat('Grabbing smeltable items from nearest chest');
            const chest_id = minecraftData.blocksByName['chest'].id;
            const lapis_id = minecraftData.itemsByName['lapis_lazuli'].id;
            const chest = await botEx.client.openContainer(botEx.client.findBlock({
                matching: chest_id,
                maxDistance: 5
            }));
            for (item of chest.containerItems()) {
                if (isSmeltable(item) || canBeEnchanted(item) || item.type === lapis_id) await chest.withdraw(item.type, null, chest.containerCount(item.type));
                console.log(chest.slots);
            }
            chest.close();
        }),
    'print': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.client.chat('Printing debug info to log');
            console.log(botEx.client.inventory.items())
        }),
    'kys': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.client.chat('Goodbye master');
            await botEx.client.waitForTicks(10)
            botEx.disconnect();
        }),
    'come': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
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
        async (botEx) => {
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
        async (botEx) => {
            botEx.logger.actionLog('Stopping all actions');
            botEx.client.chat('Stopping all actions, master');
        }),
    'look at me': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.logger.log(chalk.ansi256(colors.action)('Looking at master ').concat(chalk.ansi256(colors.master)(botEx.master)));
            botEx.client.chat('Looking at you, master');
        })
}