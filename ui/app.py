import streamlit as st
import requests
import json

API_BASE_URL = "http://localhost:8090/api/vcs"

st.set_page_config(page_title="Fabric VC Explorer", layout="wide")
st.title("🪪 Verifiable Credential Explorer")

tabs = st.tabs([
    "🏠 Home",
    "🔍 All VCs",
    "📖 Read VC",
    "✅ VC Exists",
    "✏️ Update VC",
    "➕ Create VC"
])

# ─── Helper to wrap card HTML ─────────────────────────────────
def render_card_html(content_html: str):
    st.markdown(
        f"""
        <div style="
            background-color: #413d3c;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        ">
            {content_html}
        </div>
        """,
        unsafe_allow_html=True,
    )

# ─── TAB 0: HOME ─────────────────────────────────────────────
with tabs[0]:
    st.header("🏠 Welcome to the Fabric VC Explorer")
    st.markdown("""
    This Streamlit app allows you to interact with a Hyperledger Fabric smart contract
    that manages W3C Verifiable Credentials (VCs).  
    You can:
    - **Browse** all stored credentials  
    - **Lookup** a specific credential by its ID  
    - **Check** whether a credential exists  
    - **Create** new credentials  
    - **Update** existing credentials  

    Use the tabs above to navigate through the app's functionality.
    """)

# ─── TAB 1: ALL VCS ───────────────────────────────────────────
with tabs[1]:
    st.header("🔍 All Verifiable Credentials")
    if st.button("🔄 Refresh VCs"):
        try:
            resp = requests.get(API_BASE_URL)
            resp.raise_for_status()
            vcs = resp.json()

            if not isinstance(vcs, list) or len(vcs) == 0:
                st.warning("No verifiable credentials found.")
            else:
                st.success(f"✅ Found {len(vcs)} VC(s)")

                for i in range(0, len(vcs), 3):
                    cols = st.columns(3)
                    for idx, col in enumerate(cols):
                        if i + idx >= len(vcs):
                            break
                        raw = vcs[i + idx]
                        vc = json.loads(raw) if isinstance(raw, str) else raw

                        vc_id = vc.get("vcID") or vc.get("id", "Unknown ID")
                        typ   = vc.get("type", [])
                        if isinstance(typ, list):
                            typ = ", ".join(typ)
                        subj  = vc.get("credentialSubject", {})
                        desc  = subj.get("gs1:productDescription", "")
                        gtin  = subj.get("gs1:gtin", "")

                        content  = f"<h4>🪪 {vc_id}</h4>"
                        if desc:
                            content += f"<p><strong>Product:</strong> {desc}</p>"
                        if gtin:
                            content += f"<p><strong>GTIN:</strong> {gtin}</p>"
                        if typ:
                            content += f"<p><strong>Type:</strong> {typ}</p>"

                        with col:
                            render_card_html(content)
                            with st.expander("🔎 More Details"):
                                if vc.get("issuer"):
                                    st.write(f"**Issuer:** {vc['issuer']}")
                                if vc.get("issuanceDate"):
                                    st.write(f"**Issued On:** {vc['issuanceDate']}")
                                if vc.get("expirationDate"):
                                    st.write(f"**Expires:** {vc['expirationDate']}")
                                if vc.get("@context"):
                                    st.write(f"**Context:** {vc['@context']}")
                                if vc.get("proof"):
                                    st.write("**Proof:**")
                                    st.json(vc["proof"])
                                with st.expander("🧾 Raw JSON"):
                                    st.json(vc)
        except Exception as e:
            st.error(f"❌ Error fetching VCs: {e}")

# ─── TAB 2: READ VC BY ID ──────────────────────────────────────
with tabs[2]:
    st.header("📖 Read a VC by ID")
    read_id = st.text_input("Enter VC ID", key="read_id")
    if st.button("📘 Fetch VC"):
        if not read_id:
            st.warning("Please enter a VC ID.")
        else:
            try:
                resp = requests.get(f"{API_BASE_URL}/{read_id}")
                resp.raise_for_status()
                vc = resp.json()

                vid  = vc.get("vcID") or vc.get("id", read_id)
                typ  = vc.get("type", [])
                if isinstance(typ, list):
                    typ = ", ".join(typ)
                subj = vc.get("credentialSubject", {})
                desc = subj.get("gs1:productDescription", "")
                gtin = subj.get("gs1:gtin", "")

                content  = f"<h3>🪪 {vid}</h3>"
                if desc:
                    content += f"<p><strong>Product:</strong> {desc}</p>"
                if gtin:
                    content += f"<p><strong>GTIN:</strong> {gtin}</p>"
                if typ:
                    content += f"<p><strong>Type:</strong> {typ}</p>"

                render_card_html(content)
                with st.expander("🔎 More Details", expanded=True):
                    if vc.get("issuer"):
                        st.write(f"**Issuer:** {vc['issuer']}")
                    if vc.get("issuanceDate"):
                        st.write(f"**Issued On:** {vc['issuanceDate']}")
                    if vc.get("expirationDate"):
                        st.write(f"**Expires:** {vc['expirationDate']}")
                    if vc.get("@context"):
                        st.write(f"**Context:** {vc['@context']}")
                    if vc.get("proof"):
                        st.write("**Proof:**")
                        st.json(vc["proof"])
                    with st.expander("🧾 Raw JSON"):
                        st.json(vc)
            except requests.exceptions.HTTPError as err:
                st.error(f"❌ VC not found: {err}")
            except Exception as e:
                st.error(f"❌ Unexpected error: {e}")

