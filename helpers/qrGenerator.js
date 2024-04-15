const qr = require('qrcode');
const fs = require('fs');

const qrGenerate = (qrID, business_name, expiry_date, constituency, ward, plot_number, road_street, building, floor, stall_number) => {
    const qrData = JSON.stringify({
        qrID,
        business_name,
        expiry_date,
        constituency,
        ward,
        plot_number,
        road_street,
        building,
        floor,
        stall_number,
    });
    qr.toFile(`public/qr_codes/${business_name}.png`, qrData, { errorCorrectionLevel: 'H' 
    }, (err) => {
        if (err){
            console.error(`qr_code_generator_error: ${err}`);
        } else {
            console.log('QR code generated successfully');
        }
    });
}

const deleteQRImage = (business_name) => {
    if (fs.existsSync(`public/qr_codes/${business_name}.png`)) {
        fs.unlink(`public/qr_codes/${business_name}.png`, (err) => {
            if (err) {
                console.error(`qr_code_deletion_error: ${err}`);
            }
        });
    }
}

module.exports = { qrGenerate, deleteQRImage };