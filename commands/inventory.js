const Discord = require('discord.js');
const stocks = require('./stocks.js');

module.exports.run = async(client, message, args) => {
    let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
    let userEmbed = await createInventoryEmbed(client, user);
    message.channel.send(userEmbed);
};

module.exports.aliases = ['inventory', 'i'];
module.exports.permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

async function createInventoryEmbed(client, member) {
    let inventory = client.getInventoryFor(member.id);
    let prices = stocks.getCurrentPrices();
    let netWorth = inventory['💰'];
    let inventoryString = Object.keys(inventory).map(key => {
        let itemValuation = prices[key] * inventory[key];
        if (!isNaN(itemValuation)) netWorth += itemValuation;
        return key.toString() + 'x' + inventory[key].toString();
    }).join(', ');

    return new Discord.RichEmbed()
        .addField(`Inventory - ${member.user.username}`, `${inventoryString}`)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .setFooter(`Net worth of ${netWorth.toLocaleString('en-US', {style: 'currency', 'currency': 'USD'})}`);
}
