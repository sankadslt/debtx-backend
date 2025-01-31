import axios from 'axios';

const API_BASE_URL = '/api/incident';

// Fetch Incidents with filters
export const fetchIncidents = async (filters) => {
  try {
    const mappedFilters = {
      Actions: filters.Actions,
      Incident_Status: filters.Incident_Status,
      From_Date: filters.From_Date,
      To_Date: filters.To_Date
    };
    
    const response = await axios.post(`${API_BASE_URL}/List_Incidents`, mappedFilters);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Example implementation for `Request_Incident_External_information`
export const Request_Incident_External_information = async (incidentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/External_Information/${incidentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
