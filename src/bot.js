const options = require('./bot-options');
const chalk = require('chalk');
const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
require('dotenv').config({path:'.env'});

module.exports = {
    States: {
        IDLE: 0,
        RECONNECTING: 1,
        COMING: 2,
        FOLLOWING: 3,
    },
    Bot: class {
        constructor(username, password, auth) {
            this.States = module.exports.States;
            this.master = '';
            this.client = null;
            this.rcC = false;
            this.state = this.States.IDLE;
            if(process.env.MASTER !== undefined) this.setMaster(process.env.MASTER);
            this.botOptions = options.botOptions;
            this.connectionOptions = options.connectionOptions;
            this.connectionOptions['username'] = username;
            this.connectionOptions['password'] = password;
            this.connectionOptions['auth'] = auth;
            this.updateIntervalID = setInterval(this.update, 100); // updates the bot 10x a second
        }
        log = (username, ...msg) => {
            console.log(`<${username}>:`, ...msg);
        }
        update = () => {
            if (this.state == this.States.FOLLOWING) {
                const target = this.client.players[this.master].entity;
                if (target) this.pathTo(target.position);
            }
            else if (this.state == this.States.IDLE) {
                print('stop');
                this.client.pathfinder.stop();
            }
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
            this.client.loadPlugin(pathfinder);
            this.client.on('login', this.loginHandler);
            this.client.on('chat', this.chatHandler);
            this.client.on('death', this.deathHandler);
            this.client.on('kick', this.kickHandler); // should also handle kicks
            this.client.on('end', this.endHandler); // should also handle kicks
            this.client.on('error', this.errorHandler);
            this.client.on('spawn', this.spawnHandler);
        }
        setState = (state) => {
            this.state = state;
        }
        onRcC = () => {
            this.client.chat('Hello world again');
        }
        spawnHandler = () => {
            console.log('Bot spawned in');
        }
        disconnect = () => { // will NOT attempt to reconnect, no matter what. this terminates the process.
            this.client.quit();
            clearInterval(this.updateIntervalID);
            process.exit();
        }
        endHandler = (reason) => {
            if(reason === 'socketClosed') this.kickHandler();
            else console.log('Bot disconnected');
        }
        deathHandler = () => {
            this.client.chat('Ow that hurt');
            console.log('Bot died');
        }
        loginHandler = () => {
            if(this.rcC) this.onRcC();
            else this.client.chat('Hello World');
            this.log(this.connectionOptions.username, chalk.ansi256(46)('Bot successfully logged in'));
            if(this.botOptions.viewer) mineflayerViewer(this.client, { port: 1234, firstPerson: false });
        }
        pathTo = (position, movement=new Movements(this.client), tolerance=1) => {
            const { x: tX, y: tY, z: tZ } = position;
            this.client.pathfinder.setMovements(movement);
            this.client.pathfinder.setGoal(new GoalNear(tX, tY, tZ, tolerance));
        }
        chatLog = (username, ...msg) => {
            if (!require('../index').botUsernames.includes(username)) this.log(chalk.ansi256(98)(username), ...msg);
        }
        chatHandler = (username, message) => {
            if (!this.botOptions.caseSensitive) message = message.toLowerCase();
            if (username === this.client.username) return;
            this.chatLog(username, message);
            if (username === this.master) {
                this.client.chat('Yes master');
                if (message === 'kys') {
                    this.client.chat('Goodbye master');
                    this.client.waitForTicks(10).then(this.client.quit);
                }
                else if (message === 'come') {
                    this.setState(this.States.COMING);
                    const target = this.client.players[this.master].entity;
                    if (!target) {
                        this.client.chat('Apologies master, cannot see you, master');
                        return
                    }
                    this.client.chat('Coming, master');
                    this.pathTo(target.position);
                }
                else if (message === 'follow') {
                    this.setState(this.States.FOLLOWING);
                    if (!this.client.players[this.master].entity) this.client.chat('Apologies master, cannot see you, master');
                    this.client.chat('Following, master');
                }
                else if (message === 'stop') {
                    this.setState(this.States.IDLE);
                    this.client.chat('Stopping all actions, master');
                }
            }
        }
        kickHandler = (e) => {
            console.log('Bot was kicked ' + e);
            if(this.botOptions.autoReconnect) setTimeout(this.reconnect, this.botOptions.reconnectTimeout);
        }
        errorHandler = (e) => {
            console.error(e);
        }
    }
};