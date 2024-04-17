const { v4: uuidv4 } = require('uuid');
const { qrGenerate } = require('./qrGenerator');

const updateLicense = async (license, extensionPlan) => {
    const qr_code_id = uuidv4();
    license.qr_code_id = qr_code_id;
    let expiryDate = new Date(license.expiry_date);
    if (expiryDate < new Date()) {
        license.effective_date = new Date(expiryDate.getTime() + 86400000);
        expiryDate = new Date(license.effective_date);
    }    
    switch (extensionPlan) {
        case '1 year':
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            break;
        case '6 months':
            expiryDate.setMonth(expiryDate.getMonth() + 6);
            break;
        case '3 months':
            expiryDate.setMonth(expiryDate.getMonth() + 3);
            break;
        default:
            break;
    }
    license.expiry_date = expiryDate;
    const qr_code_buffer = qrGenerate(qr_code_id);
    license.qr_code_buffer = qr_code_buffer;
    await license.save();
}

module.exports = { updateLicense };