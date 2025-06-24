package main

import (
    "encoding/json"
    "fmt"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing VCs
type SmartContract struct {
    contractapi.Contract
}

// VerifiableCredential models a W3C VC
type VerifiableCredential struct {
    Context           []string           `json:"@context"`
    ID                string             `json:"id"`
    Type              []string           `json:"type"`
    Issuer            string             `json:"issuer"`
    IssuanceDate      string             `json:"issuanceDate"`
    ExpirationDate    string             `json:"expirationDate"`
    CredentialSubject map[string]interface{} `json:"credentialSubject"`
    Proof             map[string]interface{} `json:"proof"`
}

// InitLedger adds a few sample VCs to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    samples := []VerifiableCredential{
        {
            Context:        []string{"https://www.w3.org/2018/credentials/v1", "https://ref.gs1.org/gs1/vc/data-model"},
            ID:             "urn:uuid:vc1",
            Type:           []string{"VerifiableCredential", "SustainabilityCredential"},
            Issuer:         "did:gs1ca:issuer",
            IssuanceDate:   "2024-03-25T00:00:00Z",
            ExpirationDate: "2025-03-25T00:00:00Z",
            CredentialSubject: map[string]interface{}{
                "id":                     "https://example.com/products/00614141000002",
                "gs1:gtin":               "00614141000002",
                "gs1:productDescription": "Organic Cotton T-Shirt",
                "proofId":                "ABC123",
            },
            Proof: map[string]interface{}{
                "type":               "Ed25519Signature2018",
                "created":            "2024-03-25T12:00:00Z",
                "proofPurpose":       "assertionMethod",
                "verificationMethod": "did:example:issuer#key1",
                "jws":                "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il19..TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
            },
        },
        {
            Context:        []string{"https://www.w3.org/2018/credentials/v1", "https://ref.gs1.org/gs1/vc/data-model"},
            ID:             "urn:uuid:vc2",
            Type:           []string{"VerifiableCredential", "SustainabilityCredential"},
            Issuer:         "did:gs1ca:issuer",
            IssuanceDate:   "2024-03-26T00:00:00Z",
            ExpirationDate: "2025-03-26T00:00:00Z",
            CredentialSubject: map[string]interface{}{
                "id":                     "https://example.com/products/00614141000003",
                "gs1:gtin":               "00614141000003",
                "gs1:productDescription": "Recycled Polyester Jacket",
                "proofId":                "DEF456",
            },
            Proof: map[string]interface{}{
                "type":               "Ed25519Signature2018",
                "created":            "2024-03-26T12:00:00Z",
                "proofPurpose":       "assertionMethod",
                "verificationMethod": "did:example:issuer#key1",
                "jws":                "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il19..KJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
            },
        },
        {
            Context:        []string{"https://www.w3.org/2018/credentials/v1", "https://ref.gs1.org/gs1/vc/data-model"},
            ID:             "urn:uuid:vc3",
            Type:           []string{"VerifiableCredential", "SustainabilityCredential"},
            Issuer:         "did:gs1ca:issuer",
            IssuanceDate:   "2024-03-27T00:00:00Z",
            ExpirationDate: "2025-03-27T00:00:00Z",
            CredentialSubject: map[string]interface{}{
                "id":                     "https://example.com/products/00614141000004",
                "gs1:gtin":               "00614141000004",
                "gs1:productDescription": "Fair Trade Coffee Beans",
                "proofId":                "GHI789",
            },
            Proof: map[string]interface{}{
                "type":               "Ed25519Signature2018",
                "created":            "2024-03-27T12:00:00Z",
                "proofPurpose":       "assertionMethod",
                "verificationMethod": "did:example:issuer#key1",
                "jws":                "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il19..LJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
            },
        },
        {
            Context:        []string{"https://www.w3.org/2018/credentials/v1", "https://ref.gs1.org/gs1/vc/data-model"},
            ID:             "urn:uuid:vc4",
            Type:           []string{"VerifiableCredential", "SustainabilityCredential"},
            Issuer:         "did:gs1ca:issuer",
            IssuanceDate:   "2024-03-28T00:00:00Z",
            ExpirationDate: "2025-03-28T00:00:00Z",
            CredentialSubject: map[string]interface{}{
                "id":                     "https://example.com/products/00614141000005",
                "gs1:gtin":               "00614141000005",
                "gs1:productDescription": "Bamboo Toothbrush",
                "proofId":                "JKL012",
            },
            Proof: map[string]interface{}{
                "type":               "Ed25519Signature2018",
                "created":            "2024-03-28T12:00:00Z",
                "proofPurpose":       "assertionMethod",
                "verificationMethod": "did:example:issuer#key1",
                "jws":                "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il19..MJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
            },
        },
        {
            Context:        []string{"https://www.w3.org/2018/credentials/v1", "https://ref.gs1.org/gs1/vc/data-model"},
            ID:             "urn:uuid:vc5",
            Type:           []string{"VerifiableCredential", "SustainabilityCredential"},
            Issuer:         "did:gs1ca:issuer",
            IssuanceDate:   "2024-03-29T00:00:00Z",
            ExpirationDate: "2025-03-29T00:00:00Z",
            CredentialSubject: map[string]interface{}{
                "id":                     "https://example.com/products/00614141000006",
                "gs1:gtin":               "00614141000006",
                "gs1:productDescription": "Recycled Paper Notebook",
                "proofId":                "MNO345",
            },
            Proof: map[string]interface{}{
                "type":               "Ed25519Signature2018",
                "created":            "2024-03-29T12:00:00Z",
                "proofPurpose":       "assertionMethod",
                "verificationMethod": "did:example:issuer#key1",
                "jws":                "eyJhbGciOiJFZERTQSIsImNyaXQiOlsiYjY0Il19..NJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
            },
        },
    }

    for _, vc := range samples {
        vcJSON, err := json.Marshal(vc)
        if err != nil {
            return err
        }
        if err := ctx.GetStub().PutState(vc.ID, vcJSON); err != nil {
            return fmt.Errorf("failed to put %s: %w", vc.ID, err)
        }
    }
    return nil
}

