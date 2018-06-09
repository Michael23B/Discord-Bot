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
            let userEmbed = await createUserInfoEmbed(user);
            message.channel.send(userEmbed);
            break;
        case `${prefix}serverinfo`:
            let serverEmbed = await createServerInfoEmbed(message);
            message.channel.send(serverEmbed);
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
}

//Discord-related helper functions
async function createUserInfoEmbed(member) {
    let roles = await getRolesString(member.roles);
    return new Discord.RichEmbed()
        .setTitle(`User info - ${member.user.username}`)
        .setImage(member.user.avatarURL)
        .setColor(member.colorRole ? member.colorRole.color : 'GREY')
        .addField('Full username:', `${member.user.username}#${member.user.discriminator}`)
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Joined Discord:', member.user.createdAt);
}

async function createServerInfoEmbed(message) {
    let roles = await getRolesString(message.guild.roles);
    return new Discord.RichEmbed()
        .setTitle(`Server info - ${message.guild.name}`)
        .setImage(message.guild.iconURL)
        .setColor('BLUE')
        .addField('Current roles:', `${roles || "None"}`)
        .addField('Server created:', message.guild.createdAt)
        .addField('Current channel topic:', `${message.channel.topic || 'None'}`);
}

async function getRolesString(rolesCollection) {
    let roles = "";
    await rolesCollection.forEach(entry => {
        roles += entry;
        roles += ', ';
    });
    return roles = roles.slice(0, -2); //Remove trailing comma and space
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
    //>cleanup roles [role name]
    if (args[0] === 'roles') {
        let roleToDelete = Array.prototype.join.call(args.slice(1), " ") || botRole;

        message.guild.roles.forEach(entry => {
            if (entry.name === roleToDelete) entry.delete().catch(console.error);
        });
        message.reply(`cleaning up roles named ${roleToDelete}`);
    }
    else if (args[0] === 'messages') {
        message.reply(`(not implemented yet) cleaning up message from me, the bot`);
    }
    else if (!args[0]) {
        message.reply(`What?`);
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
