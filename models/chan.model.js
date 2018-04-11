const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChanSchema = new Schema({
        name: String,
        username: String,
        tgId: Number
    },
    {versionKey: false});

mongoose.model('chan', ChanSchema)