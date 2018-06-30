const fs = require('fs');
const util = require('util');

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

module.exports.items = ['💰', '🍏', '🍅', '🍇', '🍓', '🍒', '🍆', '🍯', '🥑', '🐟', '🐠', '🐡', '🐬', '🐊', '🦑', '🦈', '🐳',
    '🕶', '💍', '👑', '🛴', '🚲', '🛵', '🚗', '🏎', '🚁', '✈', '🚀'];

//Updates our inventory so that we can update the items array and each players stats object will update accordingly
module.exports.updateInventory = function(inventory) {

    //Add any items from the items list that we don't have in our inventory
    module.exports.items.forEach(item => {
        if (!inventory.hasOwnProperty(item)) {
            inventory[item] = 0;
        }
    });
    //Delete any item that is no longer in the item list
    Object.keys(inventory).forEach(prop =>{
        if (!module.exports.items.includes(prop)) delete(inventory[prop]);
    });
    return inventory;
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

//Promise wrapper for fs.readFile so we can use await, .then(), etc.
module.exports.readFile = util.promisify(fs.readFile);
