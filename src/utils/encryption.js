import CryptoJS from 'crypto-js';

// Generate a random encryption key
const generateKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

const deriveKey = (password, salt) => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });
};

// Encrypt a message with a given key
export const encryptMessage = (message, key) => {
  try {
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const derivedKey = deriveKey(key, salt);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    const encrypted = CryptoJS.AES.encrypt(message, derivedKey, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    return {
      encrypted: encrypted.toString(),
      salt: salt.toString(),
      iv: iv.toString()
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
};

// Decrypt a message with a given key
export const decryptMessage = (encryptedData, key) => {
  try {
    const { encrypted, salt, iv } = encryptedData;
    const derivedKey = deriveKey(key, salt);

    const decrypted = CryptoJS.AES.decrypt(encrypted, derivedKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
};

// Generate a key pair for end-to-end encryption
export const generateKeyPair = () => {
  const privateKey = generateKey();
  const publicKey = CryptoJS.SHA256(privateKey).toString();
  return { privateKey, publicKey };
};

// Encrypt a message for a specific recipient using their public key
export const encryptForRecipient = (message, recipientPublicKey) => {
  try {
    const sessionKey = generateKey();
    const encryptedMessage = encryptMessage(message, sessionKey);
    const encryptedSessionKey = encryptMessage(sessionKey, recipientPublicKey);
    return {
      encryptedMessage,
      encryptedSessionKey
    };
  } catch (error) {
    console.error('Recipient encryption error:', error);
    throw new Error('Failed to encrypt message for recipient');
  }
};

// Decrypt a message using the recipient's private key
export const decryptFromSender = (encryptedData, privateKey) => {
  try {
    const { encryptedMessage, encryptedSessionKey } = encryptedData;
    const sessionKey = decryptMessage(encryptedSessionKey, privateKey);
    return decryptMessage(encryptedMessage, sessionKey);
  } catch (error) {
    console.error('Sender decryption error:', error);
    throw new Error('Failed to decrypt message from sender');
  }
};

// Hash a message for verification
export const hashMessage = (message) => {
  return CryptoJS.SHA256(message).toString();
};

// Verify message integrity
export const verifyMessage = (message, hash) => {
  const calculatedHash = hashMessage(message);
  return calculatedHash === hash;
};

// Encrypt file data
export const encryptFile = (file, key) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const derivedKey = deriveKey(key, salt);
        const iv = CryptoJS.lib.WordArray.random(128 / 8);

        const encrypted = CryptoJS.AES.encrypt(e.target.result, derivedKey, {
          iv: iv,
          padding: CryptoJS.pad.Pkcs7,
          mode: CryptoJS.mode.CBC
        });

        resolve({
          encrypted: encrypted.toString(),
          salt: salt.toString(),
          iv: iv.toString()
        });
      };
      reader.onerror = (error) => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      reject(new Error('Failed to encrypt file'));
    }
  });
};

// Decrypt file data
export const decryptFile = (encryptedData, key) => {
  try {
    const { encrypted, salt, iv } = encryptedData;
    const derivedKey = deriveKey(key, salt);

    const decrypted = CryptoJS.AES.decrypt(encrypted, derivedKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('File decryption error:', error);
    throw new Error('Failed to decrypt file');
  }
};

export const generateEncryptionKey = () => {
  return generateKey();
};

export const hashPassword = (password) => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });

  return {
    hash: hash.toString(),
    salt: salt.toString()
  };
};

export const verifyPassword = (password, hash, salt) => {
  const derivedHash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });

  return derivedHash.toString() === hash;
}; 