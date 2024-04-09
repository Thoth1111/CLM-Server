const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LicenseSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    business_name: {
        type: String,
        required: true,
    },
    business_id: {
        type: String,
        required: true,
        unique: true,
    },
    kra_pin: {
        type: String,
        required: true,
    },
    activity_code: {
        type: String,
        required: true,
    },
    fee: {
        type: Number,
        required: true,
    },
    effective_date: {
        type: Date,
        required: true,
    },
    expiry_date: {
        type: Date,
        required: true,
    },
    location: {
        type: Object,
        required: true,
        constituency: {
            type: String,
            required: true,
        },
        ward: {
            type: String,
            required: true,
        },
        plot_number: {
            type: String,
            required: true,
        },
        road_street: {
            type: String,
            required: true,
        },
        building: {
            type: String,
            required: false,
        },
        floor: {
            type: String,
            required: false,
        },
        stall_number: {
            type: String,
            required: false,
        },
    },
}, 
    { timestamps: true }
);

const License = mongoose.model('License', LicenseSchema);

module.exports = License;