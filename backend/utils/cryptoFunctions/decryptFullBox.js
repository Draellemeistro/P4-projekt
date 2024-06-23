const serverRSA = require('./serverRSA');
const db = require('../db.js');


async function decryptFullBox() {
    let ballotArray = [];
    try {
        const ballots = await db.getAllBallots('encr_ballot');
        ballots.forEach(ballot => {
            let decryptedBallot = serverRSA.decryptMessage(ballot);
            ballotArray.push(decryptedBallot.toString());
        });
        return ballotArray;
    } catch (error) {
        console.error(error);
    }
}
module.exports = { decryptFullBox };