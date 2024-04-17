const qr = require('qr-image');

const qrGenerate = (qrID) => {
    const validationCode = JSON.stringify({ qrID });
    const qr_png_buffer = qr.imageSync(validationCode, { type: 'png', errorCorrectionLevel: 'H', size: 10 });
    // const pathDirectory = 'public/qrCodes';
    // if (!fs.existsSync(pathDirectory)) {
    //     fs.mkdirSync(pathDirectory, { recursive: true }, (err) => {
    //         if (err) {
    //             console.error(`qr_code_directory_creation_error: ${err}`);
    //         }
    //     });
    // }
    // qr.toFile(`public/qrCodes/${business_name}.png`, qrData, { errorCorrectionLevel: 'H' 
    // }, (err) => {
    //     if (err){
    //         console.error(`qr_code_generator_error: ${err}`);
    //     } else {
    //         console.log('QR code generated successfully');
    //     }
    // });
    return qr_png_buffer;
}

module.exports = { qrGenerate };