const Discord = require('discord.js');

const voteFilter = (reaction) => reaction.emoji.name === '❌' || reaction.emoji.name === '✅';

module.exports.run = async(client, message, args) => {
    let target = message.mentions.members.first();

    if (!target) {
        message.reply(`you must mention a user (\`@username\`) to kick them.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }

    let isOwner = message.guild.owner === message.member;

    //Compare permissions for setting another members colour
    if (target !== message.member) {
        if ((target.hasPermission('ADMINISTRATOR', false, true, true)
            || target.highestRole.position >= message.member.highestRole.position)
            && !isOwner) {
            message.reply(`${target.user.username} has a power level equal to or greater than yours.`)
                .then(msg => msg.delete(client.msgLife)).catch(console.error);
            return;
        }
    }

    let embed = getVoteEmbed(target, message.member);
    let voteMessage = await message.channel.send(embed);

    let voteResult = await awaitVotes(voteMessage, 15000);

    if (voteResult < 3) {
        message.channel.send(`${target.user.username} did not receive enough votes to be kicked.`).catch(console.error);
        return;
    }

    await target.kick(`${message.author.username} voted to kick.`).then(() => {
        message.reply(`${target.user.username} has been kicked.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    }).catch(() => {
        message.reply(`couldn't kick ${target.user.username}. Their power level is even greater than my own.`)
            .then(msg => msg.delete(client.msgLife)).catch(console.error);
    });
};

module.exports.aliases = ['votekick', 'kick'];
module.exports.permissions = ['ADMINISTRATOR'];

function getVoteEmbed(memberToKick, memberWhoInitiated) {
    return new Discord.RichEmbed()
        .setTitle(`Voting to kick ${memberToKick.user.username}`)
        .setImage(memberToKick.user.displayAvatarURL)
        .setColor('RED')
        .setFooter(`Vote initiated by ${memberWhoInitiated.user.username}`);
}

async function awaitVotes(voteMessage, timeToWait) {
    await voteMessage.react('❌');
    await voteMessage.react('✅');

    return await voteMessage.awaitReactions(voteFilter, { time: timeToWait })
        .then(collected => countVotes(collected))
        .catch(console.error);
}

function countVotes(collected) {
    let votes = 0;

    collected.forEach(v => {
        if (v._emoji.name === '❌') votes-= v.count;
        if (v._emoji.name === '✅') votes+= v.count;
    });

    return votes;
}
