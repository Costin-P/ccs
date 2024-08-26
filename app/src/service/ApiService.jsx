import { encryptData, decryptData } from "@/service/CryptoService";

export const ApiService = async (path, data) => {
 try {
  const url = `${import.meta.env.VITE_API}${path}`;

  const options = {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
  };

  let cryptedData = null;
  
  if (data) {
    cryptedData = await encryptData(JSON.stringify({
      data,
      service_id: import.meta.env.VITE_UNIQUE_SERVICE_ID,
    }));
  } else {
    cryptedData = await encryptData(JSON.stringify({
      service_id: import.meta.env.VITE_UNIQUE_SERVICE_ID,
    }));
  }
  
  options.body = JSON.stringify({crypted:cryptedData});

  const query = await fetch(url, options);

  const response = await query.json();

  const decrypted = await decryptData(response.crypted)

  return decrypted;
 } catch (error) {
  return { success: false, message: error.message };
 }
};
