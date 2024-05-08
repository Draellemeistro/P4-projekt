import signCrypto from '../../../utils/cryptoDigSig.js';

const main = async () => {
	const message = "Hello, world!";
	// eslint-disable-next-line no-unused-vars
	const keyPair = await signCrypto.genKeys();
	const signature = signCrypto.sign(message);
	const isValid = signCrypto.verify(signCrypto.pubKey, signature, message);
	console.log(isValid ? "Valid signature" : "Invalid signature");
};

main();