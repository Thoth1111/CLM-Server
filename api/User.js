const express = require('express');
router = express.Router();

// Load User model
const User = require('../models/User');

// Password hashing
const bcrypt = require('bcrypt');

// Register a new user
router.post('/register', (req, res) => {
    let { email, password, phone_number } = req.body;
    email = email.trim();
    password = password.trim();
    phone_number = phone_number.trim();

    if (!email || !password || !phone_number) {
        return res.status(400).json({ message: 'Invalid input' });
    } else if (!email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
        return res.status(400).json({ message: 'Invalid email' });
    } else if (!phone_number.match(/^0\d{9}$/)) {
        return res.status(400).json({ message: 'Invalid phone number.' });
    } else if (!password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/)) {
        return res.status(400).json({ message: 'Password must be 8 characters long with a special character, number and uppercase letter' });
    } else {
        // Check if user exists
        User.find({email}).then(result => {
            if (result.length > 0) {
                return res.status(400).json({ message: 'A user with that email already exists' });
            } else {
                // Create a new user
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        email,
                        password: hashedPassword,
                        phone_number
                    });
                    newUser.save().then(result => {
                        res.status(201).json({ message: 'User created successfully', data: result });
                    })
                        .catch(e => {
                            console.error(e);
                            res.status(500).json({ message: 'Internal server error while saving user' });
                        })
                })
                    .catch(e => {
                        console.error(e);
                        res.status(500).json({ message: 'Internal server error while hashing password' });
                    })
            }
        }).catch(e => {
            console.error(e);
            res.status(500).json({ message: 'Internal server error while checking for user' });
        })
    }
})

// Login a user
// router.post('/login', (req, res) => {

// })