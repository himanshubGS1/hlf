// apiserver.js
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const walletPath = path.join(__dirname, 'wallet');
const ccpPath = path.resolve(__dirname, '..', 'fabric-samples', 'test-network',
  'organizations', 'peerOrganizations', 'org1.example.com',
  'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => { console.log(`${new Date().toISOString()} ${req.method} ${req.url}`); next(); });

async function getContract() {
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
  const network = await gateway.getNetwork('mychannel');
  return network.getContract('vcchaincode');
}

app.get('/api/vcs', async (req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction('GetAllVCs');
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.get('/api/vcs/:id', async (req, res) => {
  try {
    const contract = await getContract();
    const result = await contract.evaluateTransaction('ReadVC', req.params.id);
    res.json(JSON.parse(result.toString()));
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.post('/api/vcs', async (req, res) => {
  try {
    const payload = req.body;
    const contract = await getContract();
    await contract.submitTransaction('CreateVC', payload.id, JSON.stringify(payload));
    res.send(`VC ${payload.id} created`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

app.put('/api/vcs/:id', async (req, res) => {
  try {
    const payload = req.body;
    const contract = await getContract();
    await contract.submitTransaction('UpdateVC', req.params.id, JSON.stringify(payload));
    res.send(`VC ${req.params.id} updated`);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.toString());
  }
});

const PORT = 8090;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));