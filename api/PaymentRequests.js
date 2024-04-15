const express = require ('express');
const router = express.Router();

// -------------------------For demo purposes-----------------------
const crypto = require('crypto');
const generateTransactionID = () => {
    const buffer = crypto.randomBytes(Math.ceil(10 * 3/4))
    const base64String = buffer.toString('base64')
    const alphanumericString = base64String.replace(/[^A-Z0-9]/g, '')
    const firstTwoLetters = alphanumericString.slice(0, 2).toUpperCase()
    const remainingChars = alphanumericString.slice(2, 10)
    return `${firstTwoLetters}${remainingChars}`
}
// --------------------------------------------------------------------

const Payment = require('../models/Payment');
const User = require('../models/User');
require ('dotenv').config();
const axios = require('axios');
const { generatePaymentToken } = require('../middleware/stk');
const { verifyJWT } = require('../middleware/auth');
const { updateLicense } = require('../helpers/LicenseUpdater');

router.post('/saf/pay', verifyJWT, generatePaymentToken, async (req, res) => {
    // -------------------------For demo purposes-----------------------
    const reqAmount = req.body.amount;
    const business_name = req.body.business_name;
    // ----------------------------------------------------------------
    const national_id_number = req.national_id_number;
    const phone_number = req.body.phone_number.substring(1);
    const license_id = req.body.license_id;
    const extension_plan = req.body.extension_plan;
    const timeStamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const shortCode = process.env.SHORT_CODE;
    const passKey = process.env.PASS_KEY;
    const password = Buffer.from(`${shortCode}${passKey}${timeStamp}`).toString('base64');
    const callBack = process.env.SAFCOM_STK_CALLBACK_URL;

    await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', 
        {  
            "BusinessShortCode": shortCode,   
            "Password": password,    
            "Timestamp":timeStamp,    
            "TransactionType": "CustomerPayBillOnline",    
            "Amount": "1",    
            "PartyA":`254${phone_number}`,    
            "PartyB":shortCode,    
            "PhoneNumber":`254${phone_number}`,    
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
        const user = User.findOne({ national_id_number: national_id_number });
        const receiptDetails = new Payment({
            payment_method: 'M-Pesa',
            transaction_id: generateTransactionID(),
            amount: reqAmount,
            transaction_date: new Date(),
            business_name: business_name,
            business_id: business_id,
            license_ref: license_id,
            initiator: user._id,
            phone_number: phone_number,
            extension: extension_plan,
        });
        receiptDetails.save();
        updateLicense(license_id, extension_plan);
        res.status(200).json({ message: 'Payment request sent successfully', data: receiptDetails });
    })
    .catch((error) => {
        console.error(error);
        res.status(400).json(err.message);
    });
})
         
module.exports = router;
