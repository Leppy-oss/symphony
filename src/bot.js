const mineflayer = require('mineflayer');
const options = require('./bot-options');
const dotenv = require('dotenv').config({path:'.env'});

module.exports = {
    Bot: class {
        constructor() {
            this.master = '';
            this.client = null;
            this.rcC = false;
            if(process.env.MASTER !== undefined) this.setMaster(process.env.MASTER);
            this.botOptions = options.botOptions;
            this.connectionOptions = options.connectionOptions;
            this.connect();
        }
        setMaster = (master) => {
            this.master = master;
            console.log('New master: ' + master);
        }
        connect = () => {
            this.client = mineflayer.createBot(this.connectionOptions);
            this.init();
        }
        reconnect = () => {
            console.log('Attempting to reconnect');
            try {
                this.connect();
                this.rcC = true;
                console.log('Successfully reconnected');
            } catch (e) {
                console.log('Unable to reconnect, error: ' + e);
            }
        }
        init = () => {
            this.client.on('login', this.loginHandler);
            this.client.on('chat', this.chatHandler);
            this.client.on('death', this.deathHandler);
            this.client.on('end', this.endHandler); // should also handle kicks
            this.client.on('error', this.errorHandler);
        }
        onRcC = () => {
            this.client.chat('Hello world again');
        }
        deathHandler = () => {
            this.client.chat('Ow that hurt');
            console.log('Bot died');
        }
        loginHandler = () => {
            if(this.rcC) this.onRcC();
            else this.client.chat('Hello World');
            console.log('Bot successfully logged in');
        }
        chatHandler = (username, message) => {
            if (username === this.client.username) return;
            if (username === this.master) this.client.chat('Yes master');
        }
        endHandler = (e) => {
            console.log('Bot disconnected ' + e);
            if(this.botOptions.autoReconnect) setTimeout(this.reconnect, this.botOptions.reconnectTimeout);
        }
        errorHandler = (e) => {
            console.error(e);
        }
    }
};