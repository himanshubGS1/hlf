import streamlit as st
import requests

API_URL = "http://localhost:8090/api/assets"

st.set_page_config(page_title="Fabric Asset Manager", layout="wide")
st.title("🗄️ Fabric Asset Explorer")

tabs = st.tabs(["All Assets", "Read Asset", "Create Asset"])

with tabs[0]:
    st.header("🔍 List All Assets")
    if st.button("Refresh"):
        resp = requests.get(API_URL)
        if resp.ok:
            st.dataframe(resp.json())
        else:
            st.error(f"{resp.status_code}: {resp.text}")

with tabs[1]:
    st.header("📖 Read an Asset")
    asset_id = st.text_input("Asset ID", key="read_id")
    if st.button("Fetch Asset"):
        if asset_id:
            resp = requests.get(f"{API_URL}/{asset_id}")
            if resp.ok:
                st.json(resp.json())
            else:
                st.error(f"{resp.status_code}: {resp.text}")
        else:
            st.warning("Enter an Asset ID")

with tabs[2]:
    st.header("➕ Create New Asset")
    cols = st.columns(2)
    with cols[0]:
        aid = st.text_input("Asset ID")
        color = st.text_input("Color")
        size = st.text_input("Size")
    with cols[1]:
        owner = st.text_input("Owner")
        value = st.number_input("Appraised Value", min_value=0, step=1)
    if st.button("Create Asset"):
        payload = {
            "assetID": aid,
            "color": color,
            "size": size,
            "owner": owner,
            "appraisedValue": value
        }
        resp = requests.post(API_URL, json=payload)
        if resp.ok:
            st.success(resp.text)
        else:
            st.error(f"{resp.status_code}: {resp.text}")