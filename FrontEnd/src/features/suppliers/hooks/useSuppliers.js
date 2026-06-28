import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 1. Fetch paginated list of suppliers
export const useSuppliersList = (params = {}) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const response = await axios.get('/api/suppliers', { params });
      return response.data.data;
    }
  });
};

// 2. Fetch single supplier details
export const useSupplierDetails = (supplierId) => {
  return useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: async () => {
      const response = await axios.get(`/api/suppliers/${supplierId}`);
      return response.data.data;
    },
    enabled: !!supplierId
  });
};

// 3. Register a new supplier mutation
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (supplierData) => {
      const response = await axios.post('/api/suppliers', supplierData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    }
  });
};

// 4. Update supplier details mutation
export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, supplierData }) => {
      const response = await axios.put(`/api/suppliers/${id}`, supplierData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
    }
  });
};
