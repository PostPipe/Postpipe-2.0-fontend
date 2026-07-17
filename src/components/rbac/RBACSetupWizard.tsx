'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, Loader2, Database } from 'lucide-react';
import { createRBACSystemAction } from '@/app/actions/dashboard';
import { useToast } from '@/hooks/use-toast';

export default function RBACSetupWizard({
    connectors,
    forms,
    onSuccess,
    onCancel
}: {
    connectors: any[];
    forms?: any[];
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [systemName, setSystemName] = useState('');
    const [connectorId, setConnectorId] = useState(connectors[0]?.id || '');
    const [targetDatabase, setTargetDatabase] = useState('');
    
    // User Table Mapping
    const [tableName, setTableName] = useState('users');
    const [rolesCol, setRolesCol] = useState('roles');
    const [emailCol, setEmailCol] = useState('email');
    const [passwordCol, setPasswordCol] = useState('password');

    // Managed Forms
    const [managedForms, setManagedForms] = useState<string[]>([]);
    const [fallbackSetupLink, setFallbackSetupLink] = useState<string | null>(null);

    const handleNext = () => setStep(s => s + 1);
    const handlePrev = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await createRBACSystemAction({
                name: systemName,
                connectorId,
                targetDatabase: targetDatabase || undefined,
                tableName,
                rolesCol,
                emailCol,
                passwordCol,
                managedForms
            });
            toast({
                title: 'Success',
                description: 'RBAC System created successfully!',
            });
            if (res.fallbackSetupLink) {
                setFallbackSetupLink(res.fallbackSetupLink);
                setStep(4);
            } else {
                onSuccess();
            }
        } catch (err: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: err.message || 'Failed to create RBAC System',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedConnector = connectors.find(c => c.id === connectorId);
    const availableDatabases = selectedConnector?.databases ? Object.keys(selectedConnector.databases) : [];

    return (
        <div className="bg-zinc-950/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                <Shield className="w-64 h-64 text-violet-500" />
            </div>

            <div className="relative z-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Create RBAC System</h2>
                    <p className="text-neutral-400">
                        Postpipe will create native Roles and Permissions forms to control access to your data.
                    </p>
                </div>

                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-neutral-300">System Name</Label>
                                <Input 
                                    placeholder="e.g., Backoffice Roles"
                                    value={systemName}
                                    onChange={e => setSystemName(e.target.value)}
                                    className="bg-white/5 border-white/10 mt-1.5 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-neutral-300">Connector</Label>
                                <select 
                                    className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm mt-1.5 text-white"
                                    value={connectorId}
                                    onChange={e => setConnectorId(e.target.value)}
                                >
                                    {connectors.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {availableDatabases.length > 0 && (
                                <div>
                                    <Label className="text-neutral-300">Target Database</Label>
                                    <select 
                                        className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm mt-1.5 text-white"
                                        value={targetDatabase}
                                        onChange={e => setTargetDatabase(e.target.value)}
                                    >
                                        <option value="">Default Database</option>
                                        {availableDatabases.map(dbName => (
                                            <option key={dbName} value={dbName}>{dbName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={onCancel} className="text-neutral-400">Cancel</Button>
                            <Button onClick={handleNext} disabled={!systemName} className="bg-violet-600 hover:bg-violet-500 text-white">
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4 text-violet-400">
                                <Database className="w-5 h-5" />
                                <span className="font-semibold">User Schema Mapping</span>
                            </div>
                            <div>
                                <Label className="text-neutral-300">Table / Collection Name</Label>
                                <Input 
                                    value={tableName}
                                    onChange={e => setTableName(e.target.value)}
                                    className="bg-white/5 border-white/10 mt-1.5 text-white"
                                />
                                <p className="text-xs text-neutral-500 mt-1">The existing table where your users are stored.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <Label className="text-neutral-300">Roles Column</Label>
                                    <Input 
                                        value={rolesCol}
                                        onChange={e => setRolesCol(e.target.value)}
                                        className="bg-white/5 border-white/10 mt-1.5 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-neutral-300">Email Column</Label>
                                    <Input 
                                        value={emailCol}
                                        onChange={e => setEmailCol(e.target.value)}
                                        className="bg-white/5 border-white/10 mt-1.5 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-neutral-300">Password Column</Label>
                                    <Input 
                                        value={passwordCol}
                                        onChange={e => setPasswordCol(e.target.value)}
                                        className="bg-white/5 border-white/10 mt-1.5 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={handlePrev} className="text-neutral-400">Back</Button>
                            <Button onClick={handleNext} disabled={!tableName} className="bg-violet-600 hover:bg-violet-500 text-white">
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4 text-violet-400">
                                <Shield className="w-5 h-5" />
                                <span className="font-semibold">Managed Forms</span>
                            </div>
                            <p className="text-sm text-neutral-400">
                                Select the forms that this RBAC system will manage permissions for. The master admin will be able to assign access to these forms per role.
                            </p>
                            
                            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-white/10 rounded-lg p-4 bg-white/5">
                                {forms && forms.length > 0 ? (
                                    forms.map(form => (
                                        <div key={form.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white/5 transition-colors">
                                            <input 
                                                type="checkbox" 
                                                id={`form-${form.id}`} 
                                                checked={managedForms.includes(form.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setManagedForms([...managedForms, form.id]);
                                                    } else {
                                                        setManagedForms(managedForms.filter(id => id !== form.id));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-white/20 bg-black/50 text-violet-500 focus:ring-violet-500/50"
                                            />
                                            <label htmlFor={`form-${form.id}`} className="text-sm font-medium text-neutral-200 cursor-pointer flex-1">
                                                {form.name} <span className="text-neutral-500 text-xs font-mono ml-2">({form.id})</span>
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-neutral-500 py-4 text-center">No forms available. Create forms first.</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={handlePrev} className="text-neutral-400">Back</Button>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={isSubmitting} 
                                className="bg-violet-600 hover:bg-violet-500 text-white"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Provisioning RBAC...</>
                                ) : (
                                    'Create RBAC System'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
                {step === 4 && fallbackSetupLink && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-3">
                            <h3 className="text-yellow-400 font-medium">Almost Done: Master Admin Setup Required</h3>
                            <p className="text-sm text-yellow-200/80">
                                We couldn't email you the setup link because your connector doesn't have an email provider configured. 
                                Please use the link below to securely set your Master Admin password now:
                            </p>
                            <div className="p-3 bg-black/40 border border-white/10 rounded break-all font-mono text-xs text-neutral-300 select-all">
                                {fallbackSetupLink}
                            </div>
                            <Button 
                                onClick={() => window.open(fallbackSetupLink, '_blank')}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-2"
                            >
                                Open Setup Link
                            </Button>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <Button onClick={onSuccess} className="bg-white/10 hover:bg-white/20 text-white">
                                Finish
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
