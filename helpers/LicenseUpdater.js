const updateLicense = async (license, extensionPlan) => {
    if (license.expiry_date < new Date()) {
      license.effective_date = new Date(license.expiry_date.getTime() + 86400000);
    }
    switch (extensionPlan) {
        case '1 year':
            license.expiry_date = new Date(license.expiry_date).getFullYear() + 1;
            break;
        case '6 months':
            license.expiry_date = new Date(license.expiry_date).getMonth() + 6;
            break;
        case '3 months':
            license.expiry_date = new Date(license.expiry_date).getMonth() + 3;
            break;
        default:
            break;
    }
    const updatedLicense = await license.save();
    console.log(updatedLicense);
    return updatedLicense;
}

module.exports = { updateLicense };