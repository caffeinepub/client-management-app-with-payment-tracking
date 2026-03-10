import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Edit, Trash2 } from 'lucide-react';
import type { Payment } from '../backend';
import { useDeletePayment } from '../hooks/useQueries';
import PaymentDialog from './PaymentDialog';
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

interface PaymentsListProps {
  payments: Payment[];
  clientId: bigint;
}

export default function PaymentsList({ payments, clientId }: PaymentsListProps) {
  const deletePayment = useDeletePayment();
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const handleDelete = (paymentId: bigint) => {
    deletePayment.mutate(paymentId);
  };

  const sortedPayments = [...payments].sort((a, b) => Number(b.date - a.date));

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No payments recorded yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sortedPayments.map((payment) => (
          <Card key={payment.id.toString()}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <Badge variant="outline">{payment.method}</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(Number(payment.date) / 1000000).toLocaleDateString()}</span>
                    </div>
                    {payment.notes && (
                      <p className="text-sm mt-2">{payment.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingPayment(payment)}
                  >
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
                        <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this payment of ${payment.amount.toFixed(2)}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(payment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PaymentDialog
        open={!!editingPayment}
        onOpenChange={(open) => !open && setEditingPayment(null)}
        clientId={clientId}
        payment={editingPayment}
      />
    </>
  );
}
