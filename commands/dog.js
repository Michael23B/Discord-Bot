const superagent = require('superagent');

module.exports.run = async(client, message, args) => {
    let loadingMsg = await message.channel.send('Searching for doggo related content...').catch(console.error);

    let doggoUrl = await superagent.get('https://random.dog/woof.json').then(res => res.body.url);

    if (doggoUrl) {
        loadingMsg.edit('Ok I found a dog, it\'s loading... 👉 🐶');
        await message.channel.send('', {files: [doggoUrl]}).catch(console.error);
    }
    else message.channel.send('I couldn\'t find any dogs. :(').catch(console.error);

    loadingMsg.delete();
};

module.exports.aliases = ['dog', 'doggo', '🐶'];
module.exports.permissions = ['SEND_MESSAGES', 'ATTACH_FILES', 'EMBED_LINKS'];
