const Discord = require('discord.js');
const helpers = require('../helpers.js');
const stocks = require('./stocks.js');

module.exports.run = async(client, message, args) => {
    let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
    let userEmbed = await createUserInfoEmbed(client, user);
    message.channel.send(userEmbed);
};

module.exports.aliases = ['userinfo', 'user', 'uinfo'];
module.exports.permissions = ['SEND_MESSAGES', 'EMBED_LINKS'];

async function createUserInfoEmbed(client, member) {
    let roles = await helpers.getRolesString(member.roles);
    let inventory = client.getInventoryFor(member.id);
    let prices = stocks.getCurrentPrices();
    let netWorth = inventory['💰'];
    let inventoryString = Object.keys(inventory).map(key => {
        let itemValuation = prices[key] * inventory[key];
        if (!isNaN(itemValuation)) netWorth += itemValuation;
        return key.toString() + 'x' + inventory[key].toString();
    }).join(', ');

    return new Discord.RichEmbed()
        .setTitle(`User info - ${member.user.username}`)
        .setImage(member.user.avatarURL)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .addField('Full username:', `${member.user.username}#${member.user.discriminator}`)
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Inventory:', `${inventoryString}`)
        .addField('Net worth:', `${netWorth.toLocaleString('en-US', {style: 'currency', 'currency': 'USD'})}`)
        .addField('Joined Discord:', member.user.createdAt);
}
