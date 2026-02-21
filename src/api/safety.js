import client from './client';

// Driver management
export const updateDriverStatus = (driverId, status) => {
    return client.put(`/drivers/${driverId}`, { status });
};

export const updateDriverSafetyScore = (driverId, score, incident = false) => {
    return client.put(`/drivers/${driverId}/safety-score`, { score, incident });
};

// Incident management
export const getIncidents = (driverId = null) => {
    const endpoint = driverId ? `/incidents?driverId=${driverId}` : '/incidents';
    return client.get(endpoint);
};

export const createIncident = (incidentData) => {
    return client.post('/incidents', incidentData);
};

export const updateIncident = (incidentId, data) => {
    return client.put(`/incidents/${incidentId}`, data);
};
