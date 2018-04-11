const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
        name: String,
        username: String,
        tgId: {type: Number, required: true}
   },
    { versionKey: false });

mongoose.model('users', UserSchema)