const vec3 = require('vec3');
const bot = require('../base/bot-ex');
const commands = require('./villager-bot-commands');
const Command = require('../../framework/command');
require('dotenv').config({ path: '.env' });
const StateManager = require('../../framework/state');
const Bot = require('../base/bot');
const colors = require('../../util/logger-colors');
const { minecraftData, isSmeltable, canBeEnchanted, isEnchantable } = require('../../util/mcdata-ex');

module.exports = class extends Bot {
    constructor(username, password, auth) {
        super(username, password, auth, commands);
        StateManager.createState('LOOK_AT').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.logger.log(colors.action('Looking at master ').concat(colors.master(bot.master)));
                bot.client.chat('Looking at you, master');
            }
        )).setLoop(new Command(
            /**
             * @param {Bot} bot 
             */
            async (bot) => {
                const master = bot.client.players[bot.master];
                if (master) bot.client.lookAt(master.entity.position.plus(vec3(0, 1, 0)));
            }
        )).repeat(new Command(
            /**
             * @param {Bot} bot 
             */
            async (bot) => {
                return bot.controller.states.find((state) => state.name == 'STOP') !== undefined;
            }
        ));
        StateManager.createState('STOP').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.logger.actionLog('Stopping all actions');
                bot.client.chat('Stopping all actions, master');
                bot.client.pathfinder.stop();
            }
        )).repeat(new Command(
            /**
             * @param {Bot} bot 
             */
            async (bot) => {
                return bot.controller.states.find((state) => state.isDynamic()) === undefined;
            }
        )).assertStatic();
        StateManager.createState('FOLLOW').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                if (!bot.client.players[bot.master].entity) {
                    bot.client.chat('Apologies master, cannot see you');
                    return;
                }
                bot.logger.actionLog('Now following master');
                bot.client.chat('Following, master');
                bot.followMaster();
            }
        ));
        StateManager.createState('COME').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                const target = bot.client.players[bot.master].entity;
                if (!target) {
                    bot.client.chat('Apologies master, cannot see you');
                    return;
                }
                bot.logger.actionLog('Coming to master');
                bot.client.chat('Coming, master');
                await bot.goto(target.position, 0, true, true);
            }
        ));
        StateManager.createState('TRADE_NEAREST').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                console.log(bot.client.entities);
            }
        ));
        StateManager.createState('GRAB_CHEST').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.client.chat('Grabbing enchanting materials from nearest chest');
                const chest_id = minecraftData.blocksByName['chest'].id;
                const lapis_id = minecraftData.itemsByName['lapis_lazuli'].id;
                const chest_block = bot.client.findBlock({
                    matching: chest_id,
                    maxDistance: 40
                });
                if (!chest_block) {
                    bot.logger.debugLog('Could not grab enchanting mats due to no chest nearby');
                    bot.client.chat('No chests nearby!');
                    return;
                }
                if (chest_block.position.distanceTo(bot.client.entity.position) > 3) await bot.goto(chest_block.position, 1);
                const chest = await bot.client.openContainer(chest_block);
                let numDoWork = 0;
                const availableSlots = [];
                for (let slot = chest.slots.length - 36; slot < chest.slots.length; slot++) {
                    if (bot.client.inventory.slots[slot - (chest.slots.length - 36) + 10] === null) {
                        availableSlots.push(slot);
                    }
                }
                do {
                    numDoWork = 0;
                    for (const item of chest.containerItems()) {
                        if (canBeEnchanted(item) || item.type === lapis_id) {
                            await bot.client.moveSlotItem(item.slot, availableSlots.pop());
                            numDoWork++;
                        }
                    }
                } while (numDoWork > 0 && availableSlots.length > 0)
                chest.close();
            }
        ));
        StateManager.createState('PRINT').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.client.chat('Printing debug info to log');
                console.log(bot.client.inventory.items())
            }
        ));
        StateManager.createState('DISCONNECT').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.client.chat('Goodbye master');
                await bot.client.waitForTicks(10)
                bot.disconnect();
            }
        ));
        StateManager.createState('DROP_ALL').setStart(new Command(
            /**
             * @param {bot} bot 
             */
            async (bot) => {
                bot.logger.actionLog('Dropping all items');
                bot.client.chat('Dropping all my items, master');
                for (const item of bot.client.inventory.items()) await bot.client.tossStack(item);
            }
        ));
    }
}