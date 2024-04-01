const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    payment_method: {
        type: String,
        required: true,
    },
    payment_reference: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transaction_id: {
        type: String,
        required: true,
    },
    transaction_date: {
        type: Date,
        required: true,
    },
    extension_plan: {
        type: String,
        required: true,
        options: ['monthly', 'quarterly', 'bi-annually', 'annually'],
    },
    license_id: {
        type: Schema.Types.ObjectId,
        ref: 'License',
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
})

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;