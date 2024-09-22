import axios from 'axios';
import { error } from 'console';


// create an axios instance 

const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    timeout: 500,
    headers: {
        'content': 'application/json',
    }
});


axiosInstance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error)
    }
)


axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
)

export default axiosInstance