module.exports.run = async(client, message, args) => {
    let target = message.mentions.members.first();
    let inventory = client.getInventoryFor(message.author.id);
    if (args[0] && args[1] && args[1] === 'all') args[1] = inventory[args[0]];

    if (!args[0] || !args[1] || isNaN(args[1]) || args[1] < 1 || !target) {
        message.reply('supply an item, amount and target to give. You can see your items using `>i`. `>give [item] [amount] [@username]`')
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    //Check if the user has the amount they are trying to give
    if (!inventory[args[0]] || inventory[args[0]] - args[1] < 0) {
        message.reply(`you don't have that many. You have ${args[0]}x${inventory[args[0]]}.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
        return;
    }
    //Give the items
    client.changeItemAmountFor(message.author.id, args[0], parseInt(args[1]) * -1);
    client.changeItemAmountFor(target.id, args[0], parseInt(args[1]));
    message.reply(`you gave ${target.user.username} ${args[0]}x${args[1]}.`).catch(console.error);
};

module.exports.aliases = ['give'];
module.exports.permissions = ['SEND_MESSAGES'];
