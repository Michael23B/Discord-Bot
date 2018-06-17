const question = require('./question.js');

//Receive an answer and edit the message to rewrite it as >question answer {message.content}
//This allows us to type >answer or >a
module.exports.run = async(client, message, args) => {
    //Loop through our aliases to find the one used, then replace it with the question command
    for (let i = 0; i < this.aliases.length; ++i) {
        if (message.content.startsWith(client.prefix + this.aliases[i])) {
            message.content = message.content.replace(this.aliases[i], 'question answer');
            args.unshift('answer');
        }
    }

    question.run(client, message, args).catch(console.error);
};

module.exports.aliases = ['answer', 'a'];

//Why not just check the message content at the start of the question command?
//I think the commands have a clearer purpose this way.
