const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LinkSchema = new Schema({
        name: String,
        username: String,
        tgId: Number
    },
    {versionKey: false});

mongoose.model('link', LinkSchema)