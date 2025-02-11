
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

export const Request_Incident_External_information = async ({ Account_Num, Monitor_Months }) => {
    
    console.log("Requesting external information...");
    console.log("Account_Num:", Account_Num, "Monitor_Months:", Monitor_Months);
  
    // Simulate a successful API response
    return { success: true, message: "External information requested successfully." };
  };
