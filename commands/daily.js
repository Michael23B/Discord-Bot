const helpers = require('../helpers');

const cooldown = 86400000;

module.exports.run = async(client, message, args) => {
    let cd = client.checkCooldown(this.aliases[0], message.author.id);
    if (cd > 0) {
        message.reply(`wait ${Math.floor(cd / 60000)} minutes and ${(cd % 60000) / 1000} seconds before using this command again.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let dailyResult = generateDailyReward();
    client.changeItemAmountFor(message.author.id, dailyResult.item1, dailyResult.amount1);
    client.changeItemAmountFor(message.author.id, dailyResult.item2, dailyResult.amount2);

    client.startCooldown(this.aliases[0], message.author.id, new Date().getTime() + cooldown);

    message.reply(`You got ${dailyResult.item1}x${dailyResult.amount1} and ${dailyResult.item2}x${dailyResult.amount2}.`)
        .catch(console.error);
};

module.exports.aliases = ['daily'];
module.exports.permissions = ['SEND_MESSAGES'];

function generateDailyReward() {
    return {
        item1: '💰',
        amount1: helpers.getRandomInt(50, 151),
        item2: helpers.items[helpers.getRandomInt(1, 11)],
        amount2: helpers.getRandomInt(1, 4)
    };
    //TODO: generate a lookup table for random items that is based on 1000 / basePrice. This way cheap items have a high chance of appearing.
}
