import client from './client';

export const loginApi = (email, password) => {
    return client.post('/auth/login', { email, password });
};

export const signupApi = (formData) => {
    return client.post('/auth/signup', formData);
};

export const googleAuthApi = (accessToken, profile, role, roleKey) => {
    return client.post('/auth/google', { accessToken, profile, role, roleKey });
};

export const getMeApi = () => {
    return client.get('/auth/me');
};
