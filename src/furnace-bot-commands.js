const mineflayer = require('mineflayer');
const mcData = require('minecraft-data')('1.19');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')

module.exports = {
    'grab chest': {
        reply: 'Grabbing coal and raw iron from nearest chest',
        /**
         * @param {mineflayer.Bot} bot 
         */
        action: async (bot) => {
            const chest_id = mcData.blocksByName['chest'].id;
            const coal_id = mcData.itemsByName['coal'].id;
            const iron_id = mcData.itemsByName['raw_iron'].id;
            const chest = await bot.openContainer(bot.findBlock({
                matching: chest_id,
                maxDistance: 5
            }));
            await chest.withdraw(coal_id, null, Math.max(chest.containerCount(coal_id))).catch((e) => {
                console.log('no coal in chest');
            });
            await chest.withdraw(iron_id, null, Math.max(64, chest.containerCount(iron_id))).catch((e) => {
                console.log('no iron in chest');
            });
            chest.close();
        }
    },
    'put furnace': {
        reply: 'Putting items in furnace',
        /**
         * @param {mineflayer.Bot} bot 
         */
        action: async (bot) => {
            const furnace_id = mcData.blocksByName['furnace'].id;
            const coal_id = mcData.itemsByName['coal'].id;
            const iron_id = mcData.itemsByName['raw_iron'].id;
            console.log(mcData.itemsByName['raw_iron'])
            const furnace = await bot.openFurnace(bot.findBlock({
                matching: furnace_id,
                maxDistance: 5
            }));
            await furnace.putFuel(coal_id, null, Math.max(64, bot.inventory.containerCount(coal_id)));
            await furnace.putInput(iron_id, null, Math.max(64, bot.inventory.containerCount(iron_id)));
        }
    },
    'grab furnace': {
        reply: 'Grabbing items from furnace',
        /**
         * @param {mineflayer.Bot} bot 
         */
        action: async (bot) => {
            const furnace_id = mcData.blocksByName['furnace'].id;
            const furnace = await bot.openFurnace(bot.findBlock({
                matching: furnace_id,
                maxDistance: 5
            }));
            await furnace.takeOutput();
            bot.chat('Successfully took items from furnace');
        }
    },
    'print': {
        reply: 'Printing debug info to console.log',
        /**
         * @param {mineflayer.Bot} bot
         */
        action: async (bot) => {
            console.log(bot.inventory.items())
        }
    }
}