require ('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const port  = process.env.PORT || 8000;
const UserRouter = require('./api/UserRequests');
const LicenseRouter = require('./api/LicenseRequests');
const PaymentRouter = require('./api/PaymentRequests');
// const Payment = require('./models/Payment');
// const License = require('./models/License');
const bodyParser = require('body-parser');
const callback = process.env.SAFCOM_STK_CALLBACK_URL;

const uri = process.env.MONGODB_CONNECTION_STRING;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/user', UserRouter);
app.use('/license', LicenseRouter);
app.use('/payment', PaymentRouter);

async function connect() {
    try {
        await mongoose.connect(uri)
        console.log('Connected to the database');
    }
    catch (e) {
        console.error(e);
    }
}

connect().catch(console.error);

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
});

// Listen for Safaricom stk push callback
app.post(callback, (req, res) => {
    // const { license_id, extension } = req.params
    // console.log(`license_id: ${license_id}, extension: ${extension}`);
    // const license = License.findOne({ _id: license_id });
    const callbackData = req.body;
    console.log(callbackData.Body);
    if (callbackData.Body.ResultCode !== 0) {
        console.log(callbackData.Body.ResultDesc);
    } else {
    console.log(callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value, callbackData.Body.stkCallback.CallbackMetadata.Item[1].Value, callbackData.Body.stkCallback.CallbackMetadata.Item[3].Value, callbackData.Body.stkCallback.CallbackMetadata.Item[4].Value);
    }
    return res.json('Ok');
    // const payment_method = 'M-Pesa';
    // const transaction_id = callbackData.Body.stkCallback.CallbackMetadata.Item[1].Value;
    // const amount = callbackData.Body.stkCallback.CallbackMetadata.Item[0].Value;
    // const transaction_date = callbackData.Body.stkCallback.CallbackMetadata.Item[3].Value;
    // const phone_number = callbackData.Body.stkCallback.CallbackMetadata.Item[4].Value;
    // const bunsiness_name = license.business_name;
    // const business_id = license.business_id;
    // const license_ref = license._id;
    // const initiator = license.user_id;    
});