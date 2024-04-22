const express = require('express');
const router = express.Router();

// -------------------------For demo purposes-----------------------
const crypto = require('crypto');
const generateTransactionID = () => {
    const buffer = crypto.randomBytes(Math.ceil(10 * 3 / 4))
    const base64String = buffer.toString('base64')
    const alphanumericString = base64String.replace(/[^A-Z0-9]/g, '')
    const firstTwoLetters = alphanumericString.slice(0, 2).toUpperCase()
    const remainingChars = alphanumericString.slice(2, 10)
    return `${firstTwoLetters}${remainingChars}`
}
// --------------------------------------------------------------------

const Payment = require('../models/Payment');
const License = require('../models/License');
const User = require('../models/User');
require('dotenv').config();
const axios = require('axios');
const { generatePaymentToken } = require('../middleware/stk');
const { verifyJWT } = require('../middleware/auth');
const { updateLicense } = require('../helpers/LicenseUpdater');

router.get('/receipts', verifyJWT, async (req, res) => {
    const national_id_number = req.national_id_number;
    const user = await User.findOne({ national_id_number: national_id_number });
    try {
        const payments = await Payment.find({ initiator: user._id });
        res.status(200).json({ message: 'Payments retrieved successfully', payments: payments });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while retrieving payments' });
    }
})

router.post('/saf/pay', verifyJWT, generatePaymentToken, async (req, res) => {
    // -------------------------For demo purposes-----------------------
    const reqAmount = req.body.amount;
    const business_name = req.body.business_name;
    // ----------------------------------------------------------------
    const national_id_number = req.national_id_number;
    const phone_number = req.body.phone_number.substring(1);
    console.log(`Phone number: ${phone_number}`);
    const license_id = req.body.license_id;
    const extension_plan = req.body.extension_plan;
    console.log(`Extension plan: ${extension_plan}`);
    const timeStamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    console.log(`Timestamp: ${timeStamp}`);
    const shortCode = process.env.SHORT_CODE;
    console.log(`Short code: ${shortCode}`);
    const passKey = process.env.PASS_KEY;
    console.log(`Pass key: ${passKey}`);
    const password = Buffer.from(`${shortCode}${passKey}${timeStamp}`).toString('base64');
    console.log(`Password: ${password}`);
    const callBack = process.env.SAFCOM_STK_CALLBACK_URL;
    console.log(`Callback: ${callBack}`);

    const user = await User.findOne({ national_id_number: national_id_number });
    const license = await License.findOne({ _id: license_id });
    if (!license) {
        return res.status(404).json({ message: 'License not found' });
    }
    else {
        await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                "BusinessShortCode": shortCode,
                "Password": password,
                "Timestamp": timeStamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": "1",
                "PartyA": `254${phone_number}`,
                "PartyB": shortCode,
                "PhoneNumber": `254${phone_number}`,
                "CallBackURL": callBack,
                "AccountReference": license_id,
                "TransactionDesc": `${extension_plan} license extension`
            },
            {
                headers: {
                    Authorization: `Bearer ${paymentToken}`,
                }
            }
        )
            .then((response) => {
                console.log(response.data);
                const newPayment = new Payment({
                    payment_method: 'M-Pesa',
                    transaction_id: generateTransactionID(),
                    amount: reqAmount,
                    transaction_date: new Date(),
                    business_name: business_name,
                    license_ref: license_id,
                    initiator: user._id,
                    phone_number: phone_number,
                    extension: extension_plan,
                });
                newPayment.save();
                updateLicense(license, extension_plan);
                res.status(200).json({ message: 'Payment request sent successfully', payment: newPayment });
            })
            .catch((error) => {
                console.error(error);
                res.status(400).json(`Error with stkpush process request: ${error}`);
            });
    }
})

router.post('/bypass/pay', verifyJWT, async (req, res) => {
    const reqAmount = req.body.amount;
    const business_name = req.body.business_name;
    const national_id_number = req.national_id_number;
    const phone_number = req.body.phone_number.substring(1);
    const license_id = req.body.license_id;
    const extension_plan = req.body.extension_plan;
    try {
        const user = await User.findOne({ national_id_number: national_id_number });
        const newPayment = new Payment({
            payment_method: 'M-Pesa',
            transaction_id: generateTransactionID(),
            amount: reqAmount,
            transaction_date: new Date(),
            business_name: business_name,
            license_ref: license_id,
            initiator: user._id,
            phone_number: phone_number,
            extension: extension_plan,
        });
        await newPayment.save();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while saving payment' });
    }
})

module.exports = router;
