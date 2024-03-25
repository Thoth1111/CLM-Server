require ('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const app = express();
const port  = process.env.PORT || 8000;

const uri = process.env.MONGODB_URI;
console.log(uri);

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