const helpers = require('../helpers');

const cooldown = 3600000;

module.exports.run = async(client, message, args) => {
    let cd = client.checkCooldown(this.aliases[0], message.author.id);
    if (cd > 0) {
        message.reply(`wait ${Math.floor(cd / 60000)} minutes and ${(cd % 60000) / 1000} seconds before using this command again.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let hourlyResult = generateDailyReward();
    client.changeItemAmountFor(message.author.id, hourlyResult.item1, hourlyResult.amount1);

    client.startCooldown(this.aliases[0], message.author.id, new Date().getTime() + cooldown);

    message.reply(`you got ${hourlyResult.item1}x${hourlyResult.amount1}.`).catch(console.error);
};

module.exports.aliases = ['hourly'];
module.exports.permissions = ['SEND_MESSAGES'];

function generateDailyReward() {
    return {
        item1: '💰',
        amount1: helpers.getRandomInt(1, 51),
    };
    //TODO: generate a lookup table for random items that is based on 1000 / basePrice. This way cheap items have a high chance of appearing.
}
