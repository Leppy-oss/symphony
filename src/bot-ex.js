const mineflayer = require('mineflayer');
const { Entity } = require('prismarine-entity');
const { pathfinder, Movements, goals: { GoalBlock, GoalFollow, GoalNear } } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const options = require('./bot-options');
const colors = require('./logger-colors');
require('dotenv').config('.env');
const Logger = require('./logger');
const chalk = require('chalk');
const StateController = require('./framework/state-controller');
const vec3 = require('vec3')

module.exports = class {
    constructor(username, password, auth) {
        this.master = '';
        this.client = null;
        this.reconnecting = false;
        this.botOptions = options.botOptions;
        this.connectionOptions = options.connectionOptions;
        this.connectionOptions['username'] = username;
        this.connectionOptions['password'] = password;
        this.connectionOptions['auth'] = auth;

        this.update = this.update.bind(this);
        this.setMaster = this.setMaster.bind(this);
        this.connect = this.connect.bind(this);
        this.init = this.init.bind(this);
        this.reconnect = this.reconnect.bind(this);
        this.onReconnect = this.onReconnect.bind(this);
        this.spawnHandler = this.spawnHandler.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.endHandler = this.endHandler.bind(this);
        this.loginHandler = this.loginHandler.bind(this);
        this.getMaster = this.getMaster.bind(this);
        this.followMaster = this.followMaster.bind(this);
        this.goto = this.goto.bind(this);
        this.chatHandler = this.chatHandler.bind(this);
        this.chatActions = this.chatActions.bind(this);
        this.kickHandler = this.kickHandler.bind(this);
        this.errorHandler = this.errorHandler.bind(this);

        this.logger = new Logger(this.connectionOptions.username);
        this.controller = new StateController();
        if (process.env.MASTER !== undefined) this.setMaster(process.env.MASTER);
        this.updateIntervalID = setInterval(this.update, 100); // updates the bot 10x a second
    }
    update() {
        this.controller.update();
    }
    setMaster(master) {
        this.master = master;
        this.logger.log(`New master, ${colors.master(master)}`);
    }
    connect() {
        this.client = mineflayer.createBot(this.connectionOptions);
        this.init();
    }
    reconnect() {
        this.logger.log(colors.attemptReconnect('Attempting to reconnect'));
        try {
            this.connect();
            this.reconnecting = true;
            this.logger.log(colors.successfulReconnect('Successfully reconnected'));
        } catch (e) {
            this.logger.log(colors.unsuccessfulReconnect('Unable to reconnect, error: ' + e));
        }
    }
    init() {
        this.client.loadPlugin(pathfinder);
        this.client.loadPlugin(pvp);
        this.client.on('login', this.loginHandler);
        this.client.on('chat', this.chatHandler);
        this.client.on('death', this.deathHandler);
        this.client.on('end', this.endHandler); // should also handle kicks
        this.client.on('error', this.errorHandler);
        this.client.on('spawn', this.spawnHandler);
    }
    onReconnect() {
        this.client.chat('Hello world again');
    }
    spawnHandler() {
        this.logger.log(colors.spawn('Bot spawned in'));
    }
    disconnect() { // will NOT attempt to reconnect, no matter what. this terminates the process.
        this.client.quit();
        clearInterval(this.updateIntervalID);
        // process.exit();
    }
    endHandler(reason) {
        if (reason === 'socketClosed') this.kickHandler(reason);
        else this.logger.log(colors.disconnect('Bot disconnected'));
    }
    deathHandler() {
        this.client.chat('Ow that hurt');
        this.logger.log(colors.death('Bot died'));
    }
    loginHandler() {
        if (this.reconnecting) this.onReconnect();
        else this.client.chat('Hello World');
        this.logger.log(colors.login('Bot successfully logged in'));
        if (this.botOptions.viewer) mineflayerViewer(this.client, { port: 1234, firstPerson: false });
    }
    getMaster() {
        if (this.master != '') return this.client.players[this.master];
    }
    followMaster() {
            const master = this.getMaster();
            if (master) this.follow(master, 1, true, true);
            return master;
        }
        /**
         * @param {vec3} position 
         * @param {Number} tolerance 
         * @param {Boolean} canPlace 
         * @param {Boolean} canDig 
         */
    goto(position, tolerance = 0, canPlace = false, canDig = false) {
            const movements = new Movements(this.client);
            movements.allowParkour = true;
            movements.allowSprinting = true;
            movements.canDig = canDig;
            if (!canPlace) movements.scafoldingBlocks.length = 0;
            movements.maxDropDown = 6;
            movements.liquidCost = 5; // Try to avoid liquids
            this.client.pathfinder.setMovements(movements);
            const { x: tX, y: tY, z: tZ } = position;
            const goal = new GoalNear(tX, tY, tZ, tolerance);
            this.client.pathfinder.setGoal(goal);
        }
        /**
         * @param {Entity} entity 
         * @param {Number} tolerance 
         * @param {Boolean} canPlace 
         * @param {Boolean} canDig 
         */
    follow(entity, tolerance = 1, canPlace = false, canDig = false) {
        const movements = new Movements();
        movement.allowParkour = true;
        movement.allowSprinting = true;
        movement.canDig = canDig;
        if (!canPlace) movements.scafoldingBlocks.length = 0;
        movement.maxDropDown = 6;
        movement.liquidCost = 5; // Try to avoid liquids
        this.client.pathfinder.setMovements(movements);
        const goal = new GoalFollow(entity, tolerance);
        this.client.pathfinder.setGoal(goal);
    }
    async chatHandler(username, message) {
        if (!this.botOptions.caseSensitive) message = message.toLowerCase();
        if (username === this.client.username) return;
        this.logger.chatLog(username, message);
        await this.chatActions(message);
    }
    async chatActions(message) {}
    kickHandler(reason) {
        this.logger.warningLog('Bot was kicked for reason ' + reason);
        if (this.botOptions.autoReconnect) setTimeout(this.reconnect, this.botOptions.reconnectTimeout);
    }
    errorHandler(e) {
        this.logger.warningLog('An error occurred - ' + e);
    }
}