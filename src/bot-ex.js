const mineflayer = require('mineflayer');
const { Entity } = require('prismarine-entity');
const { pathfinder, Movements, goals: { GoalBlock, GoalFollow, GoalNear } } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const Logger = require('./logger');
const StateController = require('./framework/state-controller');
const vec3 = require('vec3')

module.exports = class {
    constructor(username, password, auth) {
        this.master = '';
        this.client = null;
        this.reconnect = false;
        this.loopPrevState = this.States.IDLE;
        this.botOptions = options.botOptions;
        this.connectionOptions = options.connectionOptions;
        this.connectionOptions['username'] = username;
        this.connectionOptions['password'] = password;
        this.connectionOptions['auth'] = auth;
        this.logger = new Logger(this.connectionOptions.username);
        this.controller = new StateController();
        if (process.env.MASTER !== undefined) this.setMaster(process.env.MASTER);
        this.updateIntervalID = setInterval(this.update, 100); // updates the bot 10x a second
    }
    update = () => {
        this.controller.update();
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
            this.reconnect = true;
            this.log(null, chalk.ansi256(112)('Successfully reconnected'));
        } catch (e) {
            this.log(null, chalk.ansi256(196)('Unable to reconnect, error: ' + e));
        }
    }
    init = () => {
        this.client.loadPlugin(pathfinder);
        this.client.loadPlugin(pvp);
        this.client.on('login', this.loginHandler);
        this.client.on('chat', this.chatHandler);
        this.client.on('death', this.deathHandler);
        this.client.on('end', this.endHandler); // should also handle kicks
        this.client.on('error', this.errorHandler);
        this.client.on('spawn', this.spawnHandler);
    }
    onReconnect = () => {
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
        if(this.reconnect) this.onReconnect();
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
    /**
     * @param {vec3} position 
     * @param {Number} tolerance 
     * @param {Boolean} canPlace 
     * @param {Boolean} canDig 
     */
    goto = (position, tolerance=0, canPlace=false, canDig=false) => {
        const movements = new Movements();
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
    follow = (entity, tolerance=1, canPlace=false, canDig=false) => {
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
    chatHandler = async (username, message) => {
        if (!this.botOptions.caseSensitive) message = message.toLowerCase();
        if (username === this.client.username) return;
        this.logger.chatLog(username, message);
        this.chatActions(message);
    }
    chatActions = async (message) => {}
    kickHandler = (reason) => {
        this.logger.warningLog('Bot was kicked for reason ' + reason);
        if(this.botOptions.autoReconnect) setTimeout(this.reconnect, this.botOptions.reconnectTimeout);
    }
    errorHandler = (e) => {
        this.logger.warningLog('An error occurred - ' + e);
    }
}