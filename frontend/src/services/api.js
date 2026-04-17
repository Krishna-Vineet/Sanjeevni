import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';
const USE_MOCKS = false; // Toggle this when the real backend is ready

// --- MOCK DATA & PERSISTENCE ---
const getMockData = (key, defaultVal) => {
  const saved = localStorage.getItem(`sanjeevni_${key}`);
  return saved ? JSON.parse(saved) : defaultVal;
};

const saveMockData = (key, data) => {
  localStorage.setItem(`sanjeevni_${key}`, JSON.stringify(data));
};

// Initial Mocks
const INITIAL_HOSPITALS = [
  { id: 'H1', name: 'Fortis Hospital Gurgaon', icu_beds: 80, general_beds: 320, load_factor: 0.75, location: { lat: 28.4595, lng: 77.0745 } },
  { id: 'H2', name: 'Medanta - The Medicity', icu_beds: 200, general_beds: 1400, load_factor: 0.85, location: { lat: 28.4478, lng: 77.0449 }, distance_km: 8.2, arrival_time: 12 },
  { id: 'H3', name: 'Artemis Hospital', icu_beds: 120, general_beds: 630, load_factor: 0.70, location: { lat: 28.4328, lng: 77.0910 }, distance_km: 6.8, arrival_time: 10 },
  { id: 'H4', name: 'Max Super Speciality Hospital', icu_beds: 25, general_beds: 75, load_factor: 0.65, location: { lat: 28.4700, lng: 77.0870 }, distance_km: 3.1, arrival_time: 6 },
  { id: 'H5', name: 'CK Birla Hospital', icu_beds: 15, general_beds: 55, load_factor: 0.55, location: { lat: 28.4250, lng: 77.0800 }, distance_km: 9.5, arrival_time: 15 },
  { id: 'H6', name: 'Alchemist Hospital', icu_beds: 10, general_beds: 40, load_factor: 0.45, location: { lat: 28.4600, lng: 77.0600 }, distance_km: 4.2, arrival_time: 8 },
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // --- AUTH APIS ---
  auth: {
    login: async (credentials) => {
      if (USE_MOCKS) {
        await sleep(1200);
        const hospital = INITIAL_HOSPITALS.find(h => h.id === credentials.hospital_id) || INITIAL_HOSPITALS[0];
        return { 
          data: { 
            token: 'mock-jwt-token-' + Date.now(), 
            hospital: hospital, 
            message: 'Login successful' 
          } 
        };
      }
      return axios.post(`${BASE_URL}/auth/login`, credentials);
    },
    logout: async () => {
      if (USE_MOCKS) {
        await sleep(500);
        return { data: { message: 'Logged out successfully' } };
      }
      return axios.post(`${BASE_URL}/auth/logout`);
    }
  },

  // --- TRANSFER APIS ---
  transfer: {
    create: async (data) => {
      if (USE_MOCKS) {
        await sleep(800);
        const requests = getMockData('requests', []);
        const newRequest = {
          ...data,
          request_id: `REQ${Math.floor(Math.random() * 1000)}`,
          status: 'created',
          created_at: new Date().toISOString(),
          responses: []
        };
        saveMockData('requests', [...requests, newRequest]);
        return { data: { request_id: newRequest.request_id, status: 'created', message: 'Transfer request created successfully' } };
      }
      return axios.post(`${BASE_URL}/transfer/create`, data);
    },

    match: async (requestId) => {
      if (USE_MOCKS) {
        await sleep(1200);
        const hospitals = INITIAL_HOSPITALS.filter(h => h.id !== 'H1').map(h => ({
          hospital_id: h.id,
          name: h.name,
          score: Math.random() * 0.4 + 0.6,
          distance_km: h.distance_km,
          eta_minutes: h.arrival_time,
          specialization_match: true,
          available_resources: ["ICU", "VENTILATOR"]
        })).sort((a, b) => b.score - a.score);

        return { data: { request_id: requestId, ranked_hospitals: hospitals } };
      }
      return axios.get(`${BASE_URL}/transfer/match/${requestId}`);
    },

    broadcast: async (data) => {
      if (USE_MOCKS) {
        await sleep(500);
        const requests = getMockData('requests', []);
        const updated = requests.map(r => {
          if (r.request_id === data.request_id) {
            setTimeout(() => {
              const reqs = getMockData('requests', []);
              const innerUpdated = reqs.map(inner => {
                if (inner.request_id === data.request_id) {
                  return { 
                    ...inner, 
                    status: 'accepted', 
                    assigned_hospital: data.hospital_ids[0],
                    responses: [{ hospital_id: data.hospital_ids[0], response: 'accept' }]
                  };
                }
                return inner;
              });
              saveMockData('requests', innerUpdated);
            }, 3000);
            return { ...r, status: 'broadcasted' };
          }
          return r;
        });
        saveMockData('requests', updated);
        return { data: { status: 'broadcasted', message: 'Request sent to hospitals' } };
      }
      return axios.post(`${BASE_URL}/transfer/broadcast`, data);
    },

    getStatus: async (requestId) => {
      if (USE_MOCKS) {
        const requests = getMockData('requests', []);
        const req = requests.find(r => r.request_id === requestId) || { status: 'not_found' };
        return { data: req };
      }
      return axios.get(`${BASE_URL}/transfer/${requestId}`);
    },

    finalize: async (data) => {
      if (USE_MOCKS) {
        await sleep(500);
        return { data: { assigned_hospital_id: 'H2', eta: 10, message: 'Hospital assigned successfully' } };
      }
      return axios.post(`${BASE_URL}/transfer/finalize`, data);
    }
  },

  // --- HOSPITAL APIS ---
  hospital: {
    respond: async (data) => {
      if (USE_MOCKS) {
        await sleep(500);
        const requests = getMockData('requests', []);
        const updated = requests.map(r => {
          if (r.request_id === data.request_id) {
            return { 
              ...r, 
              responses: [...r.responses, { hospital_id: data.hospital_id, response: data.response }],
              status: data.response === 'accept' ? 'accepted' : r.status,
              assigned_hospital: data.response === 'accept' ? data.hospital_id : r.assigned_hospital
            };
          }
          return r;
        });
        saveMockData('requests', updated);
        return { data: { status: 'recorded', message: 'Response submitted' } };
      }
      return axios.post(`${BASE_URL}/hospital/respond`, data);
    },

    getRequests: async (hospitalId) => {
      if (USE_MOCKS) {
        await sleep(600);
        const requests = getMockData('requests', []);
        return { data: { requests: requests.filter(r => r.status === 'broadcasted' || r.status === 'created') } };
      }
      return axios.get(`${BASE_URL}/hospital/${hospitalId}/requests`);
    },

    updateCapacity: async (hospitalId, data) => {
      if (USE_MOCKS) {
        await sleep(400);
        return { data: { status: 'updated' } };
      }
      return axios.put(`${BASE_URL}/hospital/${hospitalId}/capacity`, data);
    },

    updateSettings: async (hospitalId, data) => {
      if (USE_MOCKS) {
        await sleep(400);
        return { data: { status: 'updated' } };
      }
      return axios.put(`${BASE_URL}/hospital/${hospitalId}/settings`, data);
    }
  },

  // --- RESOURCE APIS ---
  resource: {
    createRequest: async (data) => {
      if (USE_MOCKS) {
        await sleep(700);
        const resRequests = getMockData('resource_requests', []);
        const newReq = { 
          ...data, 
          resource_request_id: `RR${Date.now()}`, 
          status: 'pending', 
          created_at: new Date().toISOString() 
        };
        saveMockData('resource_requests', [...resRequests, newReq]);
        return { data: { resource_request_id: newReq.resource_request_id, status: 'created' } };
      }
      return axios.post(`${BASE_URL}/resource/request`, data);
    },

    respond: async (data) => {
      if (USE_MOCKS) {
        await sleep(500);
        const resRequests = getMockData('resource_requests', []);
        const updated = resRequests.map(r => r.resource_request_id === data.resource_request_id ? { ...r, status: 'accepted', fulfilled_by: data.hospital_id } : r);
        saveMockData('resource_requests', updated);
        return { data: { status: 'accepted' } };
      }
      return axios.post(`${BASE_URL}/resource/respond`, data);
    },

    getAll: async () => {
      if (USE_MOCKS) {
        await sleep(600);
        return { data: { requests: getMockData('resource_requests', []) } };
      }
      return axios.get(`${BASE_URL}/resource/all`);
    }
  },

  // --- AI APIS ---
  ai: {
    smartDoctor: async (data) => {
      if (USE_MOCKS) {
        await sleep(1500);
        const isCritical = data.vitals.toLowerCase().includes('low') || data.symptoms.toLowerCase().includes('chest');
        return { 
          data: { 
            recommendation: isCritical 
              ? "High-risk case detected. Clinical signs indicate potential respiratory failure. Immediate ICU admission with ventilator support is mandatory. Consider immediate transfer if resources are unavailable."
              : "Stable presentation, but requires monitoring. Continue current oxygen support and re-evaluate vitals every 30 minutes.",
            urgency: isCritical ? "critical" : "moderate"
          } 
        };
      }
      return axios.post(`${BASE_URL}/ai/smart-doctor`, data);
    }
  },

  // --- ADMIN & HUD ---
  admin: {
    getTransfers: async () => {
      if (USE_MOCKS) {
        await sleep(800);
        return { data: { transfers: getMockData('requests', []) } };
      }
      return axios.get(`${BASE_URL}/admin/transfers`);
    },

    getHospitals: async () => {
      if (USE_MOCKS) {
        await sleep(500);
        return { data: { hospitals: INITIAL_HOSPITALS } };
      }
      return axios.get(`${BASE_URL}/admin/hospitals`);
    }
  },

  utility: {
    getNearbyHospitals: async (lat, lng) => {
      if (USE_MOCKS) {
        await sleep(400);
        return { data: { hospitals: INITIAL_HOSPITALS.filter(h => h.id !== 'H1').map(h => ({ id: h.id, name: h.name, distance_km: h.distance_km })) } };
      }
      return axios.get(`${BASE_URL}/hospitals/nearby?lat=${lat}&lng=${lng}`);
    }
  }
};
