import client from './client';

// Financial Analytics
export const getFinancialAnalytics = () => {
    return client.get('/analytics/financial');
};

// Fuel Management
export const getFuelLogs = (vehicleId = null) => {
    const endpoint = vehicleId ? `/fuel?vehicleId=${vehicleId}` : '/fuel';
    return client.get(endpoint);
};

export const createFuelLog = (fuelData) => {
    return client.post('/fuel', fuelData);
};

export const updateFuelLog = (fuelId, data) => {
    return client.put(`/fuel/${fuelId}`, data);
};

// Maintenance Management
export const getMaintenanceLogs = (vehicleId = null) => {
    const endpoint = vehicleId ? `/maintenance?vehicleId=${vehicleId}` : '/maintenance';
    return client.get(endpoint);
};

export const createMaintenanceLog = (maintenanceData) => {
    return client.post('/maintenance', maintenanceData);
};

export const updateMaintenanceLog = (maintenanceId, data) => {
    return client.put(`/maintenance/${maintenanceId}`, data);
};

// Export utilities
export const exportToCSV = (data, filename) => {
    const csv = convertToCSV(data);
    downloadFile(csv, filename, 'text/csv');
};

export const exportToPDF = (data, filename) => {
    // Simple PDF export - in production, use a library like jsPDF
    const content = JSON.stringify(data, null, 2);
    downloadFile(content, filename, 'application/pdf');
};

// Helper functions
function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header];
            return `"${value}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
