const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: 'localhost',
    port: '60021',
    username: 'est_bot',
    password: '',
    version: '1.19'
});

bot.on('login', () => {
    console.log('Bot successfully logged in');
});

bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    bot.chat(message);
});

bot.on('kicked', console.log);
bot.on('error', console.log);