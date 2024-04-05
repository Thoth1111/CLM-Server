const express = require('express');
const router = express.Router();

// Load License model
const License = require('../models/License');
const User = require('../models/User');
const { verifyJWT } = require('../middleware/auth');

// Add a new license
router.post('/new', verifyJWT, async (req, res) => {
    const { business_id, business_name, kra_pin, activity_code, effective_date, expiry_date, location } = req.body;
    const user = await User.findOne({ national_id_number: req.national_id_number });
    try {
        const existingLicense = await License.findOne({ business_id });
        if (existingLicense) return res.status(400).json({ message: 'License already exists in your manager' });
        const newLicense = new License({
            user_id: user._id,
            business_name,
            business_id,
            kra_pin,
            activity_code,
            effective_date,
            expiry_date,
            location,
        });
        const savedLicense = await newLicense.save();
        res.status(201).json({ message: 'License added successfully', data: savedLicense });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while adding license' });
    }
})

// Get a user's licenses
router.get('/saved', verifyJWT, async (req, res) => {
    const user = await User.findOne({ national_id_number: req.national_id_number });
    try {
        const licenses = await License.find({ user_id: user._id });
        res.status(200).json({ message: 'Licenses retrieved successfully', licenses: licenses });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while retrieving licenses' });
    }
})

// Get a specific license
router.get('/:license_id', verifyJWT, async (req, res) => {
    const { license_id } = req.params;
    const user = await User.findOne({ national_id_number: req.national_id_number });
    try {
        const license = await License.findOne({ _id: license_id, user_id: user._id });
        if (!license) return res.status(404).json({ message: 'License not found' });
        res.status(200).json({ message: 'License retrieved successfully', license: license });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while retrieving license' });
    }
})

// Remove a license
router.delete('/:license_id', verifyJWT, async (req, res) => {
    const { license_id } = req.params
    const user = await User.findOne({ national_id_number: req.national_id_number });
    try {
        const license = await License.findOne({ _id: license_id, user_id: user._id });
        if (!license) return res.status(404).json({ message: 'License not found' });
        await License.deleteOne({ _id: req.params.license_id });
        res.status(204).json({ message: 'License removed successfully' });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Internal server error while removing license' });
    }
})

module.exports = router;