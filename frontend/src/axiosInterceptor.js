import axios from 'axios';

const axiosInterceptor = () => {
  // Attach token to request headers
  axios.interceptors.request.use(
    (config) => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo?.token) {
        config.headers.Authorization = userInfo.token; // Bearer token
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle 403 globally
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInterceptor;
