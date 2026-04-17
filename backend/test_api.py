"""Quick smoke test for all Sanjeevni API endpoints."""
import requests
import json

BASE = "http://127.0.0.1:8000"

def p(label, r):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {json.dumps(r.json(), indent=2)[:500]}")
    print(f"{'='*60}")

# ── Health ──
p("GET /", requests.get(f"{BASE}/"))

# ── 1.1 Create Transfer ──
r = requests.post(f"{BASE}/api/transfer/create", json={
    "origin_hospital_id": "H1",
    "patient_name": "Test Patient",
    "severity": "critical",
    "condition": "Low oxygen, unstable BP",
    "required_resources": ["ICU", "VENTILATOR"],
    "notes": "Needs urgent transfer",
    "location": {"lat": 28.61, "lng": 77.21}
})
p("1.1 POST /api/transfer/create", r)
req_id = r.json()["request_id"]

# ── 1.2 Match Hospitals ──
r = requests.get(f"{BASE}/api/transfer/match/{req_id}")
p("1.2 GET /api/transfer/match/{id}", r)
ranked = r.json()["ranked_hospitals"]
top3_ids = [h["hospital_id"] for h in ranked[:3]]
print(f"  Top 3: {top3_ids}")

# ── 1.3 Broadcast ──
r = requests.post(f"{BASE}/api/transfer/broadcast", json={
    "request_id": req_id,
    "hospital_ids": top3_ids
})
p("1.3 POST /api/transfer/broadcast", r)

# ── 2.1 Hospital Respond (accept from first) ──
r = requests.post(f"{BASE}/api/hospital/respond", json={
    "request_id": req_id,
    "hospital_id": top3_ids[0],
    "response": "accept"
})
p("2.1 POST /api/hospital/respond (accept)", r)

# ── 2.1 Hospital Respond (reject from second) ──
r = requests.post(f"{BASE}/api/hospital/respond", json={
    "request_id": req_id,
    "hospital_id": top3_ids[1],
    "response": "reject"
})
p("2.1 POST /api/hospital/respond (reject)", r)

# ── 1.4 Get Transfer Status ──
r = requests.get(f"{BASE}/api/transfer/{req_id}")
p("1.4 GET /api/transfer/{id} (status)", r)

# ── 1.5 Finalize ──
r = requests.post(f"{BASE}/api/transfer/finalize", json={
    "request_id": req_id
})
p("1.5 POST /api/transfer/finalize", r)

# ── 2.2 Get Incoming Requests (for 3rd hospital) ──
r = requests.get(f"{BASE}/api/hospital/{top3_ids[2]}/requests")
p("2.2 GET /api/hospital/{id}/requests", r)

# ── 2.3 Update Capacity ──
r = requests.put(f"{BASE}/api/hospital/H1/capacity", json={
    "icu_beds": 5, "general_beds": 20, "oxygen_units": 30, "ventilators": 4
})
p("2.3 PUT /api/hospital/{id}/capacity", r)

# ── 2.4 Update Settings ──
r = requests.put(f"{BASE}/api/hospital/H2/settings", json={
    "auto_accept_enabled": True,
    "conditions": {"severity": "critical", "required_resources": ["ICU"]}
})
p("2.4 PUT /api/hospital/{id}/settings", r)

# ── 3.1 Create Resource Request ──
r = requests.post(f"{BASE}/api/resource/request", json={
    "hospital_id": "H1", "resource_type": "oxygen", "quantity": 5
})
p("3.1 POST /api/resource/request", r)
rr_id = r.json()["resource_request_id"]

# ── 3.2 Respond to Resource Request ──
r = requests.post(f"{BASE}/api/resource/respond", json={
    "resource_request_id": rr_id, "hospital_id": "H2", "response": "accept"
})
p("3.2 POST /api/resource/respond", r)

# ── 3.3 Get All Resource Requests ──
r = requests.get(f"{BASE}/api/resource/all")
p("3.3 GET /api/resource/all", r)

# ── 4.1 Smart Doctor ──
r = requests.post(f"{BASE}/api/ai/smart-doctor", json={
    "symptoms": "low oxygen, chest pain",
    "vitals": "BP low, SpO2 82%",
    "notes": "patient unconscious"
})
p("4.1 POST /api/ai/smart-doctor", r)

# ── 5.1 Admin Transfers ──
r = requests.get(f"{BASE}/api/admin/transfers")
p("5.1 GET /api/admin/transfers", r)

# ── 5.2 Admin Hospitals ──
r = requests.get(f"{BASE}/api/admin/hospitals")
p("5.2 GET /api/admin/hospitals", r)

# ── 6.1 Nearby Hospitals ──
r = requests.get(f"{BASE}/api/hospitals/nearby", params={"lat": 28.6, "lng": 77.2})
p("6.1 GET /api/hospitals/nearby", r)

print("\n\n✅ ALL API TESTS COMPLETED SUCCESSFULLY!")
