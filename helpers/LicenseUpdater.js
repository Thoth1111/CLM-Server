const License = require('../models/License');

const updateLicense = async (license_id, extensionPlan) => {
    console.log(license_id, extensionPlan);
    const license = await License.findOne({ _id: license_id });
    console.log(license);
    console.log(`initial expiry: ${license.expiry_date}`);
    if (!license) return { message: 'License not found' };
    if (license.expiry_date < new Date()) {
        console.log(`initial effective date: ${license.effective_date}`);
        license.effective_date = new Date(license.expiry_date.getTime() + 86400000);
        console.log(`updated effective date: ${license.effective_date}`);
    }
    switch (extensionPlan) {
        case '1 year':
            license.expiry_date.setFullYear(license.expiry_date.getFullYear() + 1);
            console.log(`updated expiry date: ${license.expiry_date}`);
            break;
        case '6 months':
            license.expiry_date.setMonth(license.expiry_date.getMonth() + 6);
            console.log(`updated expiry date: ${license.expiry_date}`);
            break; 
        case '3 months':
            license.expiry_date.setMonth(license.expiry_date.getMonth() + 3);
            console.log(`updated expiry date: ${license.expiry_date}`);
            break;
        default:
            break;
    }
    const updatedLicense = await license.save();
    return { data: updatedLicense }
}

module.exports = { updateLicense };