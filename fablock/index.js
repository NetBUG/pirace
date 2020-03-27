const TelegramBot = require('node-telegram-bot-api');
const { checkUser } = require('./users');

// replace the value below with the Telegram token you receive from @BotFather
const token = '573156587:AAF_LMzP27vDcw3uThur54ElxY3EfJWd9zA';
const botName = 'Fablab77 access bot';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const bot = new TelegramBot(token, { polling: true, baseApiUrl: 'https://80.211.228.248' });

// Matches /start
bot.onText(/\/start/, (msg, match) => {
  console.log(msg.chat);
  const chatId = msg.chat.id;
  let resp = `Hello, ${msg.chat.username}! This is ${botName}.`; // match[1]; // the captured "whatever"
  resp += '\nCommands available: \n /open - opens the door if you are authorized';
  resp += '\n /admin - manage user access';

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

// Matches /start
bot.onText(/\/open/, async (msg) => {
  // send back the matched "whatever" to the chat
  const chatId = msg.chat.id;
  result = await checkUser(msg.chat.username);
  console.log(result);
  if (result) {
    if (result.allowed) {
      bot.sendMessage(chatId, 'The door has been opened!');
    } else
      bot.sendMessage(chatId, 'You were not allowed to open the door!');
  } else {
    bot.sendMessage(chatId, 'Unfortunately, we could not find you in the database');
  }
});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  bot.answerCallbackQuery(callbackQuery.id, { url });
});
