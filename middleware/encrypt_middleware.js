const CryptoJS = require("crypto-js");

const encrypt_middleware = () => {
  return (req, res, next) => {
    // Store the original res.json method
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      try {
        // Encrypt the data before sending it
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.CRYPTO_KEY).toString();

        // Send the encrypted data
        return originalJson({ crypted: encryptedData });
      } catch (error) {
        // Send an error response if encryption fails
        return originalJson({
          success: false,
          message: "Failed to encrypt data",
          error: error.message,
        });
      }
    };

    // Proceed to the next middleware or route handler
    next();
  };
};

module.exports = encrypt_middleware;
