const jwt = require('jsonwebtoken');
require ('dotenv').config();

const verifyJWT = (req, res, next) => {
    const authHeader =  req.headers['Authorization'];
    console.log(req.headers)
    console.log(authHeader)
    const refreshToken = authHeader && authHeader.split(' ')[1];
    console.log(refreshToken)
    if (!refreshToken) return res.status(401).send({message: 'Unauthorized Action'});
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).send({message: 'Invalid token'});
        console.log(decoded);
        req.national_id_number = decoded.national_id_number;
        next();
    })
}

module.exports = { verifyJWT };