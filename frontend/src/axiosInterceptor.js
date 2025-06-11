import axios from 'axios';

const axiosInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const { status } = error.response?.status;
      if (status === 403) {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInterceptor;