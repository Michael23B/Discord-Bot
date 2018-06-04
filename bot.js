const settings = require('./settings.json');
const discord = require('discord.js');
const client = new discord.Client();

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

    let args = message.content.split(' ');
    let command = args[0];
    args.splice(1);

    console.log(args);
    console.log(command);

    if (command === `${settings.prefix}sir`) message.react('👋');
});

client.login(settings.token);
