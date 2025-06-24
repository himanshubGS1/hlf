import streamlit as st
import requests

API_URL = "http://localhost:8090/api/vcs"

st.set_page_config(page_title="VC Explorer", layout="wide")
st.title("🪪 Verifiable Credential Explorer")

tabs = st.tabs(["All VCs", "Read VC", "Create VC"])

with tabs[0]:
    st.header("🔍 List All VCs")
    if st.button("Refresh"):
        resp = requests.get(API_URL)
        if resp.ok:
            vcs = [requests.utils.json.loads(v) for v in resp.json()]
            st.json(vcs)
        else:
            st.error(f"{resp.status_code}: {resp.text}")

with tabs[1]:
    st.header("📖 Read a VC")
    vc_id = st.text_input("VC ID", key="read_id")
    if st.button("Fetch VC"):
        if vc_id:
            resp = requests.get(f"{API_URL}/{vc_id}")
            if resp.ok:
                st.json(resp.json())
            else:
                st.error(f"{resp.status_code}: {resp.text}")
        else:
            st.warning("Enter a VC ID")

with tabs[2]:
    st.header("➕ Create New VC")
    vc_id = st.text_input("VC ID")
    vc_json = st.text_area("VC JSON", height=300)
    if st.button("Create VC"):
        if vc_id and vc_json:
            try:
                payload = requests.utils.json.loads(vc_json)
                payload["id"] = vc_id
            except Exception as e:
                st.error(f"Invalid JSON: {e}")
            else:
                resp = requests.post(API_URL, json=payload)
                if resp.ok:
                    st.success(resp.text)
                else:
                    st.error(f"{resp.status_code}: {resp.text}")
        else:
            st.warning("Provide an ID and VC JSON")
