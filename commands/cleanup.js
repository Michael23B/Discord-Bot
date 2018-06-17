module.exports.run = async(client, message, args) => {
    cleanUp(client, message, args).catch(console.error);
};

async function cleanUp(client, message, args) {
    let deleteCount = 0;
    if (args[0] === 'roles') {
        let roleToDelete = Array.prototype.join.call(args.slice(1), " ") || client.botRoleName;
        message.guild.roles.forEach(entry => {
            if (entry.name === roleToDelete) {
                entry.delete().catch(() => {
                    message.reply(`couldn't remove the ${entry.name} role for some reason >:(`);
                });
                deleteCount++;
            }
        });
        message.reply(`found ${deleteCount} roles named ${roleToDelete}. Getting rid of them now.`);
    }
    else if (args[0] === 'messages') {
        deleteCount = (args[1] && !isNaN(args[1])) ? args[1] : 10;
        let messages = await message.channel.fetchMessages({limit: deleteCount}).catch(console.error);
        let user = message.mentions ? message.mentions.members.first() : null;

        if (user) messages = messages.filter(x => x.author.id === user.id);

        await message.channel.bulkDelete(messages);
        message.reply(`I searched through the last ${deleteCount}` +
            ` messages and deleted ${messages.size} messages by ${user || 'everyone'}`);
    }
    else if (args[0] === 'calls') {
        if (!args[1]) {
            message.reply('please enter a channel name.');
            return;
        }
        let channelName = Array.prototype.join.call(args.slice(1), " ");
        let channels = message.guild.channels.filter(x => x.name === channelName && x.type === 'voice');
        channels.forEach(entry => {
            entry.delete();
        });
        message.reply(`removed ${channels ? channels.size : 0} channels named ${channelName}`);
    }
    else {
        message.reply('I don\'t know how to clean that up');
    }
}
