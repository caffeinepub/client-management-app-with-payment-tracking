import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetClients, useGetOverallPaymentTotal } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import Header from '../components/Header';
import StatsCards from '../components/StatsCards';
import ClientsList from '../components/ClientsList';
import ClientDialog from '../components/ClientDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Client } from '../backend';

export default function Dashboard() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: clients = [], isLoading: clientsLoading } = useGetClients();
  const { data: overallTotal = 0 } = useGetOverallPaymentTotal();

  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setIsClientDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsClientDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsClientDialogOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header userName={userProfile?.name || 'User'} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <StatsCards 
          totalClients={clients.length}
          overallTotal={overallTotal}
          isLoading={clientsLoading}
        />

        {/* Clients Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Clients</h2>
              <p className="text-muted-foreground">Manage your client relationships</p>
            </div>
            <Button onClick={handleAddClient} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Client
            </Button>
          </div>

          <ClientsList 
            clients={clients}
            isLoading={clientsLoading}
            onEditClient={handleEditClient}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        <p>© 2025. Built with love using <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">caffeine.ai</a></p>
      </footer>

      <ClientDialog
        open={isClientDialogOpen}
        onOpenChange={handleCloseDialog}
        client={editingClient}
      />
    </div>
  );
}
