//
//Discord related functions
//
module.exports.getRolesString = async function(rolesCollection) {
    let roles = "";
    await rolesCollection.forEach(entry => {
        roles += entry;
        roles += ', ';
    });
    return roles = roles.slice(0, -2); //Remove trailing comma and space
};


module.exports.getNewRole = async function(message, name) {
    return await message.guild.createRole({
        name: name,
        color: 'GREY',
        permission: [],
    }).catch(console.error);
};

module.exports.safeDeleteChannel = async function(guild, callId) {
    let call = guild.channels.find(x => x.id === callId);
    if (!call || call.members.first()) return;
    call.delete().catch(console.error);
};

//
//Standard functions
//
module.exports.getRandomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

module.exports.clamp = function(n, min, max) {
    return Math.min(Math.max(n, min), max);
};

module.exports.getColour = function(args) {
    let colour = [];

    //Clamp user supplied RGB values when supplied, otherwise generate a random value
    colour[0] = isNaN(args[0]) ? this.getRandomInt(1,256) : this.clamp(args[0], 1, 255);
    colour[1] = isNaN(args[1]) ? this.getRandomInt(1,256) : this.clamp(args[1], 1, 255);
    colour[2] = isNaN(args[2]) ? this.getRandomInt(1,256) : this.clamp(args[2], 1, 255);

    return colour;
};
