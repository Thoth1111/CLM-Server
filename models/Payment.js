const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    payment_method: {
        type: String,
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    transaction_date: {
        type: Date,
        required: true,
    },
    business_name: {
        type: String,
        required: true,
    },
    business_id: {
        type: String,
        required: true,
    },
    license_ref: {
        type: Schema.Types.ObjectId,
        ref: 'License',
    },
    initiator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    phone_number: {
        type: String,
        required: true,
    },
    extension: {
        type: String,
        required: true,
    }
})

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;