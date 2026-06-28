import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 1. Fetch list of invoices hook
export const useSalesList = (params = {}) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: async () => {
      const response = await axios.get('/api/invoices', { params });
      return response.data.data;
    }
  });
};

// 2. Fetch invoice details hook
export const useInvoiceDetails = (invoiceId) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await axios.get(`/api/invoices/${invoiceId}`);
      return response.data.data;
    },
    enabled: !!invoiceId
  });
};

// 3. Create a new sales invoice checkout mutation
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceData) => {
      const response = await axios.post('/api/invoices', invoiceData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

// 4. Cancel sales invoice and restore stock mutation
export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId) => {
      const response = await axios.patch(`/api/invoices/${invoiceId}/cancel`);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};
