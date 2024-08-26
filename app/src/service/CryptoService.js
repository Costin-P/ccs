import CryptoJS from 'crypto-js'


export async function encryptData(data) {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_CRYPTO_KEY).toString()
    return encrypted
  } catch (error) {
    return false
  }
}

export async function decryptData(encryptedData) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, import.meta.env.VITE_CRYPTO_KEY)
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
    return decrypted
  } catch (error) {
    return false
  }
}
