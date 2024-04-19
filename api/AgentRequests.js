const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const License = require('../models/License');
const User = require('../models/User');
const { verifyAgentJWT } = require('../middleware/auth');

// Enlist a new agent
router.post('/enlist', async (req, res) => {
    let { email, national_id_number, agent_id, phone_number, password, jurisdiction } = req.body;
    email = email.trim();
    national_id_number = national_id_number.trim();
    agent_id = agent_id.trim();
    phone_number = phone_number.trim();
    password = password.trim();
    jurisdiction = jurisdiction.trim();

    if (!email || !national_id_number || !agent_id || !phone_number || !password || !jurisdiction) {
        return res.status(400).json({message: 'Invalid input due to blank fields'})
    } else if (
        !email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) || 
        !phone_number.match(/^0\d{9}$/) || 
        !national_id_number.match(/^\d{8}$/) || 
        !password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/))
    {
        return res.status(400).json({ message: 'Invalid format for one or more inputs' });    
    } else {
        try {
            const existingAgent = await User.findOne({ agent_id })
            if (existingAgent) {
                return res.status(400).json({ message: 'An agent with that id already exists' });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newAgent = new User({
                email,
                national_id_number,
                agent_id,
                phone_number,
                role: 'agent',
                password: hashedPassword,
                jurisdiction,
                refresh_tokens: []
            })
            const refreshToken = jwt.sign({ agent_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d'});
            newAgent.refresh_tokens.push(refreshToken);
            const savedAgent = await newAgent.save()
            res.status(201).json({ message: 'Agent enlisted successfully', agent_id: savedAgent.agent_id });
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Internal server error while enlisting agent' });
        }
    }        
})

// Login an agent
router.post('/login', async (req, res) => {
    let { agent_id, password } = req.body;
    agent_id = agent_id.trim();
    password = password.trim();

    if (!agent_id || !password) {
        return res.status(400).json({ message: 'Empty credentials supplied' });
    } else {
        try {
            const user = await User.findOne({ agent_id });
            if (!user) {
                return res.status(404).json({ message: 'Agent not found' });
            } else {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const accessToken = jwt.sign({ agent_id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
                    const refreshToken = jwt.sign({ agent_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
                    user.refresh_tokens.push(refreshToken);
                    await user.save();
                    return res.status(200).json({ message: 'Successful login', agent_id: user.agent_id_number, accessToken: accessToken, refreshToken: refreshToken, jurisdiction: user.jurisdiction });
                } else {
                    return res.status(401).json({ message: 'Invalid credentials' });
                }
            }
        }
        catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Internal server error while logging in user' });
        }
    }
})

// logout an agent
router.delete('/logout/:agent_id', async (req, res) => {
    const { agent_id } = req.params;
    try {
        const user = await User.findOne({ agent_id });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.refresh_tokens = [];
        await user.save();
        res.status(204).json({ message: 'User logged out successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while logging out user' });
    }
})

// get due and expired licenses by jurisdiction
router.get('/licenses/:jurisdiction', verifyAgentJWT, async (req, res) => {
    const ward = req.ward;
    const today = new Date();
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(today.getMonth() + 1);
    try {
        const licenses = await License.find({ 'location.ward': ward, $or: [
            //Expiry date is in the past or one month from today
            { expiry_date: { $lt: today} },
            { expiry_date: { $lt: oneMonthFromNow } }
        ]})
        res.status(200).json({ message: 'Licenses retrieved successfully', licenses: licenses });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while retrieving licenses' });
    }
})

// scan and retrieve a license by QR code
router.post('/scan', verifyAgentJWT, async (req, res) => {
    const { qr_code_id } = req.body;
    try {
        const license = await License.findOne({ qr_code_id});
        if (!license) return res.status(404).json({ message: 'No license found or invalid qr code' });
        const retrievedLicense = {
            business_name: license.business_name,
            business_id: license.business_id,
            activity_code: license.activity_code,
            fee: license.fee,
            effective_date: license.effective_date,
            expiry_date: license.expiry_date,
            location: license.location
        }
        res.status(200).json({ message: 'License retrieved successfully', license: retrievedLicense });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while retrieving license' });
    }
})

module.exports = router;