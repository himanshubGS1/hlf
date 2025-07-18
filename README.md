# Hyperledger Fabric VC Network

This repository contains a custom Fabric test network with descriptive node names and a simple UI built with Hyperledger Explorer and Streamlit.

## Starting the network

1. Clone this repository and change into the project directory.
2. Install the Fabric binaries if you have not done so. From the `fabric-samples` directory run `./scripts/bootstrap.sh` (see the Fabric documentation for details).
3. Bring up the network and create a channel:

```bash
cd fabric-samples/test-network
./network.sh up createChannel -ca
```

This starts three orderers (`gs1Global`, `gs1Canada`, `gs1US`) and two peers (`gs1Mexico` for Org1 and `gs1UK` for Org2).

## Deploying the VC chaincode

The chaincode source is in `fabric-samples/vc-chaincode/chaincode-go`.
Deploy it to the network:

```bash
./network.sh deployCC -ccn vcchaincode -ccp ../vc-chaincode/chaincode-go -ccl go
```

After the deployment completes you can run a query to list all Verifiable Credentials stored on the ledger:

```bash
docker exec cli peer chaincode query -C mychannel -n vcchaincode -c '{"Args":["GetAllVCs"]}'
```

## Running Hyperledger Explorer

Explorer is configured under the `explorer` folder. Run it after the network is up:

```bash
cd ../../explorer
export EXPLORER_CONFIG_FILE_PATH=$(pwd)/config.json
export EXPLORER_PROFILE_DIR_PATH=$(pwd)/connection-profile
export FABRIC_CRYPTO_PATH=$(pwd)/../fabric-samples/test-network/organizations
docker compose up -d
```

Visit [http://localhost:8080](http://localhost:8080) to view the network.

## UI API server and Streamlit app

The `ui` directory contains helper scripts and a simple application. Install the dependencies, enroll the admin identity and register a user, then start the API server:

```bash
cd ../ui
npm install
node enrollAdmin.js
node registerUser.js
node apiserver.js      # listens on http://localhost:8090
```

The API server looks for the connection profile generated by
`network.sh` at `fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json`.
If that file is not present it falls back to the copy bundled in
`ui/connection-org1.json`. This connection profile includes the `gs1Mexico` and
`gs1UK` peer hostnames as well as the three orderers.

In another terminal run:

```bash
streamlit run app.py
```

The UI requires Python packages including `streamlit` and `requests`. You can install them using:

```bash
pip install streamlit requests
```

The web UI will connect to the API server and interact with the deployed chaincode.
