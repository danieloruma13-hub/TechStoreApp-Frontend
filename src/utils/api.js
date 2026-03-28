import axios from 'axios';

// 1. Create the instance
const api = axios.create({
  // REPLACE THIS with your exact Render URL from the screenshot
  baseURL: 'https://techstoreapp-gobr.onrender.com/api', 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 2. Add a Request Interceptor (Debug Tool)
api.interceptors.request.use((config) => {
  console.log(`🚀 Sending ${config.method.toUpperCase()} to: ${config.url}`);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Add a Response Interceptor (Data & Error Handler)
api.interceptors.response.use(
  (response) => {
    // This logs the actual data coming back from Render
    console.log("✅ API Response Data:", response.data);
    return response;
  },
  (error) => {
    // This logs specific server errors (like 404 or 500)
    if (error.response) {
      console.error("❌ Backend Error:", error.response.status, error.response.data);
    } else {
      console.error("❌ Network Error: Is the backend awake?");
    }
    return Promise.reject(error);
  }
);

export default api;
