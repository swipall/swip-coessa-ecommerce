'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { requestEmailUpdateAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditEmailFormProps {
    currentEmail: string;
}

export function EditEmailForm({ currentEmail }: EditEmailFormProps) {
    const [state, formAction, isPending] = useActionState(requestEmailUpdateAction, undefined);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('edit-email-form') as HTMLFormElement;
            form?.reset();
            toast.success('Correo actualizado', { description: 'Se envió un correo de verificación a tu nueva dirección.' });
        }
        if (state?.error) {
            toast.error('Error', { description: state.error });
        }
    }, [state]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>
                    Update your email address. You'll need to verify the new email.
                </CardDescription>
            </CardHeader>
            <form id="edit-email-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentEmail">Current Email</Label>
                        <Input
                            id="currentEmail"
                            type="email"
                            value={currentEmail}
                            disabled
                            className="bg-muted"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newEmailAddress">New Email Address</Label>
                        <Input
                            id="newEmailAddress"
                            name="newEmailAddress"
                            type="email"
                            placeholder="new.email@example.com"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Current Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                        <p className="text-xs text-white/50">
                            Enter your password to confirm this change.
                        </p>
                    </div>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? 'Sending...' : 'Update Email'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
