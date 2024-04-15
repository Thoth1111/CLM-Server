const License = require('../models/License');

const updateLicense = async (license_id, extensionPlan) => {
    const license = await License.findOne({ _id: license_id });
    if (!license) return { message: 'License not found' };
    if (license.expiry_date < new Date()) license.effective_date = license.expiry_date + 1;
    switch (extensionPlan) {
        case '1 year':
            license.expiry_date.setFullYear(license.expiry_date.getFullYear() + 1);
            break;
        case '6 months':
            license.expiry_date.setMonth(license.expiry_date.getMonth() + 6);
            break; 
        case '3 months':
            license.expiry_date.setMonth(license.expiry_date.getMonth() + 3);
            break;
        default:
            break;
    }
    await license.save();
}

module.exports = { updateLicense };