import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Edit, Eye, Trash2 } from 'lucide-react';
import type { Client } from '../backend';
import { useDeleteClient, useGetPaymentTotalsByClient } from '../hooks/useQueries';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ClientCardProps {
  client: Client;
  onEdit: () => void;
  onViewDetails: () => void;
}

export default function ClientCard({ client, onEdit, onViewDetails }: ClientCardProps) {
  const deleteClient = useDeleteClient();
  const { data: totalPayments = 0 } = useGetPaymentTotalsByClient(client.id);

  const handleDelete = () => {
    deleteClient.mutate(client.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium">
                Total Payments: <span className="text-green-600 dark:text-green-400">${totalPayments.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="icon" onClick={onViewDetails}>
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Client</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {client.name}? This will also delete all associated payments. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
