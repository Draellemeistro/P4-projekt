

// keyStore.js

class keyStore {
	constructor() {
		this.store = {};
	}

	addKeyRing(personId, keyRingObject) {
		this.store[personId] = keyRingObject;
	}

	getKeyRing(personId) {
		return this.store[personId];
	}

	getDigSigKey(personId)  {
		return this.store[personId].digSigKey;
	}

	getECDHKey(personId) {
		return this.store[personId].ecdhKey;
	}

	deleteECDHKey(personId) {
		delete this.store[personId].ecdhKey;
	}

	deleteDigSigKey(personId) {
		delete this.store[personId].digSigKey;
	}

	deleteKeyRing(personId) {
		delete this.store[personId];
	}
}

module.exports = new keyStore();
// TODO MAKE SURE THIS IS NOT RETARD