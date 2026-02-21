// Basic fetch wrapper with JWT attachment
const API_BASE = '/api';

const client = async (endpoint, { body, ...customConfig } = {}) => {
    const token = localStorage.getItem('fleetflow_jwt');

    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (response.ok) {
            return data;
        }

        throw new Error(data.message || 'API request failed');
    } catch (err) {
        return Promise.reject(err.message || 'Network error');
    }
};

client.get = (endpoint, config) => client(endpoint, { ...config, method: 'GET' });
client.post = (endpoint, body, config) => client(endpoint, { ...config, method: 'POST', body });
client.put = (endpoint, body, config) => client(endpoint, { ...config, method: 'PUT', body });
client.delete = (endpoint, config) => client(endpoint, { ...config, method: 'DELETE' });

export default client;
