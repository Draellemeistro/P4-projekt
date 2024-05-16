

// keyStore.js

class keyStore {
	constructor() {
		this.store = {};
	}

	addKeys(personId, ecdhKey,digSigKey ) {
		this.store[personId] = { ecdh:ecdhKey, digSig: digSigKey };
	}

	getDigSigKey(personId)  {
		return this.store[personId].digSig;
	}

	getECDHKey(personId) {
		return this.store[personId].ecdh;
	}

	deleteECDHKey(personId) {
		delete this.store[personId].ecdh;
	}

	deleteDigSigKey(personId) {
		delete this.store[personId].digSig;
	}

	deleteKeys(personId) {
		delete this.store[personId];
	}
}

module.exports = new keyStore();
// TODO MAKE SURE THIS IS NOT RETARD