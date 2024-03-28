const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Load User model
const User = require('../models/User');

// Password hashing
const bcrypt = require('bcrypt');

// Register a new user
router.post('/register', async (req, res) => {
    let { email, national_id_number, phone_number, password } = req.body;
    email = email.trim();
    national_id_number = national_id_number.trim();
    phone_number = phone_number.trim();
    password = password.trim();

    if (!email || !password || !phone_number || !national_id_number) {
        return res.status(400).json({ message: 'Invalid input due to blank fields' });
    } else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        return res.status(400).json({ message: 'Invalid format for email' });
    } else if (!phone_number.match(/^0\d{9}$/) || !national_id_number.match(/^\d{8}$/)) {
        return res.status(400).json({ message: 'Invalid format for phone or id number' });
    } else if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)) {
        return res.status(400).json({ message: 'Password must be 8 characters long with a special character, number and uppercase letter' });
    } else {
        // Check if user exists
        try {
            const existingUser = await User.findOne({ email })
            if (existingUser) {
                return res.status(400).json({ message: 'A user with that email already exists' });
            }
            // Create a new user document
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newUser = new User({
                email,
                national_id_number,
                phone_number,
                password: hashedPassword,
                refresh_tokens: []
            })
            const accessToken = jwt.sign({ national_id_number }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
            const refreshToken = jwt.sign({ national_id_number }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
            newUser.refresh_tokens.push(refreshToken);
            const savedUser = await newUser.save()
            res.status(201).json({ message: 'User created successfully', data: savedUser.refresh_tokens, accessToken: accessToken, refreshToken: refreshToken });

        } catch (e) {
            console.error(e);
            res.status(500).json({ message: 'Internal server error while creating user' });
        }
    }
})

// Login a user
router.post('/login', async (req, res) => {
    let { national_id_number, password } = req.body;
    national_id_number = national_id_number.trim();
    password = password.trim();

    if (!national_id_number || !password) {
        return res.status(400).json({ message: 'Empty credentials supplied' });
    } else {
        try {
            const user = await User.findOne({ national_id_number });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            } else {
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    const accessToken = jwt.sign({ national_id_number }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
                    const refreshToken = jwt.sign({ national_id_number }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });
                    user.refresh_tokens.push(refreshToken);
                    return res.status(200).json({ message: 'Successful login', data: user, accessToken: accessToken, refreshToken: refreshToken });
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

// Logout user
router.delete('/logout', async (req, res) => {
    const { national_id_number, refreshToken } = req.body;
    if (!national_id_number) return res.status(400).json({ message: 'Unable to Logout due to missing Parameters' });
    try {
        const user = await User.findOne({ national_id_number });
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.refresh_tokens = user.refresh_tokens.filter(token => token !== refreshToken);
        await user.save();
        res.status(204).json({ message: 'User logged out successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while logging out user' });
    }
})

module.exports = router;