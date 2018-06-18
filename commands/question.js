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
            questions.forEach((q, i) => {
                questionString += `Question ${i + 1}: ${q.question}, Image: ${q.image}, Answer:${q.answer}\n`;
            });
            message.channel.send(questionString || 'No saved questions.');
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
        case 'a':
            if (!askingQuestion) {
                message.reply('request a question first!');
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
                answer: Array.prototype.join.call(args.slice(2), " ")
            };

            questions.push(newQuestion);
            fs.writeFile("./data/questions.json", JSON.stringify(questions, null, 4), () => console.error);

            let embed = await createQuestionEmbed(message, newQuestion);
            message.reply(`I added it. Here's how it looks:`);
            message.channel.send(embed);

            break;
        case 'delete':
        case 'remove':
            if (questions.length === 0) {
                message.reply('no questions to delete.');
            }
            else if (isNaN(args[1])) message.reply(`supply a question index to remove it.` +
            ` You can find the indexes using ${client.prefix}question get.`);
            else if (args[1] > questions.length || args[1] < 1) {
                message.reply(`supply an index between 1 and ${questions.length}.`);
            }
            else {
                let removedQuestion = questions.splice((args[1] - 1), 1);
                fs.writeFile("./data/questions.json", JSON.stringify(questions, null, 4), () => console.error);

                let embed = await createQuestionEmbed(message, removedQuestion[0]);
                message.reply(`I have removed the following question:`);
                message.channel.send(embed);
            }
            break;
        default:
            message.reply(`sorry I didn\'t understand ${message.content}. You can try \`TODO: add things you can do here\``);
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
