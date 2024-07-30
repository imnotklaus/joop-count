const { Client, Intents, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { token, countingChannelId } = require('config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

let count = 0;
let lastUserId = null;
let nextNum = count + 1;

client.once('ready', () => {
    console.log('Ready! Logged in as ${client.user.tag}.');
        client.user.setPresence({
      activities: [{ 
        name: "brat",
        type: "LISTENING"
      }],
      status: "online"
  })
});

client.on('messageCreate', message => {
    if (message.channel.id === countingChannelId && !message.author.bot) {
        const num = parseInt(message.content, 10);
        if (isNaN(num)) {
            return;
        }

        if (message.author.id === lastUserId || num !== nextNum) {
            message.react('❌');
            message.channel.send(`<@${message.author.id}> can't count! They fucked it up at **${nextNum}**. The next number is **1**.`);
            count = 0;
            lastUserId = null;
        } else if (message.author.id === lastUserId) {
                message.react('❌');
                count = 0;
                message.channel.send(`You can't do two numbers in a row! <@${message.author.id}> fucked it up at **${nextNum}**. The next number is **1**.`);
                lastUserId = null;
            }
         else {
            count = num;
            lastUserId = message.author.id;
            message.react('✅');
        }
    }
});

client.on('messageDelete', message => {
    if (message.channel.id === countingChannelId && !message.author.bot) {
        const num = parseInt(message.content, 10);
        if (!isNaN(num)) {
            message.channel.send(`<@${message.author.id}> deleted their message at **${num}**. The next number is **${num + 1}**.`);
        }
    }
});

client.login(token);