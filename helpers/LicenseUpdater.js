const updateLicense = async (license, extensionPlan) => {
    const oldExpiryDate = new Date(license.expiry_date);
    if (oldExpiryDate < new Date()) {
        license.effective_date = new Date(oldExpiryDate.getTime() + 86400000);
    }    
    switch (extensionPlan) {
        case '1 year':
            oldExpiryDate.setFullYear(oldExpiryDate.getFullYear() + 1);
            break;
        case '6 months':
            oldExpiryDate.setMonth(oldExpiryDate.getMonth() + 6);
            break;
        case '3 months':
            oldExpiryDate.setMonth(oldExpiryDate.getMonth() + 3);
            break;
        default:
            break;
    }
    license.expiry_date = oldExpiryDate;
    const updatedLicense = await license.save();
    return updatedLicense;
}

module.exports = { updateLicense };