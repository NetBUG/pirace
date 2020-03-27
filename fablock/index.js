const TelegramBot = require('node-telegram-bot-api');
const { checkUser, insertUser, listUsers, updateuser } = require('./users');

// replace the value below with the Telegram token you receive from @BotFather
const token = '573156587:AAF_LMzP27vDcw3uThur54ElxY3EfJWd9zA';
const botName = 'Fablab77 access bot';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const bot = new TelegramBot(token, { polling: true, baseApiUrl: 'https://80.211.228.248' });

// Matches /start
bot.onText(/\/start/, async (msg, match) => {
  let resp = `Hello, ${msg.chat.username}! This is ${botName}.`; // match[1]; // the captured "whatever"
  resp += '\nCommands available: \n /open - opens the door if you are authorized';
  try {
    const result = await checkUser(msg.chat.username);
    if (result && result.admin) {
      resp += '\n /allow USERNAME - add user to trusted';
      resp += '\n /disallow USERNAME - add user to trusted';
      resp += '\n /list - list users';
    }
    // send back the matched "whatever" to the chat
    bot.sendMessage(msg.chat.id, resp);
    if (!result) {
      await insertUser(msg.chat.username, false, false);
    }
  } catch(e) {
    console.error(e);
  }
});

// Matches /start
bot.onText(/\/open/, async (msg) => {
  // send back the matched "whatever" to the chat
  const chatId = msg.chat.id;
  const result = await checkUser(msg.chat.username);
  if (result) {
    if (result.allowed) {
      bot.sendMessage(chatId, 'The door has been opened!');
    } else
      bot.sendMessage(chatId, 'You were not allowed to open the door!');
  } else {
    insertUser(msg.chat.username);
    bot.sendMessage(chatId, 'Unfortunately, we could not find you in the database');
  }
});

// Matches /start
bot.onText(/\/(dis)?allow/, async (msg) => {
  // send back the matched "whatever" to the chat
  const chatId = msg.chat.id;
  const result = await checkUser(msg.chat.username);
  if (result) {
    if (result.admin) {
      let user = msg.text.split(' ');
      const task = user[0];
      const targetuser = user[1];
      if (user.length < 2) {
        bot.sendMessage(chatId, 'You must supply user name!');
      } else {
        const res1 = await checkUser(targetuser);
        if (!res1) {
          bot.sendMessage(chatId, `User ${targetuser} was not found!`);
        } else {
          updateuser(targetuser, !task.includes('dis'));
          bot.sendMessage(chatId, `User ${targetuser} was ${task.substring(1)}ed!`);
        }
      }
    } else
      bot.sendMessage(chatId, 'You were not allowed to manage users!');
  } else {
    bot.sendMessage(chatId, 'Unfortunately, we could not find you in the database');
  }
});

// Matches /start
bot.onText(/\/list/, async (msg) => {
  const result = await checkUser(msg.chat.username);
  try {
    if (result && result.admin) {
      const users = await listUsers();
      const userList = users.map(user => `${user.id} ${user.allowed ? '✅' : '🚫'} ${user.admin ? '🛡️' : ''}`).join('\n');
      bot.sendMessage(msg.chat.id, userList);
    } else
      bot.sendMessage(msg.chat.id, 'Sorry, you are not allowed!');
  } catch(e) {
    console.error(e);
  }
});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  bot.answerCallbackQuery(callbackQuery.id, { url });
});
