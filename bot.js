const settings = require('./settings.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = settings.prefix;

client.on('ready', async () => {
    console.log(client.user.username + ' ready for deployment sir.\n');

    try {
        let link = await client.generateInvite(['ADMINISTRATOR']);
        console.log(`To add me to a server, go here sir:\n ${link}`);
    } catch (err) {
        console.log(err.stack);
    }
});

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;
    if (!message.content.startsWith(settings.prefix)) return;

    await executeCommand(message);
});

client.login(settings.token).catch(console.error);

async function executeCommand(message) {
    let args = message.content.split(' ');
    let command = args[0];
    args = args.splice(1);

    switch (command) {
        case `${prefix}hello`:
            message.react('👋');
            break;
        case `${prefix}userinfo`:
            let user =  message.mentions.members.first() || message.guild.members.find(x => x.user === message.author);
            let embed = createUserInfoEmbed(user);
            message.channel.send(embed);
            break;
        case `${prefix}colour`:
            message.member.colorRole.setColor(getColour(args))
                .then(updated => message.reply(`colour set to ${updated.hexColor}`))
                .catch(console.error);
            break;
        default:
            message.reply(`${command} is not a recognized command!`);
    }
}

//Discord-related helper functions
function createUserInfoEmbed(user) {
    return new Discord.RichEmbed()
        .setTitle(`User info - ${user.user.username}`)
        .setImage(user.user.avatarURL)
        .setColor(user.colorRole.color || 'BLUE')
        .addField('Full username:', `${user.user.username}#${user.user.discriminator}`)
        .addField('Joined Discord:', user.user.createdAt);
}

function getColour(args) {
    let colour = [];
    //User supplied rgb values
    if (!isNaN(args[0]) && !isNaN(args[1]) && !isNaN(args[2])) {
        colour[0] = clamp(args[0], 1, 255);
        colour[1] = clamp(args[1], 1, 255);
        colour[2] = clamp(args[2], 1, 255);
    }
    //Otherwise generate a random number
    else {
        colour[0] = getRandomInt(1,256);
        colour[1] = getRandomInt(1,256);
        colour[2] = getRandomInt(1,256);
    }
    return colour;
}

//Helper functions
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
