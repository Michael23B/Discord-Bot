const stocks = require('./stocks.js');

const maxItemPerAdjust = 1000;
let itemUserMap = {};

let nextAdjustTime;

module.exports.run = async(client, message, args) => {
    if (!args[0] || !args[1] || isNaN(args[1]) || args[1] < 1) {
        message.reply('supply an item and amount to buy. You can see items to buy using `>stocks`. `>buy [item] [amount]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    //We limit the number of items a user can buy each adjust period, reset it if we are no longer in the same period
    if (nextAdjustTime !== stocks.getNextAdjustTime()) {
        itemUserMap = {};
        nextAdjustTime = stocks.getNextAdjustTime();
    }

    //check map for item purchase limit here

    let price = stocks.getCurrentPrices()[args[0]];

    if (!price) {
        message.reply('I couldn\'t find that item. You can see items to buy using `>stocks`.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let totalCost = price * parseInt(args[1]);
    let inventory = client.getInventoryFor(message.author.id);

    if (inventory['💰'] - price < 0) {
        message.reply(`you don't have that much. You have 💰x${inventory['💰']}`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    client.changeItemAmountFor(message.author.id, '💰', totalCost * -1);
    client.changeItemAmountFor(message.author.id, args[0], parseInt(args[1]));
    message.reply(`you purchased ${args[1]}x${args[0]} for 💰x${totalCost}.`).catch(console.error);
};

module.exports.aliases = ['buy', 'purchase'];
module.exports.permissions = ['SEND_MESSAGES'];
