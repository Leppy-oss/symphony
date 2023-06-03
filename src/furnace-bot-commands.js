const mineflayer = require('mineflayer');
const Logger = require('./logger');
const Command = require('./command-pair');
const BotEx = require('./bot-ex');
const { minecraftData, isSmeltable } = require('./util/mcdata-ex');
const { pathfinder, Movements, goals: { GoalNear, GoalFollow }, goals } = require('mineflayer-pathfinder')

module.exports = {
    'grab chest': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.client.chat('Grabbing smeltable items from nearest chest');
            const chest_id = minecraftData.blocksByName['chest'].id;
            const chest = await botEx.client.openContainer(botEx.client.findBlock({
                matching: chest_id,
                maxDistance: 5
            }));
            for (item of chest.containerItems()) {
                if (isSmeltable(item)) await chest.withdraw(item.type, null, chest.containerCount(item.type));
            }
            chest.close();
        }),
    'print': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.client.chat('Printing debug info to log');
            console.log(botEx.client.inventory.items())
        }),
    'kys': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            botEx.client.chat('Goodbye master');
            botEx.client.waitForTicks(10).then(this.disconnect);
        }),
    'come': new Command(
        /**
         * @param {BotEx} botEx
         */
        async (botEx) => {
            this.setState(this.States.COMING);
            const target = botEx.client.players[this.master].entity;
            if (!target) {
                botEx.client.chat('Apologies master, cannot see you');
                return;
            }
            this.log(null, chalk.ansi256(214)('Coming to master'));
            botEx.client.chat('Coming, master');
            this.pathTo(target);
        })
    'follow') {
            this.setState(this.States.FOLLOWING);
            if (!botEx.client.players[this.master].entity) {
                botEx.client.chat('Apologies master, cannot see you');
                return;
            }
            this.log(null, chalk.ansi256(214)('Now following master'));
            this.followMaster();
            botEx.client.chat('Following, master');
        }
        else if (message === 'stop') {
            this.log(null, chalk.ansi256(214)('Stopping all actions'));
            this.setState(this.States.IDLE);
            botEx.client.chat('Stopping all actions, master');
        }
        else if (message === 'look at me') {
            this.log(null, chalk.ansi256(214)('Looking at master ').concat(chalk.ansi256(196)(this.master)));
            this.setState(this.States.LOOK_AT);
            botEx.client.chat('Looking at you, master');
        }
}