// CreateVC adds a new VC to the ledger
func (s *SmartContract) CreateVC(ctx contractapi.TransactionContextInterface, id string, vcJSON string) error {
    exists, err := s.VCExists(ctx, id)
    if err != nil {
        return err
    }
    if exists {
        return fmt.Errorf("VC %s already exists", id)
    }
    return ctx.GetStub().PutState(id, []byte(vcJSON))
}

// ReadVC returns a VC by ID
func (s *SmartContract) ReadVC(ctx contractapi.TransactionContextInterface, id string) (string, error) {
    data, err := ctx.GetStub().GetState(id)
    if err != nil {
        return "", err
    }
    if data == nil {
        return "", fmt.Errorf("VC %s not found", id)
    }
    return string(data), nil
}

// UpdateVC updates an existing VC
func (s *SmartContract) UpdateVC(ctx contractapi.TransactionContextInterface, id string, vcJSON string) error {
    exists, err := s.VCExists(ctx, id)
    if err != nil {
        return err
    }
    if !exists {
        return fmt.Errorf("VC %s does not exist", id)
    }
    return ctx.GetStub().PutState(id, []byte(vcJSON))
}

// GetAllVCs returns all VCs on the ledger
func (s *SmartContract) GetAllVCs(ctx contractapi.TransactionContextInterface) ([]string, error) {
    iterator, err := ctx.GetStub().GetStateByRange("", "")
    if err != nil {
        return nil, err
    }
    defer iterator.Close()

    var results []string
    for iterator.HasNext() {
        kv, err := iterator.Next()
        if err != nil {
            return nil, err
        }
        results = append(results, string(kv.Value))
    }
    return results, nil
}

// VCExists returns true if a VC with given ID exists
func (s *SmartContract) VCExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
    data, err := ctx.GetStub().GetState(id)
    if err != nil {
        return false, err
    }
    return data != nil, nil
}

func main() {
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
    if err != nil {
        panic(err.Error())
    }
    if err := chaincode.Start(); err != nil {
        panic(err.Error())
    }
}