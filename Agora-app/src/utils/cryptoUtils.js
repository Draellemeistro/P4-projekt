import RSACrypto from './encryptionRSA.js';
import ECDHCrypto from './encryptionECDH.js';
import { SendEncryptedMsgTest } from '../routes/cryptoTests/testingECDH/pageECDH.js';
import { ECDHtoRSATest, RSAtoECDHTest } from './apiServiceDev.js';
import combo from './comboEncrypt.js';
const cryptoUtils = {
	RSA: RSACrypto,
	ECDH: ECDHCrypto, // EXAMPLE cryptoUtils.ECDH.initECDH()
	combo: combo
}