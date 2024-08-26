var CryptoJS = require("crypto-js");

const decrypt_middleware = () => {
 return (req, res, next) => {
  try {
   const { crypted } = req.body;

   if (!crypted) {
    return res.status(400).json({
     success: false,
     message: "Invalid request",
    });
   }

   const decryptedString = JSON.parse(
    CryptoJS.AES.decrypt(crypted, process.env.CRYPTO_KEY).toString(CryptoJS.enc.Utf8)
   );
   const decryptedData = JSON.parse(decryptedString);

   const expected_service_id = process.env.VITE_UNIQUE_SERVICE_ID;

   if (String(expected_service_id) !== String(decryptedData.service_id)) {
    return res.status(401).json({
     success: false,
     message: "Invalid service id",
    });
   }

   req.body = decryptedData;

   next();
  } catch (error) {
   return res.status(500).json({
    success: false,
    message: "Invalid data",
    error: error.message,
   });
  }
 };
};

module.exports = decrypt_middleware;
