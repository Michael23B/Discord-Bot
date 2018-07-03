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

    let price = stocks.getCurrentPrices()[args[0]];
    //Check if an item exists
    if (!price) {
        message.reply('I couldn\'t find that item. You can see items to buy using `>stocks`.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let totalCost = price * parseInt(args[1]);
    let inventory = client.getInventoryFor(message.author.id);
    //Check if the user can afford the items
    if (inventory['💰'] - totalCost < 0) {
        message.reply(`you don't have that much. You have 💰x${inventory['💰']}.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    //Check if the user has purchased too many items this period
    let itemsLeft = checkAndUpdateLimit(message.author.id, args[1]);
    if (itemsLeft === -1) {
        message.reply(`you can purchase no more than ${maxItemPerAdjust} items each time the market adjusts.` +
            ` You can purchase ${checkAndUpdateLimit(message.author.id, 0)} more items this period.` +
            ` The next period begins at ${new Date(nextAdjustTime).toLocaleTimeString('en-AU', {timeZone: 'Australia/Queensland'})}.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    //Finally, purchase the item
    client.changeItemAmountFor(message.author.id, '💰', totalCost * -1);
    client.changeItemAmountFor(message.author.id, args[0], parseInt(args[1]));
    message.reply(`you purchased ${args[0]}x${args[1]} for 💰x${totalCost}.`).catch(console.error);
};

module.exports.aliases = ['buy', 'purchase'];
module.exports.permissions = ['SEND_MESSAGES'];

function checkAndUpdateLimit(userId, amount) {
    if (!itemUserMap.hasOwnProperty(userId)) {
        itemUserMap[userId] = maxItemPerAdjust;
    }

    if (itemUserMap[userId] - parseInt(amount) < 0) return -1;

    itemUserMap[userId] -= parseInt(amount);
    return itemUserMap[userId];
}
