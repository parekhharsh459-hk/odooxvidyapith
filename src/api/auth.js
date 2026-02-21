import client from './client';

export const loginApi = (email, password) => {
    return client.post('/auth/login', { email, password });
};

export const signupApi = (formData) => {
    return client.post('/auth/signup', formData);
};

export const googleAuthApi = (accessToken, profile) => {
    return client.post('/auth/google', { accessToken, profile });
};

export const getMeApi = () => {
    return client.get('/auth/me');
};
