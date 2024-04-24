
const path = require('path');
const crypto = require("crypto");
const { createECDH } = require('crypto');
const fs = require('fs');

const serverPublicKeyECDH = fs.readFileSync(__dirname + '/../serverPublicKeyECDH.pem', 'utf8');
const serverPrivateKeyECDH = fs.readFileSync(__dirname + '/../serverPrivateKeyECDH.pem', 'utf8');
const serverPublicRSAKey = fs.readFileSync(__dirname + '/../serverPublicKeyRSA.pem', 'utf8');
const serverPrivateRSAKey = fs.readFileSync(__dirname + '/../serverPrivateKeyRSA.pem', 'utf8');
const serverECDH = createECDH('secp521r1');

console.log(serverPrivateKeyECDH);
console.log('test1');
serverECDH.setPrivateKey(serverPrivateKeyECDH, 'base64');
console.log(serverECDH.getPrivateKey().toString('base64'));