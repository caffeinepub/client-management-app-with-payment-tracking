import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAddPayment, useUpdatePayment } from '../hooks/useQueries';
import type { Payment } from '../backend';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: bigint;
  payment?: Payment | null;
}

interface PaymentFormData {
  amount: string;
  date: string;
  method: string;
  notes: string;
}

const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'PayPal', 'Other'];

export default function PaymentDialog({ open, onOpenChange, clientId, payment }: PaymentDialogProps) {
  const addPayment = useAddPayment();
  const updatePayment = useUpdatePayment();
  const isEditing = !!payment;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PaymentFormData>({
    defaultValues: {
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'Cash',
      notes: '',
    },
  });

  const selectedMethod = watch('method');

  useEffect(() => {
    if (payment) {
      const paymentDate = new Date(Number(payment.date) / 1000000);
      reset({
        amount: payment.amount.toString(),
        date: paymentDate.toISOString().split('T')[0],
        method: payment.method,
        notes: payment.notes,
      });
    } else {
      reset({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Cash',
        notes: '',
      });
    }
  }, [payment, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const amount = parseFloat(data.amount);
      const date = BigInt(new Date(data.date).getTime() * 1000000);

      if (isEditing && payment) {
        await updatePayment.mutateAsync({
          paymentId: payment.id,
          amount,
          date,
          method: data.method,
          notes: data.notes,
        });
      } else {
        await addPayment.mutateAsync({
          clientId,
          amount,
          date,
          method: data.method,
          notes: data.notes,
        });
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  const isLoading = addPayment.isPending || updatePayment.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Payment' : 'Add New Payment'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update payment information' : 'Record a new payment for this client'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', {
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
              })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={selectedMethod} onValueChange={(value) => setValue('method', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional information about this payment..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Payment' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
