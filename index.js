const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { token, countingChannelId } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let count = 0;
let lastUserId = null;
let nextNum = count + 1;
let lastValidMessageId = null;

client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}.`);
    client.user.setPresence({
        activities: [{ 
            name: "counting numbers",
            type: ActivityType.Listening
        }],
        status: "online"
    });
});

function evaluateExpression(expression) {
    try {
        // Replace the square root symbols with proper JavaScript syntax
        expression = expression.replace(/√/g, 'Math.sqrt').replace(/sqrt\s*/gi, 'Math.sqrt');

        // Evaluate the expression using Function constructor
        const result = Function(`"use strict"; return (${expression})`)();
        return !isNaN(result) ? result : null;
    } catch (error) {
        return null;
    }
}

client.on('messageCreate', message => {
    if (message.channel.id === countingChannelId && !message.author.bot) {
        const content = message.content.trim();
        const num = evaluateExpression(content);

        if (num === null || isNaN(num)) {
            return;
        }

        if (num !== nextNum) {
            message.react('❌');
            count = 0;
            nextNum = 1;  // Reset nextNum to 1
            message.channel.send(`<@${message.author.id}> can't count! They messed it up at **${nextNum}**. The next number is **1**.`);
            lastUserId = null;
            lastValidMessageId = null;
        } else if (message.author.id === lastUserId) {
            message.react('❌');
            count = 0;
            nextNum = 1;  // Reset nextNum to 1
            message.channel.send(`You can't do two numbers in a row! <@${message.author.id}> messed it up at **${nextNum}**. The next number is **1**.`);
            lastUserId = null;
            lastValidMessageId = null;
        } else {
            count = num;
            lastUserId = message.author.id;
            nextNum = count + 1;  // Update nextNum correctly after a valid count
            lastValidMessageId = message.id;
            message.react('✅');
        }
    }
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (newMessage.channel.id === countingChannelId && !newMessage.author.bot && newMessage.id === lastValidMessageId) {
        const content = newMessage.content.trim();
        const num = evaluateExpression(content);

        if (num !== null && !isNaN(num)) {
            await newMessage.delete();
            newMessage.channel.send(`<@${newMessage.author.id}> edited their message, they put **${num}**, the next number is **${nextNum}**.`);
        }
    }
});

client.on('messageDelete', async message => {
    if (message.channel.id === countingChannelId && !message.author.bot && message.id === lastValidMessageId) {
        const content = message.content.trim();
        const num = evaluateExpression(content);

        if (num !== null && !isNaN(num)) {
            message.channel.send(`<@${message.author.id}> deleted their message at **${num}**. The next number is **${nextNum}**.`);
        }
    }
});

client.login(token);