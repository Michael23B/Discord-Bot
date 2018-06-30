const helpers = require('../helpers');

const cooldown = 10000;

module.exports.run = async(client, message, args) => {
    let cd = client.checkCooldown(this.aliases[0], message.author.id);
    if (cd > 0) {
        message.reply(`wait ${cd / 1000} seconds before using this command again.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let inventory = client.getInventoryFor(message.author.id);
    if (args[0] === 'all') args[0] = inventory['💰'];

    if (!args[0] || isNaN(args[0]) || args[0] < 1) {
        message.reply('specify the amount to bet. `>g [amount to bet]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    if (inventory['💰'] - args[0] < 0) {
        message.reply(`you don't have that much. You have 💰x${inventory['💰']}`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let gambleResult = getGambleMultiplier();
    let reply;

    switch (gambleResult) {
        case 4:
            reply = `🎰 Jackpot! 🎰 You earned 💰x${args[0] * 4}. 🎉🎉🎉`;
            break;
        case 1:
            reply = `you earned 💰x${args[0]}.`;
            break;
        case -1:
            reply = `you lost 💰x${args[0]}.`;
            break;
    }

    message.reply(reply).catch(console.error);

    client.changeItemAmountFor(message.author.id, '💰', args[0] * gambleResult);
    client.startCooldown(this.aliases[0], message.author.id, new Date().getTime() + cooldown);
};

module.exports.aliases = ['gamble', 'bet', 'g'];
module.exports.permissions = ['SEND_MESSAGES'];

function getGambleMultiplier() {
    let randInt = helpers.getRandomInt(1,21);

    if (randInt === 20) return 4;
    else if (randInt > 11) return 1;
    else return -1;
}
