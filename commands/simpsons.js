const superagent = require('superagent');
const Discord = require('discord.js');

const filter = (reaction) => reaction.emoji.name === '1⃣'
    || reaction.emoji.name === '2⃣'
    || reaction.emoji.name === '3⃣'
    || reaction.emoji.name === '4⃣';

module.exports.run = async(client, message, args) => {
    let loadingMsg = await message.channel.send('Searching for Simpsons frame...').catch(console.error);

    let query = Array.prototype.join.call(args.slice(0), " ");
    let url = query ? `https://frinkiac.com/api/search?q=${query}` : 'https://frinkiac.com/api/random';

    let resultsObj = await superagent.get(url)
        .then(res => res.body)
        .catch(console.error);

    if (!query) {
        let imgUrl = `https://frinkiac.com/img/${resultsObj.Frame.Episode}/${resultsObj.Frame.Timestamp}.jpg`;
        await message.channel.send(`Result for random search`, {files: [imgUrl]});
        return;
    }
    let embed = getResultsSampleEmbed(resultsObj, query);

    let msg = await message.channel.send(embed);

    await msg.react('1⃣').catch(console.error);
    await msg.react('2⃣').catch(console.error);
    await msg.react('3⃣').catch(console.error);
    await msg.react('4⃣').catch(console.error);

    let winningIndex = await msg.awaitReactions(filter, { time: 10000 })
        .then(collected => selectWinningEmoji(collected))
        .catch(console.error);


    let imgUrl = `https://frinkiac.com/img/${resultsObj[winningIndex].Episode}/${resultsObj[winningIndex].Timestamp}.jpg`;

    //message.channel.send(`Result for "${query}" - frame number ${winningIndex}`, {files: [imgUrl]});
    message.channel.send(await getImageEmbed(imgUrl, query, winningIndex));
    msg.delete();
};
module.exports.aliases = ['simpsons', 'simpson'];

function getResultsSampleEmbed(result, query) {
    return new Discord.RichEmbed()
        .setTitle(`Results for "${query}"`)
        .setColor('GOLD')
        .addField(`1.`, `${result[0].Episode}`)
        .addField(`2.`, `${result[1].Episode}`)
        .addField(`3.`, `${result[2].Episode}`)
        .addField(`4.`, `${result[3].Episode}`)
        .setFooter('React to select image.');
}

function getImageEmbed(imgUrl, query, winningIndex) {
    return new Discord.RichEmbed()
        .setTitle(`Result for "${query}" - Frame ${winningIndex}`)
        .setColor('GOLD')
        .setImage(imgUrl)
        .setFooter('React to go to the next or previous frame.');
}


function selectWinningEmoji(collected) {
    let maxCount = 0;
    let maxEmoji = '1⃣';

    collected.forEach(entry => {
        if (entry.count > maxCount) {
            maxCount = entry.count;
            maxEmoji = entry._emoji.name;
        }
    });

    switch (maxEmoji) {
        case '1⃣':
            return 0;
        case '2⃣':
            return 1;
        case '3⃣':
            return 2;
        case '4⃣':
            return 3;
    }
}
