# Discord-Bot

### Self-Hosting Requirements
To host the bot yourself, you need to have [Node.js](https://nodejs.org/en/) and [FFmpeg](https://www.ffmpeg.org/) installed.

Clone the repo and run `node bot.js` to start.

A settings file or environment variables are required to run the bot. 
The settings file is parsed as JSON and should look like this:
```javascript
{
  "token": "Your-Discord-API-Token",
  "ytApiKey": "Your-YouTube-Data-API-Key",
  "prefix": ">",
  "messageLifeTime": 10000
}
```
If you are hosting the bot online and want to keep your API keys hidden, 
you can use environment variables to store this information. They are as follows:
```
BOT_API_TOKEN = "Your-Discord-API-Token"
YOUTUBE_API_KEY = "Your-YouTube-Data-API-Key"
BOT_PREFIX = ">"
BOT_MESSAGE_LIFETIME = 10000
```
You can get a discord API token from [here](https://discordapp.com/developers/applications).

You can get a YouTube data API key from [here](https://developers.google.com/youtube/v3/getting-started).

Your prefix is what users type before a command for the bot to respond to. eg. `>test`, `>play`.

Message life time is how long (milliseconds) before certain messages sent by the bot are deleted.
The messages deleted are things like a user not supplying the correct arguments or other error messages.

Additionally this bot will store data in two files named `inventories.json` and `questions.json`. 
Using Google cloud, it stores and fetches these files in case the bot should ever go down.
If you are using a service to host the bot that cannot store data files persistently (like Heroku),
then creating a Google cloud API key and setting up a simple storage bucket will allow you to keep that data through downtime.

You can create a Google cloud account [here](https://cloud.google.com).

Once you have your credentials file, simply store it as an environment variable and it will be parsed a JSON object.
The variable name should be `GOOGLE_APPLICATION_CREDENTIALS`.

If you don't need to store your data files elsewhere, you can disable Google cloud integration in the `googleCloud.js` file.
Set `module.exports.ACTIVE` to false and comment out the `storage` variable at the top of the file.

If you want the bot to ignore specific servers, copy their guild ID and add an environment variable called `IGNORED_SERVER_IDS`.
It looks like this:
```javascript
{
"Server-ID-To-Ignore": true,
"Server-ID-To-Ignore2": true
}
```
You can also edit the object directly in the code at the top of the `bot.js` file.
