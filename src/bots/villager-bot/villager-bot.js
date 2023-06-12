const vec3 = require('vec3');
const bot = require('../base/bot-ex');
const commands = require('./villager-bot-commands');
const Command = require('../../framework/command');
require('dotenv').config({ path: '.env' });
const StateManager = require('../../framework/state');
const Bot = require('../base/bot');
const colors = require('../../util/logger-colors');
const { minecraftData, isSmeltable, canBeEnchanted, isEnchantable, colorify, blocksByNames } = require('../../util/mcdata-ex');
const { sort } = require('../../util/entity-ex');

module.exports = class extends Bot {
    constructor(username, password, auth) {
        super(username, password, auth, commands);
        StateManager.createState('LOOK_AT').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                bot.logger.log(colors.action('Looking at master ').concat(colors.master(bot.master)));
                bot.client.chat('Looking at you');
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
                bot.client.chat('Stopping all actions');
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
                bot.client.chat('Following');
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
                bot.client.chat('Coming');
                await bot.goto(target.position, 0, true, true);
            }
        ));
        StateManager.createState('SLEEP').setStart(new Command(
            /**
             * @param {Bot} bot 
             */
            async (bot) => {
                const bedBlock = bot.client.findBlock({
                    matching: blocksByNames(colorify('bed')),
                    maxDistance: 30
                });
                if (!bedBlock) {
                    bot.client.chat('No beds within 30 blocks :(');
                    bot.logger.debugLog('No bed sufficiently close by to sleep');
                    return;
                }
                console.log(bedBlock.position);
                bot.logger.debugLog('Bed found');
                if (bedBlock.position.distanceTo(bot.client.entity.position) > 2) {
                    bot.logger.debugLog(`Heading to bed block at position ${bedBlock.position}`);
                    await bot.goto(bedBlock.position, 2);
                }
                bot.logger.debugLog('Now attempting to use bed (sleep)...');
                await bot.client.sleep(bedBlock)
                    .then(() => bot.logger.actionLog('Bot successfully used bed'))
                    .catch(async (reason) => {
                        bot.logger.debugLog(`Unable to sleep: ${reason}`);
                        bot.logger.debugLog('Attempting to at least interact with the bed');
                        await bot.client.activateBlock(bedBlock)
                            .then(() => bot.logger.actionLog('Bot successfully interacted with bed -> set respawn point'))
                            .catch((reason) => {
                                bot.client.chat(`Unable sleep because ${reason}`);
                                bot.logger.debugLog(`Unable to interact with bed: ${reason}`);
                            });
                    });
            }
        ));
        StateManager.createState('WAKE').setStart(new Command(
            /**
             * @param {Bot} bot 
             */
            async (bot) => {
                if (!bot.client.isSleeping) {
                    bot.client.chat(`I'm not sleeping`);
                    bot.logger.debugLog('Did not attempt to wake up because bot is already awake');
                    return;
                }
                bot.logger.debugLog('Attempting to wake up');
                await bot.client.wake();
                bot.logger.actionLog('Successfully woke up from bed');
            }
        ));
        StateManager.createState('TRADE').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                var villagers = [];
                const emerald_id = minecraftData.itemsByName['emerald'].id;
                const stick_id = minecraftData.itemsByName['stick'].id;
                for (const id in bot.client.entities) {
                    const entity = bot.client.entities[id];
                    if (entity.name == 'villager') villagers.push(entity);
                }
                if (villagers.length < 1) {
                    bot.logger.debugLog('No villagers nearby, unable to trade!');
                    return;
                }
                villagers = sort(bot.client.entity, villagers);
                const target = villagers.at(0); // for now, only trading with one - so nearestEntity would work, but in the future obviously the bot should trade with multiple villagers
                bot.logger.debugLog(`Going to villager at ${target.position}`);
                await bot.goto(target.position.plus(new vec3(3, 0, 0))); // assume the trading hall is aligned in the Z direction, with villagers on the negative X side of the bot, also assume there is 1 block between the bot and the villager
                const villager = await bot.client.openVillager(target);
                bot.logger.debugLog(`Successfully opened villager with id ${villager.id}`);
                let selectedTrade = null;
                for (let i = 0; i < villager.trades.length; i++) {
                    const trade = villager.trades.at(i);
                    if (trade.inputItem1.type == stick_id) selectedTrade = i;
                }
                if (selectedTrade === null || selectedTrade === undefined) {
                    bot.client.chat('Could not find acceptable trade');
                    bot.logger.debugLog('Could not find acceptable trade for sticks');
                    villager.close();
                    return;
                }
                bot.logger.debugLog(`Attempting to trade with villager using trade index ${selectedTrade}`);
                await bot.client.trade(villager, selectedTrade, 1)
                    .then(() => {
                        bot.logger.actionLog('Successfully traded with villager');
                    })
                    .catch((reason) => {
                        bot.logger.debugLog(`An error occurred while attempting to trade: ${reason}`);
                    })
                    .finally(()=> {
                        villager.close();
                    });
            }
        ));
        StateManager.createState('GRAB_CHEST').setStart(new Command(
            /**
             * @param {Bot} bot
             */
            async (bot) => {
                // using a fletcher for now
                bot.client.chat('Grabbing trading materials from nearest chest');
                const chest_id = minecraftData.blocksByName['chest'].id;
                const emerald_id = minecraftData.itemsByName['emerald'].id;
                const stick_id = minecraftData.itemsByName['stick'].id;
                const chest_block = bot.client.findBlock({
                    matching: chest_id,
                    maxDistance: 40
                });
                if (!chest_block) {
                    bot.logger.debugLog('Could not grab trading materials due to no chest nearby');
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
                        if (item.type == emerald_id || item.type == stick_id) {
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
                console.log(bot.client.inventory.items());
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
                bot.client.chat('Dropping all my items');
                for (const item of bot.client.inventory.items()) await bot.client.tossStack(item);
            }
        ));
    }
}