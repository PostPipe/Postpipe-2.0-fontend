import React, { useState } from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { updateRBACSystemSettingsAction } from '@/app/actions/dashboard';
import { useRouter } from 'next/navigation';

interface RBACEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    system: any;
    forms: any[];
}

export function RBACEditModal({ isOpen, onClose, system, forms }: RBACEditModalProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [managedForms, setManagedForms] = useState<string[]>(system.settings?.managedForms || []);
    
    // We only expose managedForms for now since table structure might be risky to change post-creation
    // But we could add tableName, rolesCol etc if needed.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await updateRBACSystemSettingsAction(system.id, {
                settings: {
                    ...system.settings,
                    managedForms
                }
            });
            router.refresh();
            onClose();
        } catch (error) {
            console.error("Failed to update RBAC system", error);
            alert("Failed to update settings.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Edit RBAC System Settings
                    </DialogTitle>
                    <DialogDescription>
                        Update the forms that the Master Admin is allowed to manage permissions for.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Managed Forms</Label>
                            <p className="text-xs text-neutral-500">
                                Select which forms the Master Admin can configure permissions for.
                            </p>
                            <div className="border border-neutral-200 dark:border-white/10 rounded-md p-4 space-y-3 max-h-[200px] overflow-y-auto bg-neutral-50 dark:bg-black/20">
                                {forms.length === 0 ? (
                                    <p className="text-sm text-neutral-500 text-center py-4">No forms available in your workspace yet.</p>
                                ) : (
                                    forms.map(f => (
                                        <label key={f.id} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-600"
                                                checked={managedForms.includes(f.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setManagedForms([...managedForms, f.id]);
                                                    else setManagedForms(managedForms.filter(id => id !== f.id));
                                                }}
                                            />
                                            <span className="text-sm font-medium">{f.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
