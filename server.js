require ('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port  = process.env.PORT || 8000;
const UserRouter = require('./api/User');
const bodyParser = require('body-parser');

const uri = process.env.MONGODB_URI;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/user', UserRouter);

async function connect() {
    try {
        await mongoose.connect(uri)
        console.log('Connected to the database');
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await mongoose.connection.close();
    }
}

connect().catch(console.error);

app.listen(8000, ()=> {
    console.log(`Server started on port ${port}`);
});