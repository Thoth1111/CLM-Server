require('dotenv').config;
const axios = require('axios');

const generatePaymentToken = async (req, res, next) => {
    const secret = process.env.SECRET_KEY;
    const consumer = process.env.CONSUMER_KEY;
    const basicAuth = Buffer.from(`${consumer}:${secret}`).toString('base64');
    axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${basicAuth}`
        }
    })
    .then((res) => {
        console.log(res.data);
        paymentToken = res.data.access_token;
        next();
    })
    .catch((err) => {
        console.error(err);
        res.status(400).json(err.message);
    });
}

module.exports = { generatePaymentToken };