const TelegramBot = require('node-telegram-bot-api');
const mongoose = require("mongoose");
const config = require('./config');
const helper = require('./helper');
const keyboard = require('./keyboard');
const kb = require('./keyboard-buttons');

helper.logStart();

mongoose.Promise = global.Promise;
mongoose.connect(config.DB_URL)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

require('./models/admin.model');
require('./models/user.model');
require('./models/chat.model');
require('./models/chan.model');
require('./models/link.model');
const User = mongoose.model('users');
const Admin = mongoose.model('admin');
const Chat = mongoose.model('chat');
const Chan = mongoose.model('chan');
const Link = mongoose.model('link');
//INLINE-KEYBOARD=====================================
const inline_keyboard = {
    chat: [
        [ {text: '🔵 Добавить', callback_data: 'chatsave'},
            {text: '🔴 Удалить', callback_data: 'chatdel'}]
    ],
    chan: [
        [ {text: '🔵 Добавить', callback_data: 'channsave'},
            {text: '🔴 Удалить', callback_data: 'channdel'}]
    ],
    link: [
        [ {text: '🔵 Добавить', callback_data: 'linksave'},
            {text: '🔴 Удалить', callback_data: 'linkdel'}]
    ]
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

bot.on('message', msg => {


    const chatId = helper.getChatId(msg)

    switch (msg.text) {
        case kb.home.mychat:
            Chats(chatId, msg.from.id)
            break;
        case kb.home.mychan:
            Channel(chatId, msg.from.id)
            break;
        case kb.home.mylink:
            Links(chatId, msg.from.id)
            break;
        case kb.home.support:
            bot.sendMessage(msg.from.id, `t.me/sup4u_bot`
                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
            break;
        case kb.back.back:
            bot.sendMessage(msg.from.id, `<b>Главное меню:</b>`
                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'}
            )
            break;
    }
})

//START=====================================

bot.onText(/\/start/, msg => {

    let userPromise

    User.findOne({tgId: msg.from.id})
        .then(user => {
            if(user) {
                bot.sendMessage(msg.from.id, `<b>Главное меню:</b>`
                    ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'}
                )
                userPromise = user
            } else {
                userPromise = new User({
                    name: msg.from.first_name,
                    username: msg.from.username,
                    tgId: msg.from.id
                })
                Admin.findOne({tgId: '184670517'})
                    .then(admin => {
                        const num = +`${admin.users}`+ +'1';
                        Promise.all([

                            userPromise.save(),
                            Admin.findOneAndUpdate({tgId: '184670517'},
                                {$set:{users: num}})
                        ])
                            .then(_ => {
                                bot.sendMessage(msg.from.id, `Здравствуйте, <b>${msg.from.first_name}</b>!`
                                    ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'}
                                )
                            })
                    })

            }
        })
})

//CHATS========================================
function Chats(chatId, tgId) {
    Chat.find({tgId})
     .then((chat)  => {
            let html
            if (chat.length) {

                html = chat.map((f, i) => {
                    return `${i + 1}.  ${f.name}`
                }).join('\n')
            } else {
                html = '🤷‍♂️ <i>Вы, пока еще, ничего не добавили..</i>'
            }
            bot.sendMessage(tgId,`📜 <b>Список чатов:</b>\n~~~~~~~~~~~~~~~~~~~~\n`+ html+ `\n~~~~~~~~~~~~~~~~~~~~\n<code>Рекомендую:</code>\n@HYIP_HYPE - общий чат`
                , { reply_markup:{inline_keyboard: inline_keyboard.chat} , parse_mode: 'HTML'})

        })}
//callback_query================================================

bot.on('callback_query', query => {
    const userId = query.from.id

    switch (query.data) {
        case 'chatsave':
            chatsave(userId, query.id)
            break;
        case 'chatdel':
            chatdel(userId, query.id)
            break;
        case 'channsave':
            channsave(userId, query.id)
            break;
        case 'channdel':
            channdel(userId, query.id)
            break;
        case 'linksave':
            linksave(userId, query.id)
            break;
        case 'linkdel':
            linkdel(userId, query.id)
            break;

    }})

//CHATSAVE=======================================

function chatsave(userId) {
    bot.sendMessage(userId, `<i>Чтобы сохранить чат в список, отправьте сообщение:</i>\n\n<code>/chatsave</code> текст`,
        {reply_markup: {keyboard: keyboard.back, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/chatsave (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const name = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){

        let chatPromise
        Chat.findOne({tgId: tgId,
            name: name})
            .then((chat) => {
                if (chat) {
                    bot.sendMessage(chatId, `🙄 <b>В списке уже есть</b> ${name}.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    chatPromise = new Chat({
                        name: name,
                        username: msg.from.username,
                        tgId: msg.from.id
                    })
                    chatPromise.save()
                        .then (_ => {

                            bot.sendMessage(chatId, `👌😎 <b>Чат успешно добавлен!</b>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})
//CHATDELETE=====================
function chatdel(userId) {
    bot.sendMessage(userId, `<i>Чтобы удалить чат из списка, отправьте сообщение:</i>\n\n<code>/chatdel</code> текст`,
        {reply_markup: {keyboard: keyboard.back, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/chatdel (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const name = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){


        Chat.findOne({tgId: tgId,
            name: name})
            .then((chat) => {
                if (!chat) {
                    bot.sendMessage(chatId, `🙄 <b>В списке нет</b> ${name}.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    Chat.deleteOne({name: name})
                .then(_ => {

                            bot.sendMessage(chatId, `❌ <b>Чат удален!</b>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})

//CHANNEL==========================================

function Channel(chatId, tgId) {

        Chan.find({tgId})

        .then((chan)  => {
            let html
            if (chan.length) {

                html = chan.map((f, i) => {
                    return `${i + 1}.  ${f.name}`
                }).join('\n')
            } else {
                html = '🤷‍♂️ <i>Вы, пока еще, ничего не добавили..</i>'
            }
            bot.sendMessage(tgId,`📜 <b>Список каналов:</b>\n~~~~~~~~~~~~~~~~~~~~\n`+ html+ `\n~~~~~~~~~~~~~~~~~~~~\n<code>Рекомендую:</code>\n@HyipNEWS_RU`
                , { reply_markup:{inline_keyboard: inline_keyboard.chan} , parse_mode: 'HTML'})

        })}

//CHANNELSAVE=======================================

function channsave(userId) {
    bot.sendMessage(userId, `<i>Чтобы сохранить канал в список, отправьте сообщение:</i>\n\n<code>/channsave</code> текст`,
        {reply_markup: {keyboard: keyboard.back, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/channsave (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const name = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){

        let chatPromise
        Chan.findOne({tgId: tgId,
            name: name})
            .then((chan) => {
                if (chan) {
                    bot.sendMessage(chatId, `🙄 <b>В списке уже есть</b> ${name}.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    chanPromise = new Chan({
                        name: name,
                        username: msg.from.username,
                        tgId: msg.from.id
                    })
                    chanPromise.save()
                        .then (_ => {

                            bot.sendMessage(chatId, `👌😎 <b>Канал успешно добавлен!</b>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})
//CHANNELDELETE=====================
function channdel(userId) {
    bot.sendMessage(userId, `<i>Чтобы удалить канал из списка, отправьте сообщение:</i>\n\n<code>/channdel</code> текст`,
        {reply_markup: {keyboard: keyboard.back, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/channdel (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const name = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){


        Chan.findOne({tgId: tgId,
            name: name})
            .then((chan) => {
                if (!chan) {
                    bot.sendMessage(chatId, `🙄 <b>В списке нет</b> ${name}.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    Chan.deleteOne({name: name})
                        .then(_ => {

                            bot.sendMessage(chatId, `❌ <b>Канал удален!</b>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})


//LINK==============================================

function Links(chatId, tgId) {

    Link.find({tgId})

        .then((link)  => {
            let html
            if (link.length) {

                html = link.map((f, i) => {
                    return `${i + 1}.  ${f.name}`
                }).join('\n')
            } else {
                html = '🤷‍♂️ <i>Вы, пока еще, ничего не добавили..</i>'
            }
            bot.sendMessage(tgId,`📜 <b>Список ссылок:</b>\n~~~~~~~~~~~~~~~~~~~~\n`+ html+ `\n~~~~~~~~~~~~~~~~~~~~\n<code>Рекомендую:</code>\n@HyipNEWS_RU`
                , { reply_markup:{inline_keyboard: inline_keyboard.link} , parse_mode: 'HTML'})

        })}

//LINKSAVE=======================================

function linksave(userId) {
    bot.sendMessage(userId, `<i>Чтобы сохранить ссылку в список, отправьте сообщение:</i>\n\n<code>/linksave</code> текст`,
        {reply_markup: {keyboard: keyboard.back, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/linksave (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const name = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){

        let linkPromise
        Link.findOne({tgId: tgId,
            name: name})
            .then((link) => {
                if (link) {
                    bot.sendMessage(chatId, `🙄 <b>В списке уже есть</b> ${name}.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    linkPromise = new Link({
                        name: name,
                        username: msg.from.username,
                        tgId: msg.from.id
                    })
                    linkPromise.save()
                        .then (_ => {

                            bot.sendMessage(chatId, `👌😎 <b>Ссылка успешно добавлена!</b>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})
//LINKDELETE=====================
function linkdel(userId) {
    bot.sendMessage(userId, `<i>Чтобы удалить ссылку из списка, отправьте сообщение:</i>\n\n<code>/linkdel</code> текст`,
        {reply_markup: {keyboard: keyboard.back, resize_keyboard: true},parse_mode: 'HTML'})}

bot.onText(/\/linkdel (.+)/, (msg, match) => {
    const chatId = msg.chat.id
    const name = match[1]
    const tgId = msg.from.id
    if(msg.text !== 'Назад'){


        Link.findOne({tgId: tgId,
            name: name})
            .then((link) => {
                if (!link) {
                    bot.sendMessage(chatId, `🙄 <b>В списке нет</b> ${name}.\n<code>повторите действие заново..</code>`
                        , {reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})
                }
                else {
                    Link.deleteOne({name: name})
                        .then(_ => {

                            bot.sendMessage(chatId, `❌ <b>Ссылка удалена!</b>`
                                ,{reply_markup: {keyboard: keyboard.home, resize_keyboard: true}, parse_mode: 'HTML'})

                        })     }
            })}

})

//ADMIN===================================
bot.onText(/\/saveadmin/, msg => {
    let adminPromise
    Admin.findOne({tgId: '184670517'})
        .then(admin => {
            if(admin) {
                bot.sendMessage(msg.from.id, 'ok')
                adminPromise = admin
            }else {
                adminPromise = new Admin({
                    tgId: '184670517'})
                adminPromise.save().then(_ =>{
                    bot.sendMessage(msg.from.id, 'admin')})
            }
        })
})
//MESSAGE=========================================
bot.onText(/\/users/, msg => {
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                bot.sendMessage(msg.from.id, `${admin.users}`)
            }
        })
})
bot.onText(/\/allusers/, msg => {
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                User.find({})
                    .then(user => {
                        console.log(user)



                    })
            }
        })
})
//-------------------------------------------------------------------
bot.onText(/\/deleteusers/, msg => {

    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                User.remove({})
                    .then(user => {

                        bot.sendMessage(msg.from.id, `${user}`)


                    })
            }
        })
})
bot.onText(/\/userdel (.+)/, (msg, match) => {
    const uid = match[1]
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                User.findOneAndRemove({tgId: uid})
                    .then(user => {

                        bot.sendMessage(msg.from.id, `${user}`)


                    })
            }
        })
})
bot.onText(/\/uidfind (.+)/, (msg, match) => {
    const uid = match[1]
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                User.findOne({tgId: uid})
                    .then(uid => {
                        bot.sendMessage(msg.from.id, `${uid}`)



                    })
            }
        })
})
bot.onText(/\/userfind (.+)/, (msg, match) => {
    const user = match[1]
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                User.findOne({username: user})
                    .then(user => {
                        bot.sendMessage(msg.from.id, `${user}`)



                    })
            }
        })
})
bot.onText(/\/chatfind (.+)/, (msg, match) => {
    const user = match[1]
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                Chat.find({username: user})
                    .then(chat => {
                        bot.sendMessage(msg.from.id, `${chat}`)



                    })
            }
        })
})
bot.onText(/\/chanfind (.+)/, (msg, match) => {
    const user = match[1]
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                Chan.find({username: user})
                    .then(chan => {
                        bot.sendMessage(msg.from.id, `${chan}`)



                    })
            }
        })
})
bot.onText(/\/linkfind (.+)/, (msg, match) => {
    const user = match[1]
    Admin.findOne({tgId: msg.from.id})
        .then(admin => {
            if(admin) {
                Link.find({username: user})
                    .then(link => {
                        bot.sendMessage(msg.from.id, `${link}`)



                    })
            }
        })
})
