const { v4: uuidv4 } = require('uuid');
const { qrGenerate } = require('./qrGenerator');

const updateLicense = async (license, extensionPlan) => {
    const qrID = uuidv4();
    license.qr_code_id = qrID;
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
    const qr_code_buffer = qrGenerate(
        qrID, 
        license.business_name, 
        expiryDate, 
        license.location.constituency, 
        license.location.ward, 
        license.location.plot_number, 
        license.location.road_street, 
        license.location.building, 
        license.location.floor, 
        license.location.stall_number
    )
    license.qr_code_buffer = qr_code_buffer;
    const updatedLicense = await license.save();
    return updatedLicense;
}

module.exports = { updateLicense };