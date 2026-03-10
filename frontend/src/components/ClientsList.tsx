import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Client } from '../backend';
import ClientCard from './ClientCard';
import ClientDetailsDialog from './ClientDetailsDialog';

interface ClientsListProps {
  clients: Client[];
  isLoading: boolean;
  onEditClient: (client: Client) => void;
}

export default function ClientsList({ clients, isLoading, onEditClient }: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search clients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No clients found matching your search' : 'No clients yet'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-muted-foreground">
              Click "Add Client" to create your first client
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id.toString()}
              client={client}
              onEdit={() => onEditClient(client)}
              onViewDetails={() => setSelectedClient(client)}
            />
          ))}
        </div>
      )}

      <ClientDetailsDialog
        client={selectedClient}
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
        onEdit={() => {
          if (selectedClient) {
            onEditClient(selectedClient);
            setSelectedClient(null);
          }
        }}
      />
    </>
  );
}
