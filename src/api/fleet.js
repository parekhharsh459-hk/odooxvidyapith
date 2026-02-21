import client from './client';

export const getVehicles = () => client.get('/vehicles');
export const addVehicle = (data) => client.post('/vehicles', data);
export const updateVehicle = (id, data) => client.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => client.delete(`/vehicles/${id}`);

export const getDrivers = () => client.get('/drivers');
export const updateDriver = (id, data) => client.put(`/drivers/${id}`, data);

export const getTrips = () => client.get('/trips');
export const addTrip = (data) => client.post('/trips', data);
export const updateTrip = (id, data) => client.put(`/trips/${id}`, data);

export const getMaintenance = () => client.get('/maintenance');
export const addMaintenance = (data) => client.post('/maintenance', data);

export const getFuel = () => client.get('/fuel');
export const addFuel = (data) => client.post('/fuel', data);

export const getActivities = () => client.get('/activities');
