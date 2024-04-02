const TelegramApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options.js')
const sequelize = require('./db')
const UserModel = require('./models')
  
const token = '7117839535:AAHenLpmuU1XihpH9mqPKgWmNQaS-gMkVx8'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
  await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9, а ты должен её угадать`)
  const randomNumber = Math.floor(Math.random() * 10)
  chats[chatId] = randomNumber
  await bot.sendMessage(chatId, 'Отгадывай', gameOptions)
}

const start = async () => {

  try {
    await sequelize.authenticate()
    await sequelize.sync()
  } catch(e) {
    console.log('Goдключение у БД не получилось')
  }

  bot.on('message', async msg => {
    const text = msg.text
    const chatId = msg.chat.id
  
    bot.setMyCommands([
      { command: '/start', description: 'Начальное приветствие' },
      { command: '/info', description: 'Получить информацию о пользователе' },
      { command: '/game', description: 'Игра "Отгадай число"' },
      { command: '/again', description: 'Играть ещё раз' },
    ])
    if (text === '/start') {
      await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/69e/fe9/69efe9b9-d4d9-4a33-bb88-eee2f7e0b28b/6.webp')
      return bot.sendMessage(chatId, 'Добро пожаловать в бот NaKorte!')
    }
  
    if (text === '/info') {
      return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`)
    }

    if (text === '/game') {
      return startGame(chatId)
    }

    return bot.sendMessage(chatId, `Nicht ferschtee`)
  })
  
  bot.on('callback_query', msg => {
    const data = msg.data
    const chatId = msg.message.chat.id
    if (data === '/again') {
      return startGame(chatId)
    }
    if (+data === chats[chatId]) {
      return bot.sendMessage(chatId, `Поздравляем, ты отгадал цифру ${chats[chatId]}`, againOptions)
    } else {
      return bot.sendMessage(chatId, `К сожалению, ты не отгадал - бот загадал цифру ${chats[chatId]}`, againOptions)
    }
  })
}

start()