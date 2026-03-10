import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, FileText, Plus, Edit } from 'lucide-react';
import type { Client } from '../backend';
import { useGetPaymentsByClient, useGetPaymentTotalsByClient } from '../hooks/useQueries';
import PaymentsList from './PaymentsList';
import PaymentDialog from './PaymentDialog';

interface ClientDetailsDialogProps {
  client: Client | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export default function ClientDetailsDialog({ client, open, onOpenChange, onEdit }: ClientDetailsDialogProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { data: payments = [] } = useGetPaymentsByClient(client?.id || null);
  const { data: totalPayments = 0 } = useGetPaymentTotalsByClient(client?.id || null);

  if (!client) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{client.name}</DialogTitle>
                <DialogDescription>Client details and payment history</DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-3">
                {client.email && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{client.phone}</p>
                    </div>
                  </div>
                )}

                {client.notes && (
                  <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Payments</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${totalPayments.toFixed(2)}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Total: ${totalPayments.toFixed(2)}
                </p>
                <Button onClick={() => setIsPaymentDialogOpen(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Payment
                </Button>
              </div>
              <PaymentsList payments={payments} clientId={client.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        clientId={client.id}
      />
    </>
  );
}
