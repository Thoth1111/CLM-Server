const express = require ('express');
const router = express.Router();
// const Payment = require('../models/Payment');
require ('dotenv').config();
const axios = require('axios');
const { generatePaymentToken } = require('../middleware/stk');
const { verifyJWT } = require('../middleware/auth');

router.post('/saf/pay', verifyJWT, generatePaymentToken, async (req, res) => {
    // const amount = req.body.amount;
    const phone_number = req.body.phone_number.substring(1);
    // const license_id = req.body.license_id;
    // const extension = req.body.extension;
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
            "AccountReference":"Test",    
            "TransactionDesc":"Test Payment"
        }, 
        {
            headers: {
                Authorization: `Bearer ${paymentToken}`,
            }
        }
    )
    .then((response) => {
        console.log(response.data);
        res.status(200).json({ message: 'Payment request sent successfully', data: response.data });
    })
    .catch((error) => {
        console.error(error);
        res.status(400).json(err.message);
    });
})
         
module.exports = router;
