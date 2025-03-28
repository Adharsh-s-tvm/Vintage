import axios from "axios";

const api = axios.create({
    baseUrl: 'http://localhost:7000/api'
});

export const googleAuth = (code) => api.post(`/google?code=${code}`, code)