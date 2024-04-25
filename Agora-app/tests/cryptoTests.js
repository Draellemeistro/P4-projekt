const crypto = require('crypto');
const client = crypto.createECDH('secp521r1');
const clientKeys = client.generateKeys();
const server = crypto.createECDH('secp521r1');
const serverKeys = server.generateKeys();

import cryptoUtils from '../src/utils/cryptoUtils';
import RSACrypto from '../src/utils/encryptionRSA.js';
const { getPublicKey, computeSharedSecret, requestServerPublicKeyECDH, encryptMessageECDH, performECDHAndEncryptBallot } = require('../src/utils/encryptionECDH');
