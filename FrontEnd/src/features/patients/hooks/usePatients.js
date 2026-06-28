import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Helper to convert form object values to FormData
const buildPatientFormData = (data) => {
  const formData = new FormData();
  
  // Append photo file if selected
  if (data.photoFile) {
    formData.append('photo', data.photoFile);
  }
  
  // Append text fields
  Object.keys(data).forEach((key) => {
    if (key !== 'photoFile' && data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key]);
    }
  });
  
  return formData;
};

// 1. Fetch paginated patient records list
export const usePatientsList = ({ search = '', page = 1, limit = 10 }) => {
  return useQuery({
    queryKey: ['patients', { search, page, limit }],
    queryFn: async () => {
      const response = await axios.get('/api/patients', {
        params: { search, page, limit }
      });
      return response.data.data;
    },
    keepPreviousData: true
  });
};

// 2. Fetch single patient details
export const usePatientDetails = (id) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(`/api/patients/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

// 3. Register patient mutation
export const useRegisterPatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientData) => {
      const formData = buildPatientFormData(patientData);
      const response = await axios.post('/api/patients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
};

// 4. Update patient details mutation
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, patientData }) => {
      const formData = buildPatientFormData(patientData);
      const response = await axios.put(`/api/patients/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
    }
  });
};
