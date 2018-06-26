/*
const helpers = require('../helpers.js');
const colorsys = require('colorsys');

let intervals = [];
*/
module.exports.run = async(client, message, args) => {
    //Seems to start having problems after a while of running if set to any reasonably fast speed.
    //Might come back later and see if anything can be done about it.
    message.reply('that command is disabled :(');

    /*
    if (args[0] === 'stop') {
        intervals.forEach(x => clearInterval(x));
        intervals = [];
        message.reply('rainbows stopped.');
        return;
    }
    let target = message.mentions.members.first() || message.member;

    if (!target.colorRole) {
        //No colorRole, create a new role
        let role = await helpers.getNewRole(message, client.botRoleName);
        await target.addRole(role).catch(console.error);
    }

    intervals.push(setInterval(await rainbow(target), 500));

    message.reply('rainbow starting.');
    */
};

module.exports.aliases = ['rainbow'];
module.exports.permissions = ['SEND_MESSAGES'];
/*
function rainbow(target) {
    let currHue = 0;
    let increment = 1;

    return async function() {
        let colour = colorsys.hsl2Rgb(currHue, 100, 50);
        let colourArray = [colour.r, colour.g, colour.b];

        await target.colorRole.setColor(colourArray).catch(console.error);

        currHue += increment;
        if (currHue > 239 || currHue < 0) increment = -increment;

        console.log(`Hue: ${currHue}. Target: ${target.colorRole.hexColor}.` +
            ` Colour: ${colourArray[0]}, ${colourArray[1]}, ${colourArray[2]}.`);
    };
}
*/
