const Discord = require('discord.js');
const fs = require('fs');
const util = require('util');

//Promise wrapper for fs.readFile so we can use await, .then(), etc.
const readFile = util.promisify(fs.readFile);

let askingQuestion = false;
let currPlayer = "";
let currAnswer = "";

module.exports.run = async(client, message, args) => {
    let questions = await getQuestionsObject() || [];

    switch (args[0]) {
        case 'get':
            let questionString = "";
            questions.forEach(q => {
                questionString += `Question: ${q.question}, Image: ${q.image}, Answer:${q.answer}\n`;
            });
            message.channel.send(questionString);
            console.log(questions);
            break;
        case 'ask':
            if (askingQuestion) {
                message.reply(`please wait for ${currPlayer} to answer first.`);
                return;
            }

            let randIndex = Math.floor(Math.random() * questions.length);
            await createQuestionEmbed(message, questions[randIndex])
                .then(embed => message.channel.send(embed).catch(console.error))
                .catch(console.error);

            askingQuestion = true;
            currAnswer = questions[randIndex].answer;
            currPlayer = message.author.username;

            break;
        case 'answer':
            if (!askingQuestion) {
                message.reply('please ask a question first!');
            }
            else if (Array.prototype.join.call(args.slice(1), " ") === currAnswer) {
                message.reply('^-^ yaaay~ you did it senpai! :)))');
            }
            else message.reply('v-v wrong answer sir.....:(.......');
            askingQuestion = false;
            break;
        case 'add':
            if (!message.attachments.first() || !args[1] || !args[2]) {
                message.reply('make sure you\'ve attached an image and have a question and answer.');
                break;
            }
            let newQuestion = await {
                question: args[1],
                image: await message.attachments.first().url,
                answer: Array.prototype.join.call(args.slice(1), " ")
            };

            questions.push(newQuestion);
            fs.writeFile("./data/questions.json", JSON.stringify(questions, null, 4), () => console.error);
            break;
        default:
            message.reply('sorry I didn\'t understand that. You can try `TODO: add things you can do here`');
    }
};

module.exports.aliases = ['question', 'q'];

async function createQuestionEmbed(message, question) {
    let member = await message.guild.members.find(x => x.user === message.author);
    return new Discord.RichEmbed()
        .setTitle(`Question for ${message.author.username}`)
        .setImage(question.image)
        .setColor(member.colorRole ? member.colorRole.color : 'BLUE')
        .addField('Question:', `${question.question}`);
}

async function getQuestionsObject() {
    return await readFile('./data/questions.json').then(data => JSON.parse(data)).catch(console.error);
}

//TODO: break switch case into smaller functions, allow editing of questions,
// different methods of attaching images (url), multiple choice questions, other stuff
