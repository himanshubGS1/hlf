# Fabric VC Explorer Demo

This repository demonstrates two Verifiable Credential (VC) scenarios managed on a Hyperledger Fabric network and exposed via a Streamlit app. You can browse, lookup, create, update, and check existence of VCs.

---

## Scenario 1: Organic Apples Traceability

**Description:**  
A British Columbia orchard (“Green Valley Orchards”) requests GS1 Canada to issue a VC to trace a batch of organic apples through the supply chain. Two third-party certifications are attached with the request certified by CanadaGAP and Organic Produce.

**VC JSON:**
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://ref.gs1.org/gs1/vc/data-model"
  ],
  "id": "urn:uuid:apples-bc-001",
  "type": [
    "VerifiableCredential",
    "GroceryTraceCredential"
  ],
  "issuer": "did:gs1ca:packerBC",
  "issuanceDate": "2025-06-26T08:00:00Z",
  "expirationDate": "2026-06-24T00:00:00Z",
  "credentialSubject": {
    "gs1:gtin": "00012345000012",
    "gs1:productDescription": "Organic Apples",
    "batchNumber": "AP-BATCH-20250626",
    "manufacturer": "Green Valley Orchards",
    "productionDate": "2025-06-25"
  },
  "proof": {
    "type": "Ed25519Signature2018",
    "created": "2025-06-26T08:01:00Z",
    "verificationMethod": "did:gs1ca:packerBC#key1",
    "jws": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJndGluIjoiMDAwMTIzNDUwMDAwMTIiLCJiYXRjaE51bWJlciI6IkFQLUJBVENoLTIwMjUwNjI2IiwiZmFjdHVyZXIiOiJHcmVlbiBWYWx1ZXkgT3JjaGFyZHMiLCJwcm9kdWN0aW9uRGF0ZSI6IjIwMjUtMDYtMjUifQ.p2VZLF2K3-liwuPM2mVP.aVXzKSvLDuJpRBMzMvQvQDGcdTXrWYA1DDgUGC6vsAw"
  }
}
```

## Scenario 2: Eco Wear Recycled Shirt

**Description:**  
“EcoWear Mexico” requests GS1 Mexico to issue a VC certifying that a garment is produced from recycled materials and meets Carbon Trust and Global Recycled Standard (GRS) requirements.

**VC JSON:**
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://ref.gs1.org/gs1/vc/data-model"
  ],
  "id": "urn:uuid:shirt-mx-001",
  "type": [
    "VerifiableCredential",
    "SustainabilityCredential"
  ],
  "issuer": "did:gs1mx:ecowear",
  "issuanceDate": "2025-07-01T10:00:00Z",
  "expirationDate": "2026-07-01T10:00:00Z",
  "credentialSubject": {
    "gs1:gtin": "00098765000034",
    "gs1:productDescription": "Recycled Polyester Shirt",
    "batchNumber": "SHIRT-BATCH-20250701",
    "manufacturer": "EcoWear Mexico",
    "productionDate": "2025-06-28"
  },
  "proof": {
    "type": "Ed25519Signature2018",
    "created": "2025-07-01T10:05:00Z",
    "verificationMethod": "did:gs1mx:ecowear#key1",
    "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpnczFteDplY293ZWFyI2tleTEifQ.eyJndGluIjoiMDAwOTg3NjUwMDAwMzQiLCJwcm9kdWN0RGVzY3JpcHRpb24iOiJSZWN5Y2xlZCBQb2x5ZXN0ZXIgU2hpcnQiLCJiYXRjaE51bWJlciI6IlNISVJULUJBVENILTIwMjUwNzAxIiwiZmFjdHVyZXIiOiJFY29XZWFyIE1leGljbyIsInByb2R1Y3Rpb25EYXRlIjoiMjAyNS0wNi0yOCJ9.c3Ve4Ybf9XQ1kR2j0nU5Ml.kTXNxM9XG-n2C4o94xI0GJpztS3s7D_vxnX_b5rKJ0I"
  }
}
```