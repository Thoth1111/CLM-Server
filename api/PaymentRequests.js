const express = require ('express');
const router = express.Router();
// const Payment = require('../models/Payment');
require ('dotenv').config();
const axios = require('axios');
const { generatePaymentToken } = require('../middleware/stk');

router.post('/pay', generatePaymentToken, async (req, res) => {
    // const amount = req.body.amount;
    const phoneNumber = req.body.phone_number.substring(1);
    const timeStamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    const shortCode = process.env.SHORT_CODE;
    const passKey = process.env.PASS_KEY;
    const password = Buffer.from(`${shortCode}${passKey}${timeStamp}`).toString('base64');
    const callBackURL = process.env.CALL_BACK_URL;

    await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', 
        {  
            "BusinessShortCode": shortCode,   
            "Password": password,    
            "Timestamp":timeStamp,    
            "TransactionType": "CustomerPayBillOnline",    
            "Amount": "0",    
            "PartyA":`254${phoneNumber}`,    
            "PartyB":shortCode,    
            "PhoneNumber":`254${phoneNumber}`,    
            "CallBackURL": callBackURL,    
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
