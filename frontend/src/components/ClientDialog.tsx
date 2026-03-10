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
import { useAddClient, useUpdateClient } from '../hooks/useQueries';
import type { Client } from '../backend';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export default function ClientDialog({ open, onOpenChange, client }: ClientDialogProps) {
  const addClient = useAddClient();
  const updateClient = useUpdateClient();
  const isEditing = !!client;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        notes: '',
      });
    }
  }, [client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      if (isEditing && client) {
        await updateClient.mutateAsync({
          clientId: client.id,
          ...data,
        });
      } else {
        await addClient.mutateAsync(data);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const isLoading = addClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Client' : 'Add New Client'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update client information' : 'Enter the details for the new client'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Additional information about the client..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Client' : 'Add Client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
