const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    national_id_number: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        min: 8,
        max: 20,
    },
    role: {
        type: String,
        default: 'license_holder',
    },
    refresh_tokens: {
        type: [String],
        default: [],
    },
    confirmed: {
        type: Boolean,
        default: false,
    },
    confrimationCode: {
        type: String,
        default: '',
    },
},
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;