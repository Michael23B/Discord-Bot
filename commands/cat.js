const superagent = require('superagent');

module.exports.run = async(client, message, args) => {
    let loadingMsg = await message.channel.send('Searching for cat related content...').catch(console.error);

    let catUrl = await superagent.get('https://thecatapi.com/api/images/get')
        .then(res => extractImageFromGetResult(res))
        .catch(console.error);

    if (catUrl) {
        loadingMsg.edit('Ok I found a cat, it\'s loading... 👉 🐱');
        await message.channel.send('', {files: [catUrl]}).catch(console.error);
    }
    else message.channel.send('I couldn\'t find any cats. :(').catch(console.error);

    loadingMsg.delete();
};

module.exports.aliases = ['cat', 'cate', '🐱'];
module.exports.permissions = ['ADMINISTRATOR'];

function extractImageFromGetResult(result) {
    let stringRes = JSON.stringify(result);
    let obj = JSON.parse(stringRes);

    return obj.header.original_image;
}
