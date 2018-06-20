const superagent = require('superagent');
const Discord = require('discord.js');

module.exports.run = async(client, message, args) => {
    let loadingMsg = await message.channel.send('Searching for doggo image...').catch(console.error);

    let doggoUrl = await superagent.get('https://random.dog/woof.json').then(page => page.body.url);

    if (doggoUrl) {
        loadingMsg.edit('Ok I found a dog, it\'s loading. 👉 🐶');
        await message.channel.send('', {files: [doggoUrl]}).catch(console.error);
    }
    else message.channel.send('I couldn\'t find any dog images. :(').catch(console.error);

    loadingMsg.delete();
};

module.exports.aliases = ['dog', 'doggo', '🐶'];
