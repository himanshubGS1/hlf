'use strict';
const express             = require('express');
const bodyParser          = require('body-parser');
const { Gateway, Wallets }= require('fabric-network');
const fs                  = require('fs');
const path                = require('path');

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.url}`);
  next();
});

// pick up the user ID from the env, default to appUser if unspecified
const USER_ID = process.env.USER_ID || 'appUser';

const walletPath = path.join(__dirname, 'wallet');
const ccp        = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'connection-org1.json'), 'utf8')
);

// ensure admin and app user are in the wallet before we start
async function ensureEnrolled() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  if (!await wallet.get('admin')) {
    console.error('❌ Missing identity "admin" in wallet. Run: npm run enrollAdmin');
    process.exit(1);
  }
  if (!await wallet.get(USER_ID)) {
    console.error(`❌ Missing identity "${USER_ID}" in wallet. Run: node registerUser.js ${USER_ID} <secret>`);
    process.exit(1);
  }
  console.log(`✔ Using identity "${USER_ID}"`);
}

// helper to get the contract object
async function getContract() {
  const wallet  = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: USER_ID,
    discovery: { enabled: true, asLocalhost: true }
  });
  const network = await gateway.getNetwork('mychannel');
  return network.getContract('vcchaincode');
}

async function startServer() {
  // ─── Get All VCs ───────────────────────────────────────────
  app.get('/api/vcs', async (req, res) => {
    try {
      const contract = await getContract();
      const result   = await contract.evaluateTransaction('GetAllVCs');
      res.json(JSON.parse(result.toString()));
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // ─── Read a Single VC ──────────────────────────────────────
  app.get('/api/vcs/:id', async (req, res) => {
    try {
      const contract = await getContract();
      const result   = await contract.evaluateTransaction('ReadVC', req.params.id);
      res.json(JSON.parse(result.toString()));
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // ─── Check if VC Exists ─────────────────────────────────────
  app.get('/api/vcs/:id/exists', async (req, res) => {
    try {
      const contract = await getContract();
      const result   = await contract.evaluateTransaction('VCExists', req.params.id);
      // result is "true" or "false"
      res.json({ exists: JSON.parse(result.toString()) });
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // ─── Create a New VC ────────────────────────────────────────
  app.post('/api/vcs', async (req, res) => {
    try {
      const payload  = req.body;
      const contract = await getContract();
      // id must match your JSON body's id field
      await contract.submitTransaction('CreateVC', payload.id, JSON.stringify(payload));
      res.send(`✔ VC ${payload.id} created`);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  // ─── Update an Existing VC ──────────────────────────────────
  app.put('/api/vcs/:id', async (req, res) => {
    try {
      const payload  = req.body;
      const contract = await getContract();
      await contract.submitTransaction('UpdateVC', req.params.id, JSON.stringify(payload));
      res.send(`✔ VC ${req.params.id} updated`);
    } catch (err) {
      console.error(err);
      res.status(500).send(err.toString());
    }
  });

  const PORT = 8090;
  app.listen(PORT, () => console.log(`🚀 API Server listening at http://localhost:${PORT}`));
}

(async () => {
  await ensureEnrolled();
  await startServer();
})();