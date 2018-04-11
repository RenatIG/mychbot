const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatSchema = new Schema({
        name: String,
        username: String,
        tgId: Number
        },
    {versionKey: false});

mongoose.model('chat', ChatSchema)