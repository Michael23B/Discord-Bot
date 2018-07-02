const stocks = require('./stocks.js');

module.exports.run = async(client, message, args) => {
    let inventory = client.getInventoryFor(message.author.id);
    if (args[0] && args[1] && args[1] === 'all') args[1] = inventory[args[0]];

    if (!args[0] || !args[1] || isNaN(args[1]) || args[1] < 1) {
        message.reply('supply an item and amount to sell. You can see your items using `>i`. `>sell [item] [amount]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let price = stocks.getCurrentPrices()[args[0]];
    //Check if an item exists
    if (!price) {
        message.reply('I couldn\'t find that item. You can see your items using `>i`.')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }

    let totalEarnings = price * parseInt(args[1]);
    //Check if the user has the amount they are trying to sell
    if (inventory[args[0]] - args[1] < 0) {
        message.reply(`you don't have that many. You have ${args[0]}x${inventory[args[0]]}.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    //Sell the items
    client.changeItemAmountFor(message.author.id, '💰', totalEarnings);
    client.changeItemAmountFor(message.author.id, args[0], parseInt(args[1]) * -1);
    message.reply(`you sold ${args[0]}x${args[1]} for 💰x${totalEarnings}.`).catch(console.error);
};

module.exports.aliases = ['sell'];
module.exports.permissions = ['SEND_MESSAGES'];
