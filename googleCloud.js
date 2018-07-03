const Storage = require('@google-cloud/storage')({
    projectId: 'aesthetic-fx-209012',
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});

const fs = require('fs');
let storage;
//If ACTIVE is false, we do not upload or retrieve our data from the bucket. Set to false if you are running locally or
//if your server can store this data persistently.
module.exports.ACTIVE = true;

//If we have application credentials, we don't need to supply a key file
storage = new Storage();

//local key file
/*
const Storage = require('@google-cloud/storage');
storage = new Storage({
    keyFilename: 'C:\\Users\\User\\Documents\\Projects\\JS\\bucketKey.json' //replace keyFilename with your path to google auth key file
});
*/

module.exports.getDataFilesFromGoogleCloud = async function(client) {
    const bucketName = 'discord-bot-of-hell';
    const srcFilenameInventories = 'inventories.json';
    const destFilenameInventories = './data/inventories.json';
    const srcFilenameQuestions = 'questions.json';
    const destFilenameQuestions = './data/questions.json';

    //Downloads inventories.json file and then updates the object within client
    storage.bucket(bucketName).file(srcFilenameInventories).download({destination: destFilenameInventories})
        .then(() =>{
            client.inventories = (() => {
                let raw = fs.readFileSync('./data/inventories.json');
                return JSON.parse(raw);
            })();
        }).catch(console.error);

    //Downloads questions.json file
    storage.bucket(bucketName).file(srcFilenameQuestions).download({destination: destFilenameQuestions})
        .catch(console.error);
};

module.exports.uploadDataFilesToGoogleCloud = async function(uploadInventories, uploadQuestions) {
    const bucketName = 'discord-bot-of-hell';
    const inventoriesFilename = './data/inventories.json';
    const questionsFilename = './data/questions.json';

    if (uploadInventories) storage.bucket(bucketName).upload(inventoriesFilename).catch(console.error);
    if (uploadQuestions) storage.bucket(bucketName).upload(questionsFilename).catch(console.error);
};
