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

    executeCommand(message);
});

client.login(settings.token);

function executeCommand(message) {
    let args = message.content.split(' ');
    let command = args[0];
    args.splice(1);

    switch (command) {
        case `${prefix}hello`:
            message.react('👋');
            break;
        case `${prefix}userinfo`:
            let user = message.author;
            let embed = CreateUserInfoEmbed(user);

            message.channel.send(embed);
            break;
        default:
            console.log(`${command} is not a recognized command!`);
    }
}

function CreateUserInfoEmbed(user) {
    return new Discord.RichEmbed()
        .setAuthor(user.username)
        .setImage(user.avatarURL)
        .setColor('BLUE')
        .addField('Full username: ', `${user.username}#${user.discriminator}`)
        .addField('Joined Discord: ', user.createdAt);
}
