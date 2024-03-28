const jwt = require('jsonwebtoken');
require ('dotenv').config();

const generateAccessToken = (nationalId) => {
    return jwt.sign(nationalId, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
}

const generateRefreshToken = (nationalId) => {
    return jwt.sign(nationalId, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'});
}

const verifyJWT = (req, res, next) => {
    const authHeader =  req.headers['authorization'];
    const refreshToken = authHeader && authHeader.split(' ')[1];
    if (!refreshToken) return res.status(401).send({message: 'Unauthorized Action'});
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).send({message: 'Invalid token'});
        req.user = decoded.national_id_number;
        next();
    })
}

module.exports = { generateAccessToken, generateRefreshToken, verifyJWT };