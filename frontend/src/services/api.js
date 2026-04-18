import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';
// const BASE_URL = 'https://sanjeevni-9zgt.onrender.com/api';

// --- AUTH TOKEN MANAGEMENT ---
const API = axios.create({
  baseURL: BASE_URL,
});

// Add a request interceptor to include the JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanjeevni_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const api = {
  // --- AUTH APIS ---
  auth: {
    login: async (credentials) => {
      // payload: { hospital_id, password }
      return API.post(`/auth/login`, credentials);
    },
    logout: async () => {
      localStorage.removeItem('sanjeevni_token');
      localStorage.removeItem('sanjeevni_user');
      return API.post(`/auth/logout`);
    }
  },

  // --- TRANSFER APIS (Code Red Protocol) ---
  transfer: {
    create: async (data) => {
      return API.post(`/transfer/create`, data);
    },

    match: async (requestId) => {
      return API.get(`/transfer/match/${requestId}`);
    },

    broadcast: async (data) => {
      // payload: { request_id, hospital_ids: [] } (ids optional for elite broadcast)
      return API.post(`/transfer/broadcast`, data);
    },

    getStatus: async (requestId) => {
      return API.get(`/transfer/${requestId}`);
    },

    finalize: async (data) => {
      return API.post(`/transfer/finalize`, data);
    },
    
    getHistory: async () => {
      return API.get(`/transfer/history`);
    }
  },

  // --- HOSPITAL APIS ---
  hospital: {
    respond: async (data) => {
      return API.post(`/hospital/respond`, data);
    },

    getRequests: async () => {
      return API.get(`/hospital/requests`);
    },

    updateCapacity: async (data) => {
      return API.put(`/hospital/capacity`, data);
    },

    updateSettings: async (data) => {
      return API.put(`/hospital/settings`, data);
    }
  },

  // --- RESOURCE APIS ---
  resource: {
    createRequest: async (data) => {
      return API.post(`/resource/request`, data);
    },

    respond: async (data) => {
      return API.post(`/resource/respond`, data);
    },

    getAll: async () => {
      return API.get(`/resource/all`);
    },

    getStats: async () => {
      return API.get(`/resource/stats`);
    },
    
    cancelRequest: async (id) => {
      return API.delete(`/resource/cancel/${id}`);
    }
  },

  // --- AI DOCTOR (Context-Aware) ---
  ai: {
    smartDoctor: async (data) => {
      // payload: { input }
      return API.post(`/ai/smart-doctor`, { input: data.input || data.symptoms });
    }
  },
  
  // --- INVENTORY APIS ---
  inventory: {
    get: async () => {
      return API.get(`/inventory`);
    },
    update: async (data) => {
      // payload: { items: [...] }
      return API.put(`/inventory`, data);
    },
    getByPrediction: async () => {
      return API.get(`/inventory/prediction`);
    }
  },

  // --- NEWS BROADCAST ---
  news: {
    latest: async () => {
      return API.get(`/news/latest`);
    },
    broadcast: async (data) => {
      return API.post(`/news/broadcast`, data);
    }
  },

  // --- UTILITIES ---
  utility: {
    getNearbyHospitals: async (lat, lng) => {
      return API.get(`/hospitals/nearby?lat=${lat}&lng=${lng}`);
    }
  },

  ml: {
    predictNext7Days: async (hospital_id) => {
      return axios.post('http://localhost:8001/predict_next_7_days', { hosp_id: hospital_id });
    }
  }
};
