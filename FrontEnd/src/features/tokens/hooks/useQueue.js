import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// 1. Fetch paginated queue token listing
export const useQueueList = ({ search = '', status = '', doctorId = '', date = '', page = 1, limit = 12 }) => {
  return useQuery({
    queryKey: ['queue', { search, status, doctorId, date, page, limit }],
    queryFn: async () => {
      const response = await axios.get('/api/tokens', {
        params: { search, status, doctorId, date, page, limit }
      });
      return response.data.data;
    },
    keepPreviousData: true
  });
};

// 2. Fetch active doctors with queue waiting counts
export const useActiveDoctors = () => {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const response = await axios.get('/api/tokens/doctors');
      return response.data.data;
    }
  });
};

// 3. Check follow-up status
export const useCheckFollowUp = (patientId, doctorId) => {
  return useQuery({
    queryKey: ['followup-check', { patientId, doctorId }],
    queryFn: async () => {
      if (!patientId || !doctorId) return null;
      const response = await axios.get('/api/tokens/check-follow-up', {
        params: { patientId, doctorId }
      });
      return response.data.data;
    },
    enabled: !!patientId && !!doctorId
  });
};

// 4. Issue a new token mutation
export const useIssueToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tokenData) => {
      const response = await axios.post('/api/tokens', tokenData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

// 5. Update token status mutation
export const useUpdateTokenStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await axios.patch(`/api/tokens/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

// 6. Transfer token to doctor mutation
export const useTransferToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, doctorId }) => {
      const response = await axios.post(`/api/tokens/${id}/transfer`, { doctorId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
  });
};

// 7. Fetch general dashboard overview stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axios.get('/api/tokens/stats');
      return response.data.data;
    }
  });
};
