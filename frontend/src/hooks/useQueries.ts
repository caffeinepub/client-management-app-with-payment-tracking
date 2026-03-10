import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Client, Payment, UserProfile } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

// Client Queries
export function useGetClients() {
  const { actor, isFetching } = useActor();

  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClients();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetClient(clientId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Client | null>({
    queryKey: ['client', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return null;
      return actor.getClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
  });
}

export function useSearchClients(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Client[]>({
    queryKey: ['clients', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchClients(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}

export function useAddClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; phone: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addClient(data.name, data.email, data.phone, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add client');
    },
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { clientId: bigint; name: string; email: string; phone: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateClient(data.clientId, data.name, data.email, data.phone, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update client');
    },
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteClient(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTotals'] });
      queryClient.invalidateQueries({ queryKey: ['overallTotal'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client');
    },
  });
}

// Payment Queries
export function useGetPaymentsByClient(clientId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: ['payments', 'client', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return [];
      return actor.getPaymentsByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
  });
}

export function useAddPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { clientId: bigint; amount: number; date: bigint; method: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPayment(data.clientId, data.amount, data.date, data.method, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTotals'] });
      queryClient.invalidateQueries({ queryKey: ['overallTotal'] });
      toast.success('Payment added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add payment');
    },
  });
}

export function useUpdatePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { paymentId: bigint; amount: number; date: bigint; method: string; notes: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePayment(data.paymentId, data.amount, data.date, data.method, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTotals'] });
      queryClient.invalidateQueries({ queryKey: ['overallTotal'] });
      toast.success('Payment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update payment');
    },
  });
}

export function useDeletePayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePayment(paymentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['paymentTotals'] });
      queryClient.invalidateQueries({ queryKey: ['overallTotal'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete payment');
    },
  });
}

export function useGetPaymentTotalsByClient(clientId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['paymentTotals', 'client', clientId?.toString()],
    queryFn: async () => {
      if (!actor || !clientId) return 0;
      return actor.getPaymentTotalsByClient(clientId);
    },
    enabled: !!actor && !isFetching && clientId !== null,
  });
}

export function useGetOverallPaymentTotal() {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['overallTotal'],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getOverallPaymentTotal();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchPayments(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Payment[]>({
    queryKey: ['payments', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchPayments(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 0,
  });
}
