const options = require('./bot-options');
const chalk = require('chalk');
const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const minecraftData = require('minecraft-data')('1.19');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')
const commands = require('./furnace-bot-commands');
require('dotenv').config({path:'.env'});

module.exports = {
    States: {
        IDLE: 0,
        RECONNECTING: 1,
        COMING: 2,
        FOLLOWING: 3,
        LOOK_AT: 4
    },
    Bot: class {
        constructor(username, password, auth) {
            this.States = module.exports.States;
            this.master = '';
            this.client = null;
            this.rcC = false;
            this.stateList = this.States.IDLE;
            this.prevState = this.States.IDLE;
            this.loopPrevState = this.States.IDLE;
            this.botOptions = options.botOptions;
            this.connectionOptions = options.connectionOptions;
            this.connectionOptions['username'] = username;
            this.connectionOptions['password'] = password;
            this.connectionOptions['auth'] = auth;
            if(process.env.MASTER !== undefined) this.setMaster(process.env.MASTER);
            this.updateIntervalID = setInterval(this.update, 100); // updates the bot 10x a second
        }
        log = (username, ...msg) => {
            if (username === null) username = chalk.ansi256(201)(this.connectionOptions.username);
            console.log(`<${username}>:`, ...msg);
        }
        update = () => {
            try {
                switch (this.state) {
                    case this.States.FOLLOWING: {
                        break;
                    }
                    case this.States.IDLE: {
                        if (this.loopPrevState != this.States.IDLE) {
                            this.client.pathfinder.stop();
                        }
                        break;
                    }
                    case this.States.LOOK_AT: {
                        const target = this.client.players[this.master].entity;
                        this.client.lookAt(target.position.plus(vec3(0, 1.5, 0)));
                        break;
                    }
                }
                this.loopPrevState = this.state;
            } catch(e) {}
        }
        setMaster = (master) => {
            this.master = master;
            this.log(null, `New master, ${chalk.ansi256(196)(master)}`);
        }
        connect = () => {
            this.client = mineflayer.createBot(this.connectionOptions);
            this.init();
        }
        reconnect = () => {
            this.log(null, chalk.ansi256(154)('Attempting to reconnect'));
            try {
                this.connect();
                this.rcC = true;
                this.log(null, chalk.ansi256(112)('Successfully reconnected'));
            } catch (e) {
                this.log(null, chalk.ansi256(196)('Unable to reconnect, error: ' + e));
            }
        }
        init = () => {
            this.client.loadPlugin(pathfinder);
            this.client.on('login', this.loginHandler);
            this.client.on('chat', this.chatHandler);
            this.client.on('death', this.deathHandler);
            this.client.on('end', this.endHandler); // should also handle kicks
            this.client.on('error', this.errorHandler);
            this.client.on('spawn', this.spawnHandler);
        }
        setState = (state) => {
            this.prevState = this.state;
            this.state = state;
        }
        onRcC = () => {
            this.client.chat('Hello world again');
        }
        spawnHandler = () => {
            this.log(null, chalk.ansi256(75)('Bot spawned in'));
        }
        disconnect = () => { // will NOT attempt to reconnect, no matter what. this terminates the process.
            this.client.quit();
            clearInterval(this.updateIntervalID);
            // process.exit();
        }
        endHandler = (reason) => {
            if(reason === 'socketClosed') this.kickHandler(reason);
            else this.log(null, chalk.ansi256(196)('Bot disconnected'));
        }
        deathHandler = () => {
            this.client.chat('Ow that hurt');
            this.log(null, chalk.ansi256(125)('Bot died'));
        }
        loginHandler = () => {
            if(this.rcC) this.onRcC();
            else this.client.chat('Hello World');
            this.log(null, chalk.ansi256(120)('Bot successfully logged in'));
            if(this.botOptions.viewer) mineflayerViewer(this.client, { port: 1234, firstPerson: false });
        }
        getMaster = () => {
            if(this.master != '') return this.client.players[this.master];
        }
        followMaster = () => {
            const master = this.getMaster();
            if (master) this.pathTo(master.entity, true);
            return master;
        }
        pathTo = async (entity, follow=false, tolerance=1, movement=new Movements(this.client)) => {
            movement.allowParkour = true;
            movement.allowSprinting = true;
            movement.canDig = true;
            movement.maxDropDown = 6;
            movement.liquidCost = 5;
            const { x: tX, y: tY, z: tZ } = entity.position;
            this.client.pathfinder.setMovements(movement);
            const goal = follow? new GoalFollow(entity, tolerance) : new GoalNear(tX, tY, tZ, tolerance);
            this.client.pathfinder.setGoal(goal, true);
        }
        chatLog = (username, ...msg) => {
            if (!require('../index').botUsernames.includes(username)) this.log(chalk.ansi256(98)(username), ...msg);
        }
        chatHandler = async (username, message) => {
            if (!this.botOptions.caseSensitive) message = message.toLowerCase();
            if (username === this.client.username) return;
            this.chatLog(username, message);
            if (username === this.master) {
                if (message in commands) {
                    this.client.chat(commands[message].reply);
                    await commands[message].action(this.client);
                }
                if (message === 'kys') {
                    this.client.chat('Goodbye master');
                    this.client.waitForTicks(10).then(this.disconnect);
                }
                else if (message === 'come') {
                    this.setState(this.States.COMING);
                    const target = this.client.players[this.master].entity;
                    if (!target) {
                        this.client.chat('Apologies master, cannot see you');
                        return;
                    }
                    this.log(null, chalk.ansi256(214)('Coming to master'));
                    this.client.chat('Coming, master');
                    this.pathTo(target);
                }
                else if (message === 'follow') {
                    this.setState(this.States.FOLLOWING);
                    if (!this.client.players[this.master].entity) {
                        this.client.chat('Apologies master, cannot see you');
                        return;
                    }
                    this.log(null, chalk.ansi256(214)('Now following master'));
                    this.followMaster();
                    this.client.chat('Following, master');
                }
                else if (message === 'stop') {
                    this.log(null, chalk.ansi256(214)('Stopping all actions'));
                    this.setState(this.States.IDLE);
                    this.client.chat('Stopping all actions, master');
                }
                else if (message === 'look at me') {
                    this.log(null, chalk.ansi256(214)('Looking at master ').concat(chalk.ansi256(196)(this.master)));
                    this.setState(this.States.LOOK_AT);
                    this.client.chat('Looking at you, master');
                }
            }
        }
        kickHandler = (reason) => {
            this.log(null, chalk.ansi256(196)('Bot was kicked for reason ' + reason));
            if(this.botOptions.autoReconnect) setTimeout(this.reconnect, this.botOptions.reconnectTimeout);
        }
        errorHandler = (e) => {
            this.log(null, chalk.ansi256(196)('An error occurred - ' + e))
        }
    }
};