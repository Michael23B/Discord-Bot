const settings = require('./settings.json');
const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = settings.prefix;
const botRole = '^-^';

client.on('ready', async () => {
    console.log(client.user.username + ' ready for deployment sir.\n');
    //let link = await client.generateInvite(['ADMINISTRATOR']).catch(console.error);
    //console.log(`To add me to a server, go here sir:\n ${link}`);
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
            if (!message.member.colorRole) {
                //No colorRole, create a new role
                let role = await getNewRole(message);
                await message.member.addRole(role).catch(console.error);
            }
            await message.member.colorRole.setColor(getColour(args))
                .then(updated => message.reply(`colour set to ${updated.hexColor}`))
                .catch(console.error);
            break;
        case `${prefix}cleanup`:
            cleanUp(message, args)
                .then(message.reply('all done'))
                .catch(console.error);
            break;
        default:
            message.reply(`${command} is not a recognized command!`);
    }
    //TODO: add a cleanup function that gets rid of all bots messages, and optionally any message starting with prefix
    //TODO: add a function to trim all unused roles since the colour command will make some useless ones
}

//Discord-related helper functions
function createUserInfoEmbed(member) {
    let roles = "";
    member.roles.forEach(entry => {
        roles += entry;
        roles += ', ';
    });
    roles = roles.slice(0, -2); //Remove trailing comma and space
    return new Discord.RichEmbed()
        .setTitle(`User info - ${member.user.username}`)
        .setImage(member.user.avatarURL)
        .setColor(member.colorRole ? member.colorRole.color : 'GREY')
        .addField('Full username:', `${member.user.username}#${member.user.discriminator}`)
        .addField('Current Roles:', `${roles ? roles : "None"}`)
        .addField('Joined Discord:', member.user.createdAt);
}

function getColour(args) {
    let colour = [];
    //User supplied rgb values
    if (!isNaN(args[0]) && !isNaN(args[1]) && !isNaN(args[2])) {
        colour[0] = clamp(args[0], 1, 255);
        colour[1] = clamp(args[1], 1, 255);
        colour[2] = clamp(args[2], 1, 255);
    }
    //Otherwise generate a random colour
    else {
        colour[0] = getRandomInt(1,256);
        colour[1] = getRandomInt(1,256);
        colour[2] = getRandomInt(1,256);
    }
    return colour;
}

async function getNewRole(message) {
    return await message.guild.createRole({
        name: botRole,
        color: 'GREY',
        permission: [],
    }).catch(console.error);
}

async function cleanUp(message, args) {
    //FIXME: since we split by space, can't delete roles with space in their name
    let roleToDelete = args[1] || botRole;
    //>cleanup roles [role name]
    if (!args[0] || args[0] === 'roles') {
        message.guild.roles.forEach(entry => {
            if (entry.name === roleToDelete) entry.delete().catch(console.error);
        });
        message.reply(`cleaning up roles named ${roleToDelete}`);
    }
    else if (args[0] === 'messages') {
        message.reply(`(not implemented yet) cleaning up message from me, the bot`);
    }
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
