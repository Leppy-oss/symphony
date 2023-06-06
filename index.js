const mineflayer = require('mineflayer');
const EnchantingBot = require('./src/bots/enchanting-bot/enchanting-bot');

module.exports = {
    bots: [],
    botUsernames: []
}

const numBots = 1;
for (var i = 0; i < numBots; i++) {
    const bot = new EnchantingBot('Test_Bot_'+i, '', 'offline');
    bot.connect();
    module.exports.bots.push(bot);
    module.exports.botUsernames.push(bot.connectionOptions.username);
}