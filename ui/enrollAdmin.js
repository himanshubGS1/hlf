// enrollAdmin.js
'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const walletPath = path.join(__dirname, 'wallet');
if (fs.existsSync(walletPath)) {
  fs.rmSync(walletPath, { recursive: true, force: true });
  console.log('Removed existing wallet');
}

async function enrollAdmin() {
  console.log('→ Enrolling admin');
  const ccp = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'connection-org1.json'), 'utf8'));
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caInfo.tlsCACerts.pem, verify: false }, caInfo.caName);
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  if (await wallet.get('admin')) {
    console.log('Admin already enrolled');
    return;
  }
  const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
  const identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes()
    },
    mspId: 'Org1MSP',
    type: 'X.509'
  };
  await wallet.put('admin', identity);
  console.log('Admin enrolled successfully');
}

enrollAdmin()
  .catch(err => { console.error('Enrollment failed:', err); process.exit(1); });