# ─── TAB 3: VC EXISTS ──────────────────────────────────────────
with tabs[3]:
    st.header("✅ Check VC Existence")
    exist_id = st.text_input("Enter VC ID to check", key="exist_id")
    if st.button("🔍 Check Exists"):
        if not exist_id:
            st.warning("Please enter a VC ID.")
        else:
            try:
                resp = requests.get(f"{API_BASE_URL}/{exist_id}/exists")
                resp.raise_for_status()
                exists = resp.json().get("exists", False)
                if exists:
                    st.success(f"✅ VC `{exist_id}` exists")
                else:
                    st.error(f"❌ VC `{exist_id}` does not exist")
            except Exception as e:
                st.error(f"❌ Error checking existence: {e}")

# ─── TAB 4: UPDATE VC ─────────────────────────────────────────
with tabs[4]:
    st.header("✏️ Update an Existing VC")
    up_id = st.text_input("VC ID to update", key="update_id")
    up_json = st.text_area(
        "Full VC JSON to write (must include all fields)",
        height=200,
        key="update_json"
    )
    if st.button("🚧 Update VC"):
        if not up_id or not up_json.strip():
            st.warning("Please enter the VC ID and the JSON body.")
        else:
            try:
                payload = json.loads(up_json)
            except json.JSONDecodeError as e:
                st.error(f"❌ Invalid JSON: {e}")
            else:
                try:
                    resp = requests.put(f"{API_BASE_URL}/{up_id}", json=payload)
                    resp.raise_for_status()
                    st.success(f"✅ VC `{up_id}` updated successfully")
                except Exception as e:
                    st.error(f"❌ Error updating VC: {e}")

# ─── TAB 5: CREATE VC ──────────────────────────────────────────
with tabs[5]:
    st.header("➕ Create New Verifiable Credential")
    col1, col2 = st.columns(2)
    with col1:
        context_text = st.text_area(
            "Context (@context array)",
            value='["https://www.w3.org/2018/credentials/v1", "https://ref.gs1.org/gs1/vc/data-model"]',
            height=80
        )
        id_text    = st.text_input("ID", value="urn:uuid:vcNew")
        type_text  = st.text_area(
            "Type (array)",
            value='["VerifiableCredential","SustainabilityCredential"]',
            height=80
        )
        issuer_text   = st.text_input("Issuer", value="did:example:issuer")
        issuance_text = st.text_input("IssuanceDate (ISO8601)", value="2025-06-24T00:00:00Z")
    with col2:
        expiration_text = st.text_input("ExpirationDate (ISO8601)", value="2026-06-24T00:00:00Z")
        subj_text       = st.text_area(
            "CredentialSubject (JSON)",
            value=json.dumps({
                "id": "https://example.com/products/00000000000000",
                "gs1:gtin": "00000000000000",
                "gs1:productDescription": "Sample Product",
                "proofId": "ABC123"
            }, indent=2),
            height=180
        )
        proof_text      = st.text_area(
            "Proof (JSON)",
            value=json.dumps({
                "type": "Ed25519Signature2018",
                "created": "2025-06-24T12:00:00Z",
                "proofPurpose": "assertionMethod",
                "verificationMethod": "did:example:issuer#key1",
                "jws": "example-signature"
            }, indent=2),
            height=180
        )
    if st.button("🚀 Submit VC"):
        try:
            payload = {
                "@context":          json.loads(context_text),
                "id":                id_text,
                "type":              json.loads(type_text),
                "issuer":            issuer_text,
                "issuanceDate":      issuance_text,
                "expirationDate":    expiration_text,
                "credentialSubject": json.loads(subj_text),
                "proof":             json.loads(proof_text)
            }
        except Exception as e:
            st.error(f"❌ Invalid JSON in form: {e}")
        else:
            try:
                post = requests.post(API_BASE_URL, json=payload)
                post.raise_for_status()
                st.success("✅ VC created successfully")
            except Exception as e:
                st.error(f"❌ Error creating VC: {e}")