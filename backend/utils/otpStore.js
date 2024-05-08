// otpStore.js
class OTPStore {
	constructor() {
		this.store = {};
	}

	addOTP(personId, otpData) {
		this.store[personId] = otpData;
	}

	getOTP(personId) {
		return this.store[personId];
	}

	deleteOTP(personId) {
		delete this.store[personId];
	}
}

module.exports = new OTPStore();