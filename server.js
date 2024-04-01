require ('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');
const port  = process.env.PORT || 8000;
const UserRouter = require('./api/UserRequests');
const LicenseRouter = require('./api/LicenseRequests');
const PaymentRouter = require('./api/PaymentRequests');
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
app.post(`/${callback}`, (req, res) => {
    const callbackData = req.body;
    console.log(callbackData);
    if(callbackData.body.stkCallback.CallbackMetadata){
        console.log(callbackData.body.stkCallback.CallbackMetadata);
        return res.json('Ok');
    }
    return res.json('Ok');
})