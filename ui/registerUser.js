'use strict';
const FabricCAServices = require('fabric-ca-client');
const { Wallets }        = require('fabric-network');
const fs                 = require('fs');
const path               = require('path');

const walletPath = path.join(__dirname, 'wallet');

async function registerUser() {
  console.log('→ Registering appUser');
  const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network',
    'organizations', 'peerOrganizations', 'org1.example.com',
    'connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const ca     = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
    caInfo.caName
  );
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  // enrollAdmin.js must have run first, so admin is already in wallet
  const adminIdentity = await wallet.get('admin');
  if (!adminIdentity) {
    console.error('Admin identity not found in wallet; run enrollAdmin.js first');
    process.exit(1);
  }

  // skip if appUser already in wallet
  if (await wallet.get('appUser')) {
    console.log('appUser already enrolled in wallet');
    return;
  }

  // build user context from admin identity
  const provider  = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, 'admin');

  // attempt registration with fixed secret
  const FIXED_SECRET = 'appUserpw';
  let secret;
  try {
    secret = await ca.register(
      {
        affiliation:    'org1.department1',
        enrollmentID:   'appUser',
        role:           'client',
        enrollmentSecret: FIXED_SECRET
      },
      adminUser
    );
    console.log(`appUser registered with secret: ${secret}`);
  } catch (err) {
    if (err.errors && err.errors[0].code === 74) {
      console.log('appUser already registered in CA; using known secret');
      secret = FIXED_SECRET;
    } else {
      console.error('Registration failed:', err);
      process.exit(1);
    }
  }

  // enroll & import into wallet
  try {
    const enrollment = await ca.enroll({ enrollmentID: 'appUser', enrollmentSecret: secret });
    const userIdentity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey:  enrollment.key.toBytes()
      },
      mspId: 'Org1MSP',
      type:  'X.509'
    };
    await wallet.put('appUser', userIdentity);
    console.log('appUser enrolled and imported into wallet');
  } catch (err) {
    console.error('Enrollment failed:', err);
    process.exit(1);
  }
}

registerUser().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});