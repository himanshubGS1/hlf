'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets }      = require('fabric-network');
const fs               = require('fs');
const path             = require('path');

async function main() {
  // Read username and secret from command line
  const [, , userId, secret] = process.argv;
  if (!userId || !secret) {
    console.error('Usage: node registerUser.js <userId> <secret>');
    process.exit(1);
  }

  const walletPath = path.join(__dirname, 'wallet');
  const ccpPath    = path.resolve(__dirname, 'connection-org1.json');
  const ccp        = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  // Set up CA client
  const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
  const ca     = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caInfo.tlsCACerts.pem, verify: false },
    caInfo.caName
  );

  // Set up wallet
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const adminIdentity = await wallet.get('admin');
  if (!adminIdentity) {
    console.error('❌ Admin identity not found; run `npm run enrollAdmin` first');
    process.exit(1);
  }

  // Skip if this user already exists
  if (await wallet.get(userId)) {
    console.log(`⚠️  Identity for "${userId}" already exists in the wallet`);
    return;
  }

  // Build an admin user context for registration
  const provider  = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, 'admin');

  // Register the new user
  await ca.register({
    affiliation:    'org1.department1',
    enrollmentID:   userId,
    role:           'client',
    enrollmentSecret: secret
  }, adminUser);
  console.log(`→ Registered "${userId}" with secret "${secret}"`);

  // Enroll and import into the wallet
  const enrollment = await ca.enroll({
    enrollmentID: userId,
    enrollmentSecret: secret
  });
  const userIdentity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey:  enrollment.key.toBytes()
    },
    mspId: 'Org1MSP',
    type:  'X.509'
  };
  await wallet.put(userId, userIdentity);
  console.log(`✔ "${userId}" enrolled and imported into the wallet`);
}

main().catch(err => {
  console.error('❌ Failed to register user:', err);
  process.exit(1);
});