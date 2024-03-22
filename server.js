require('./config/db');

const app = require('express')();
const port = process.env.PORT || 3000;

const bodyParser = require('express');
app.use(bodyParser());

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});