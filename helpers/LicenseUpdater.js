const { v4: uuidv4 } = require('uuid');
import { qrGenerate, deleteQRImage } from './qrGenerator';

const updateLicense = async (license, extensionPlan) => {
    const qrID = uuidv4();
    if (license.qr_code_id) {
        deleteQRImage(license.qr_code_id);
    }
    license.qr_code_id = qrID;
    let oldExpiryDate = new Date(license.expiry_date);
    if (oldExpiryDate < new Date()) {
        license.effective_date = new Date(oldExpiryDate.getTime() + 86400000);
        oldExpiryDate = new Date(license.effective_date);
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
    qrGenerate(
        qrID, 
        license.business_name, 
        oldExpiryDate, 
        license.location.constituency, 
        license.location.ward, 
        license.location.plot_number, 
        license.location.road_street, 
        license.location.building, 
        license.location.floor, 
        license.location.stall_number
    )
    const updatedLicense = await license.save();
    return updatedLicense;
}

module.exports = { updateLicense };