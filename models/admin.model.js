const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AdminSchema = new Schema({
        name: String,
        tgId: {type: Number, default: '184670517'},
        users: {type: Number, default: 0}
        },
    { versionKey: false });

mongoose.model('admin', AdminSchema)