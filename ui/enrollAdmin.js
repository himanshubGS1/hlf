'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Wallets }       = require('fabric-network');
const fs                = require('fs');
const path              = require('path');

async function main() {
  const walletPath = path.join(__dirname, 'wallet');
  if (fs.existsSync(walletPath)) {
    fs.rmSync(walletPath, { recursive: true, force: true });
    console.log('✔ Cleared existing wallet');
  }
  const ccpPath = path.resolve(__dirname, 'connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const ca = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
    caInfo.caName
  );

  const wallet = await Wallets.newFileSystemWallet(walletPath);
  if (await wallet.get('admin')) {
    console.log('⚠️  Admin already enrolled');
    return;
  }

  console.log('→ Enrolling admin user "admin"');
  const enrollment = await ca.enroll({
    enrollmentID: 'admin',
    enrollmentSecret: 'adminpw'
  });

  const identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes()
    },
    mspId: 'Org1MSP',
    type: 'X.509'
  };

  await wallet.put('admin', identity);
  console.log('✔ Admin enrolled and imported into wallet');
}

main().catch(err => {
  console.error('❌ Failed to enroll admin:', err);
  process.exit(1);
});