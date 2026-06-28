import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 1. Fetch paginated products list
export const useProductsList = ({ search = '', page = 1, limit = 10 }) => {
  return useQuery({
    queryKey: ['products', { search, page, limit }],
    queryFn: async () => {
      const response = await axios.get('/api/products', {
        params: { search, page, limit }
      });
      return response.data.data;
    },
    keepPreviousData: true
  });
};

// 2. Fetch single product details
export const useProductDetails = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axios.get(`/api/products/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

// 3. Register product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData) => {
      const response = await axios.post('/api/products', productData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
};

// 4. Update product details mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, productData }) => {
      const response = await axios.put(`/api/products/${id}`, productData);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    }
  });
};

// 5. Fetch manufacturers list
export const useManufacturersList = () => {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const response = await axios.get('/api/products/manufacturers');
      return response.data.data;
    }
  });
};

// 6. Create manufacturer mutation
export const useCreateManufacturer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mfrName) => {
      const response = await axios.post('/api/products/manufacturers', { mfrName });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    }
  });
};

// 7. Fetch HsnCodes list
export const useHsnCodesList = () => {
  return useQuery({
    queryKey: ['hsncodes'],
    queryFn: async () => {
      const response = await axios.get('/api/products/hsncodes');
      return response.data.data;
    }
  });
};

// 8. Create HsnCode mutation
export const useCreateHsnCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (hsnData) => {
      const response = await axios.post('/api/products/hsncodes', hsnData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hsncodes'] });
    }
  });
};
