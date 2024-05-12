const crypto = require('crypto');
const serverECDH = require('../utils/cryptoFunctions/serverRSA.js');
const fs = require('fs');
const path = require('path');
const serverRSA = require('../utils/cryptoFunctions/serverRSA');

const mockClientPublicKey = "{\"key_ops\":[\"encrypt\"],\"ext\":true,\"kty\":\"RSA\",\"n\":\"jWaRGAwMNj93i5g7Z0P0Dcug_IxMrC738440je_YU5McrqEsPGQcXW2iypzbTFWlsQBKbxOAoaLV4jUlj1vcLrZ_y9UFBDGpdc9-pDi9u6e415glKeMVIlkxgOtI6RSbwTs7Ce5Xc6MhK0MFlC3eGKV3u0oYQIbepBW-BOiQVVdN71qF30bnDe9F3xpu9MorXYOkLIJ0QuTBaRtIyoWOttfH2DfTQ3q5ivP4cdcDe-lFCQMJydKE3NvaJkRA63Djo-8a_xotbfiA999OG9RUQxkDKzMOfIErih8Br91D7WoXPat6fhVqI7NICOxwwbu3OoDWiHqaYoItBmrclGp2hsuYk7L1x11X2HlTic4RwyXyYfV1Wpj7yUwCO79UDuJ-YzIthPaYvg89kJlrbPmeNQrkoaF-2nd8m1J_kmBmOVdeVChbIz0cQPAk7jpRZM6Es0-ThcXlbVQUhT3TmdesKIhyGXFjYRUlKvjDxUONJt0GRx0qRmKovtZmPGQIYfDHGsavZKs8Ffk0DwFWok4_d8LcQe1zMY7k36JulMCwKcqtz1VuXjUigvlSqiYvY84AzOqVi5vB7LVLgvWpyolQ10YEU9GgITVobSxeLT8maXMbfb20B_n1A_dBFLlKEsfTaJCvFWExXNE6rQUcs7nX126EWExTPEswtGSs7XwgMVc\",\"e\":\"AQAB\",\"alg\":\"RSA-OAEP-256\"}";
jest.mock('fs', () => ({
	readFileSync: jest.fn(),
}));

describe('serverRSA', () => {
	beforeEach(async () => {
		// Clear all instances and calls to constructor and all methods:
		await serverRSA.genKeys();
	});
	test('genKeys function', async () => {
		expect(serverRSA.pubKey).not.toBeNull();
		expect(serverRSA.privKey).not.toBeNull();
		expect(serverRSA.pubKey).toBeInstanceOf(CryptoKey);
		expect(serverRSA.privKey).toBeInstanceOf(CryptoKey);
	});

	test('encryption to decryption', async () => {
		const plaintext = 'Hello, World!';
		const encrypted = await serverRSA.encryptRSA(plaintext);



		const decrypted = await serverRSA.decryptRSA(encrypted);

		const encrBase64 = serverRSA.ArrBuffToBase64(encrypted);
		const decryptedTwo = await serverRSA.decryptRSA(encrBase64);


		expect(encrypted).not.toBeNull();
		expect(encrypted).toBeInstanceOf(ArrayBuffer);
		expect(decrypted).toBe(plaintext);
		expect(decryptedTwo).toBe(plaintext);
	});





});