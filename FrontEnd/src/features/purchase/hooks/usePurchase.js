import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 1. Fetch paginated list of purchase invoices
export const usePurchaseList = (params = {}) => {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: async () => {
      const response = await axios.get('/api/purchase', { params });
      return response.data.data;
    }
  });
};

// 2. Fetch details of a single purchase invoice
export const usePurchaseDetails = (purchaseId) => {
  return useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async () => {
      const response = await axios.get(`/api/purchase/${purchaseId}`);
      return response.data.data;
    },
    enabled: !!purchaseId
  });
};

// 3. Record a new purchase inward mutation (increments active stocks)
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (purchaseData) => {
      const response = await axios.post('/api/purchase', purchaseData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};
