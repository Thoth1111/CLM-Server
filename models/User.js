const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    phone_number: {type: String, required: true},
});

const User = mongoose.model('User', UserSchema);

module.exports = User;