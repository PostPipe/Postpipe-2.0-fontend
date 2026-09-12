'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Plus,
    Trash2,
    Code,
    Save,
    GripVertical,
    Clipboard,
    Check,
    AlertCircle,
    Settings,
    Layers,
    Send,
    Lock,
    Sparkles,
    Database,
    Shield,
    RotateCcw,
    Link2,
    Folders,
} from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FIELD_TYPES, getGroupedFieldTypes } from '@/config/field-types';
import { ReferenceFieldConfig } from '@/components/ui/reference-input';
import { RainbowButton } from '@/components/ui/rainbow-button';
import Loader from '@/components/ui/loader';
import { BorderBeam } from '@/components/ui/border-beam';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { toast } from '@/hooks/use-toast';
import {
    createFormAction,
    getConnectorsAction,
    updateFormAction,
} from '@/app/actions/builder';
import { getFormsAction } from '@/app/actions/dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inferCollectionFromFieldName } from '@/lib/reference-utils';
import { generateSnippets } from '@/lib/snippet-generator';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type FormField = {
    id: string;
    label: string;
    type: string; // keyof typeof FIELD_TYPES
    required: boolean;
    options?: string;
    isRelationalSource?: boolean;
    reference?: {
        collection: string;
        displayField?: string;
    };
};

/** The set of field types that trigger the reference config panel */
const REFERENCE_TYPES = new Set(['reference']);

type NewFormClientProps = {
    onBack?: () => void;
    initialData?: any; // Form data for editing
};

// Sortable Item Component
function SortableField({
    field,
    updateField,
    removeField,
    isNew,
    availableCollections,
}: {
    field: FormField;
    updateField: (id: string, key: keyof FormField, value: any) => void;
    removeField: (id: string) => void;
    isNew?: boolean;
    availableCollections?: {
        id: string;
        name: string;
        fields?: { name: string; type: string }[];
    }[];
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: field.id });
    const [typeSearch, setTypeSearch] = useState('');

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: isDragging ? ('relative' as const) : ('static' as const),
    };

    const filteredGroups = useMemo(() => {
        const q = typeSearch.toLowerCase();
        if (!q) return getGroupedFieldTypes();
        const result: Record<string, { value: string; label: string }[]> = {};
        Object.entries(getGroupedFieldTypes()).forEach(([cat, items]) => {
            const matched = items.filter(
                (f) =>
                    f.label.toLowerCase().includes(q) ||
                    f.value.toLowerCase().includes(q),
            );
            if (matched.length) result[cat] = matched;
        });
        return result;
    }, [typeSearch]);

    const isReferenceType = REFERENCE_TYPES.has(field.type);

    // When switching TO a reference type, auto-suggest a collection from the label
    const handleTypeChange = (val: string) => {
        updateField(field.id, 'type', val);
        setTypeSearch('');
        if (REFERENCE_TYPES.has(val) && !field.reference?.collection) {
            const suggested = inferCollectionFromFieldName(field.label);
            updateField(field.id, 'reference', {
                collection: suggested,
                displayField: 'name',
            });
        }
        // Clear reference when switching away from reference type
        if (!REFERENCE_TYPES.has(val) && field.reference) {
            updateField(field.id, 'reference', undefined);
        }
    };

    return (
        <div
            id={`field-card-${field.id}`}
            ref={setNodeRef}
            style={style}
            className='relative'
        >
            <div
                className={`relative group rounded-xl border bg-[#121212] transition-all duration-300 ${
                    isDragging
                        ? 'opacity-50 scale-[0.98] ring-1 ring-white/20'
                        : isNew
                          ? 'border-neutral-400/30 bg-[#181818]'
                          : 'hover:border-white/20 border-white/10'
                }`}
            >
                <div className='p-4 flex gap-3 items-start relative z-10'>
                    <div
                        className='mt-2 text-neutral-600 cursor-grab active:cursor-grabbing hover:text-white transition-colors'
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className='h-4 w-4' />
                    </div>

                    <div className='grid gap-3 flex-1'>
                        <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-1'>
                                <Label className='text-[10px] text-neutral-500 uppercase tracking-wider font-medium'>
                                    Label
                                </Label>
                                <Input
                                    value={field.label}
                                    onChange={(e) =>
                                        updateField(
                                            field.id,
                                            'label',
                                            e.target.value,
                                        )
                                    }
                                    className='h-8 text-xs bg-[#0a0a0a] border-white/10 text-white focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:border-white/20'
                                />
                            </div>
                            <div className='space-y-1'>
                                <Label className='text-[10px] text-neutral-500 uppercase tracking-wider font-medium'>
                                    Type
                                    {isReferenceType && (
                                        <span className='ml-1.5 text-[8px] text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-widest'>
                                            relational
                                        </span>
                                    )}
                                </Label>
                                <Select
                                    value={field.type}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger
                                        className='h-8 text-xs border-white/10 text-white bg-[#0a0a0a] focus:ring-1 focus:ring-white/20'
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[340px] p-0'>
                                        {/* Search input */}
                                        <div className='sticky top-0 z-20 bg-[#09090D] border-b border-white/5 px-2 py-1.5'>
                                            <input
                                                autoFocus
                                                placeholder='Search types…'
                                                value={typeSearch}
                                                onChange={(e) =>
                                                    setTypeSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    e.stopPropagation()
                                                }
                                                className='w-full bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-indigo-500/50'
                                            />
                                        </div>
                                        <div className='overflow-y-auto max-h-[260px] bg-[#0a0a0a]'>
                                            {Object.keys(filteredGroups)
                                                .length === 0 ? (
                                                <p className='py-4 text-center text-xs text-neutral-500'>
                                                    No types found
                                                </p>
                                            ) : (
                                                Object.entries(
                                                    filteredGroups,
                                                ).map(([category, ftypes]) => (
                                                    <SelectGroup key={category}>
                                                        <SelectLabel
                                                            className='text-xs font-semibold bg-[#050505] px-2 py-1.5 uppercase tracking-wider sticky top-0 z-10 text-neutral-400'
                                                        >
                                                            {category}
                                                        </SelectLabel>
                                                        {ftypes.map((f) => (
                                                            <SelectItem
                                                                key={f.value}
                                                                value={f.value}
                                                                className='pl-6 text-xs hover:bg-white/5 cursor-pointer focus:bg-white/5'
                                                            >
                                                                {f.label}
                                                                {REFERENCE_TYPES.has(
                                                                    f.value,
                                                                ) && (
                                                                    <span className='ml-2 text-[9px] text-neutral-500'></span>
                                                                )}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                ))
                                            )}
                                        </div>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Enum Options */}
                        {field.type === 'enum' && (
                            <div className='pt-2'>
                                <Label className='text-[10px] text-neutral-400 uppercase tracking-wider'>
                                    Options (Comma-separated)
                                </Label>
                                <Input
                                    value={field.options || ''}
                                    onChange={(e) =>
                                        updateField(
                                            field.id,
                                            'options',
                                            e.target.value,
                                        )
                                    }
                                    placeholder='e.g. user, admin, guest'
                                    className='h-8 text-xs bg-white/5 border-white/10 text-white mt-1'
                                />
                            </div>
                        )}

                        {/* ── Reference Configuration Panel ── */}
                        {isReferenceType && (
                            <div className='pt-1 animate-in fade-in slide-in-from-top-1 duration-200'>
                                <ReferenceFieldConfig
                                    value={field.reference}
                                    onChange={(ref) =>
                                        updateField(field.id, 'reference', ref)
                                    }
                                    collections={availableCollections || []}
                                    compact={false}
                                />
                            </div>
                        )}

                        <div className='flex items-center justify-between border-t border-white/5 pt-2 mt-1'>
                            <div className='flex items-center space-x-6'>
                                <div className='flex items-center space-x-2'>
                                    <Switch
                                        id={`req-${field.id}`}
                                        checked={field.required}
                                        onCheckedChange={(checked) =>
                                            updateField(
                                                field.id,
                                                'required',
                                                checked,
                                            )
                                        }
                                        className='scale-75 origin-left'
                                    />
                                    <Label
                                        htmlFor={`req-${field.id}`}
                                        className='text-xs text-neutral-300 font-normal'
                                    >
                                        Required
                                    </Label>
                                </div>
                                {!isReferenceType && (
                                    <div className='flex items-center space-x-2'>
                                        <Switch
                                            id={`rel-${field.id}`}
                                            checked={
                                                field.isRelationalSource ||
                                                false
                                            }
                                            onCheckedChange={(checked) =>
                                                updateField(
                                                    field.id,
                                                    'isRelationalSource',
                                                    checked,
                                                )
                                            }
                                            className='scale-75 origin-left'
                                        />
                                        <Label
                                            htmlFor={`rel-${field.id}`}
                                            className='text-xs text-neutral-300 font-normal'
                                        >
                                            Make Relational Field
                                        </Label>
                                    </div>
                                )}
                            </div>
                            <div className='flex items-center gap-2'>
                                {isReferenceType &&
                                    field.reference?.collection && (
                                        <span className='text-[9px] text-neutral-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <Link2 className='w-2.5 h-2.5' />→{' '}
                                            {field.reference.collection}
                                        </span>
                                    )}
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='h-6 w-6 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100'
                                    onClick={() => removeField(field.id)}
                                >
                                    <Trash2 className='h-3 w-3' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <Button
            size='icon'
            variant='ghost'
            className='absolute top-2 right-2 h-8 w-8 hover:bg-white/10 text-neutral-400'
            onClick={handleCopy}
        >
            {copied ? (
                <Check className='h-4 w-4 text-green-500' />
            ) : (
                <Clipboard className='h-4 w-4' />
            )}
        </Button>
    );
}

export default function NewFormClient({
    onBack,
    initialData,
}: NewFormClientProps) {
    const [formName, setFormName] = useState(initialData?.name || '');
    const [group, setGroup] = useState(initialData?.group || '');
    const [tempName, setTempName] = useState('');
    const [connector, setConnector] = useState(initialData?.connectorId || '');
    const [targetDb, setTargetDb] = useState(
        initialData?.targetDatabase || 'default',
    );
    const [activeTab, setActiveTab] = useState('build');
    const contentScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab]);
    const [addPulse, setAddPulse] = useState(false);
    const [newFieldId, setNewFieldId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const initialFields = initialData?.fields
        ? initialData.fields.map((f: any, i: number) => ({
              id: i.toString(),
              label: f.name,
              type: f.type,
              required: f.required,
              options: f.options,
              isRelationalSource: f.isRelationalSource,
              reference: f.reference, // preserve existing reference configs
          }))
        : [
              { id: '1', label: 'Full Name', type: 'text', required: true },
              {
                  id: '2',
                  label: 'Email Address',
                  type: 'email',
                  required: true,
              },
              { id: '3', label: 'Message', type: 'textarea', required: false },
          ];

    const [fields, setFields] = useState<FormField[]>(initialFields);
    const [generatedId, setGeneratedId] = useState<string | null>(
        initialData?.id || null,
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setFields((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id,
                );
                const newIndex = items.findIndex(
                    (item) => item.id === over?.id,
                );
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addField = () => {
        const id = Date.now().toString();
        setFields((prev) => [
            ...prev,
            { id, label: 'New Field', type: 'text', required: false },
        ]);
        setNewFieldId(id);
        setAddPulse(true);
        setTimeout(() => setAddPulse(false), 600);
        setTimeout(() => setNewFieldId(null), 1000);
        // Scroll to bottom of the field list after render
        requestAnimationFrame(() => {
            const el = document.getElementById(`field-card-${id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    };
    const removeField = (id: string) =>
        setFields((prev) => prev.filter((f) => f.id !== id));
    const updateField = (id: string, key: keyof FormField, value: any) =>
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
        );

    const [broadcastTargets, setBroadcastTargets] = useState<string[]>(
        initialData?.routing?.broadcast || [],
    );
    const [splits, setSplits] = useState<
        { target: string; fields: string[]; excludeFromMain?: boolean }[]
    >(initialData?.routing?.splits || []);
    const [maskedFields, setMaskedFields] = useState<string[]>(
        initialData?.routing?.transformations?.mask || [],
    );
    const [hashedFields, setHashedFields] = useState<string[]>(
        initialData?.routing?.transformations?.hash || [],
    );

    const [connectors, setConnectors] = useState<any[]>([]);
    const [availableForms, setAvailableForms] = useState<any[]>([]);

    useEffect(() => {
        getConnectorsAction().then((data) => setConnectors(data));
        // Load existing forms as available collections for reference fields
        getFormsAction()
            .then((forms: any[]) => {
                setAvailableForms(
                    forms.map((f: any) => ({
                        id: f.id,
                        name: f.name,
                        fields: (f.fields || []).map((ff: any) => ({
                            name: ff.name,
                            type: ff.type,
                            isRelationalSource: ff.isRelationalSource,
                        })),
                    })),
                );
            })
            .catch(() => {
                // Non-critical — silently fail if forms can't be loaded
            });
    }, []);

    const selectedConnectorData = connectors.find(
        (c: any) => c.id === connector,
    );
    const availableDatabases = selectedConnectorData?.databases
        ? Object.keys(selectedConnectorData.databases)
        : [];

    const toggleBroadcast = (dbName: string) =>
        setBroadcastTargets((prev) =>
            prev.includes(dbName)
                ? prev.filter((t) => t !== dbName)
                : [...prev, dbName],
        );
    const addSplit = () => setSplits([...splits, { target: '', fields: [] }]);
    const updateSplit = (
        index: number,
        key: keyof (typeof splits)[0],
        value: any,
    ) => {
        const newSplits = [...splits];
        // @ts-ignore
        newSplits[index][key] = value;
        setSplits(newSplits);
    };
    const removeSplit = (index: number) =>
        setSplits(splits.filter((_, i) => i !== index));

    const handleSave = async () => {
        if (!formName || !connector) {
            toast({
                title: 'Validation Error',
                description:
                    'Please provide a form name and select a connector.',
                variant: 'destructive',
            });
            setActiveTab('settings');
            return;
        }

        setIsSaving(true);

        const formData = new FormData();
        formData.append('name', formName);
        formData.append('connectorId', connector);
        if (group) formData.append('group', group);
        if (targetDb) formData.append('targetDatabase', targetDb);
        const simplifiedFields = fields.map((f) => ({
            name: f.label,
            type: f.type,
            required: f.required,
            options: f.options,
            isRelationalSource: f.isRelationalSource,
            // Include reference config so it's persisted to the DB
            ...(f.reference?.collection ? { reference: f.reference } : {}),
        }));
        formData.append('fields', JSON.stringify(simplifiedFields));
        formData.append(
            'routing',
            JSON.stringify({
                broadcast: broadcastTargets,
                splits: splits.filter((s) => s.target && s.fields.length > 0),
                transformations: { mask: maskedFields, hash: hashedFields },
            }),
        );

        try {
            let res;
            if (initialData?.id) {
                res = await updateFormAction(initialData.id, formData);
                if (res.error)
                    toast({
                        title: 'Error',
                        description: res.error,
                        variant: 'destructive',
                    });
                else
                    toast({
                        title: 'Form Updated',
                        description: 'Your changes have been deployed.',
                    });
            } else {
                res = await createFormAction(formData);
                if (res.error)
                    toast({
                        title: 'Error',
                        description: res.error,
                        variant: 'destructive',
                    });
                else {
                    setGeneratedId(res.formId || '');
                    toast({
                        title: 'Form Deployed',
                        description:
                            'Matrix connection established. Proceeding to Embed.',
                    });
                    setActiveTab('embed');
                }
            }
        } catch (e) {
            toast({
                title: 'Error',
                description: 'Failed to deploy form.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormName('');
        setGroup('');
        setTempName('');
        setFields([
            {
                id: Date.now().toString(),
                label: 'New Field',
                type: 'text',
                required: false,
            },
        ]);
        setConnector('');
        setTargetDb('');
        setBroadcastTargets([]);
        setSplits([]);
        setMaskedFields([]);
        setHashedFields([]);
        setGeneratedId(null);
        setActiveTab('build');
        toast({ description: 'Form workspace has been reset.' });
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    const embedUrl = `${appUrl}/api/public/submit/${generatedId || 'YOUR_FORM_ID'}`;

    const hasImageFields = fields.some(
        (f) => f.type === 'image' || f.type === 'image_array',
    );
    const connectorUrl =
        connectors.find((c: any) => c.id === connector)?.url ||
        'http://localhost:3002';

    const { html: embedCodeHTML, react: embedCodeReact } = generateSnippets(
        generatedId || 'YOUR_FORM_ID',
        formName,
        fields,
        appUrl,
        connectorUrl,
    );

    // Professional Form Preview Render
    const renderLivePreview = () => (
        <div className='relative w-full max-w-sm mx-auto rounded-xl border border-white/10 bg-[#121212] shadow-sm flex flex-col animate-in zoom-in-95 duration-500'>
            <div className='p-6 flex-1 flex flex-col w-full'>
                <div className='w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-5'>
                    <Logo className='w-5 h-5 text-white' />
                </div>

                <h3 className='text-xl font-medium text-white mb-1'>
                    {formName || 'Untitled Form'}
                </h3>
                <p className='text-xs text-neutral-400 mb-6'>
                    Please fill out this form to continue.
                </p>

                <div className='space-y-4 flex-1 w-full'>
                    {fields.map((f, i) => {
                        const conf = FIELD_TYPES[f.type] || FIELD_TYPES.text;
                        return (
                            <div
                                key={`preview-${f.id}`}
                                className='space-y-1.5'
                            >
                                <label className='text-[11px] font-medium text-neutral-300 ml-0.5 tracking-wide'>
                                    {f.label}{' '}
                                    {f.required && (
                                        <span className='text-neutral-500'>*</span>
                                    )}
                                </label>
                                {conf.component === 'TextareaInput' ||
                                conf.component === 'JsonEditor' ? (
                                    <textarea
                                        className='w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-white/20 transition-all outline-none resize-none h-20'
                                        placeholder={
                                            conf.component === 'JsonEditor'
                                                ? '{ ... }'
                                                : `Enter ${f.label.toLowerCase()}...`
                                        }
                                        disabled
                                    />
                                ) : conf.category === 'Media' ? (
                                    <div className='flex items-center justify-center gap-2 bg-[#0a0a0a] border border-dashed border-white/20 rounded-lg px-4 py-4'>
                                        <span className='text-sm text-neutral-500'>
                                            Upload file
                                        </span>
                                    </div>
                                ) : conf.category === 'Boolean' ? (
                                    <div className='flex items-center gap-2 mt-2'>
                                        <input
                                            type='checkbox'
                                            disabled
                                            className='w-3.5 h-3.5 rounded border-white/20 bg-[#0a0a0a]'
                                        />
                                        <span className='text-xs text-neutral-400'>
                                            Checkbox
                                        </span>
                                    </div>
                                ) : conf.category === 'Selection' ? (
                                    <select
                                        className='w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none'
                                        disabled
                                    >
                                        <option>
                                            Select{' '}
                                            {String(f.options || '').split(',')[0] ||
                                                'option'}
                                            ...
                                        </option>
                                    </select>
                                ) : conf.category === 'Reference' ? (
                                    <div className='w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2'>
                                        <Link2 className='w-3.5 h-3.5 text-neutral-500 shrink-0' />
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-xs text-neutral-400 truncate'>
                                                {f.reference?.collection ? (
                                                    <span className='text-neutral-300'>
                                                        {f.reference.collection}
                                                    </span>
                                                ) : (
                                                    <span className='text-neutral-600 italic'>
                                                        Select...
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type={
                                            conf.category === 'Numeric'
                                                ? 'number'
                                                : f.type === 'email'
                                                  ? 'email'
                                                  : conf.category === 'Temporal'
                                                    ? 'datetime-local'
                                                    : 'text'
                                        }
                                        step={
                                            f.type === 'decimal'
                                                ? 'any'
                                                : f.type === 'number'
                                                  ? '1'
                                                  : undefined
                                        }
                                        className='w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-white/20 transition-all outline-none'
                                        placeholder={
                                            conf.category === 'Structured'
                                                ? 'item1, item2, item3'
                                                : `Enter ${f.label.toLowerCase()}...`
                                        }
                                        disabled
                                    />
                                )}
                            </div>
                        );
                    })}
                    {fields.length === 0 && (
                        <div className='text-center py-8 opacity-50 text-neutral-500 text-xs border border-dashed border-white/10 rounded-lg bg-[#0a0a0a] w-full'>
                            No fields configured
                        </div>
                    )}
                </div>

                <div className='pt-6 mt-4 w-full'>
                    <button
                        disabled
                        className='w-full bg-white text-black font-medium text-sm py-2.5 rounded-lg transition-opacity hover:opacity-90'
                    >
                        Submit
                    </button>
                    <div className='text-center mt-3'>
                        <span className='text-[10px] text-neutral-500 flex items-center justify-center gap-1'>
                            <Lock className='w-2.5 h-2.5' /> Secure Form
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className='fixed inset-0 pt-[65px] z-[40] bg-[#050505]'>
            {/* The App Layout */}
            <div className='flex flex-col w-full h-full relative overflow-hidden'>
                {/* Top App Bar */}
                <header className='h-14 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-4 lg:px-6 relative z-20'>
                    <div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
                        {onBack ? (
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={onBack}
                                className='text-neutral-400 hover:text-white rounded-md bg-transparent hover:bg-white/5 h-8 w-8 shrink-0'
                            >
                                <ArrowLeft className='h-4 w-4' />
                            </Button>
                        ) : (
                            <Link href='/dashboard/forms' className="shrink-0">
                                <Button
                                    variant='ghost'
                                    size='icon'
                                    className='text-neutral-400 hover:text-white rounded-md bg-transparent hover:bg-white/5 h-8 w-8'
                                >
                                    <ArrowLeft className='h-4 w-4' />
                                </Button>
                            </Link>
                        )}
                        <div className='h-4 w-px bg-white/10 mx-0 sm:mx-1 shrink-0' />
                        <Input
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className='bg-transparent border-transparent hover:border-white/10 focus:border-white/20 focus-visible:ring-0 text-sm font-medium text-white px-1 sm:px-2 w-full max-w-[300px] min-w-[80px] transition-all h-8 rounded-md'
                            placeholder='Untitled Form'
                        />
                    </div>

                    <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
                        {generatedId && (
                            <div className='hidden md:flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 mr-2'>
                                <div className='w-1.5 h-1.5 rounded-full bg-neutral-400' />
                                Deployed
                            </div>
                        )}
                        <Button
                            variant='ghost'
                            className='text-neutral-400 hover:text-white xl:hidden bg-transparent hover:bg-white/5 h-8 px-2 sm:px-3 text-xs'
                            onClick={() =>
                                setActiveTab(
                                    activeTab === 'preview'
                                        ? 'build'
                                        : 'preview',
                                )
                            }
                        >
                            {activeTab === 'preview'
                                ? 'Builder'
                                : 'Preview'}
                        </Button>
                        <Button
                            variant='ghost'
                            className='h-8 px-2 sm:px-3 text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all mr-1 sm:mr-2 rounded-md'
                            onClick={handleReset}
                        >
                            <RotateCcw className='w-3 h-3 sm:mr-1.5' /> <span className="hidden sm:inline">Reset</span>
                        </Button>
                        <Button
                            onClick={handleSave}
                            className='h-8 px-3 sm:px-4 text-xs bg-white text-black hover:bg-neutral-200 rounded-md shadow-sm'
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <div className='scale-75 -mx-2 flex items-center justify-center'>
                                    <Loader />
                                </div>
                            ) : (
                                <>
                                    <Save className='w-3 h-3 sm:mr-1.5' />
                                    <span className="hidden sm:inline">{initialData ? 'Update' : 'Deploy'}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </header>

                {/* Workspace area */}
                <div className='flex-1 flex flex-col overflow-hidden relative w-full bg-[#0a0a0a]'>
                    {/* Step Navigation */}
                    <div className='w-full px-5 lg:px-8 py-5 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md z-20 flex justify-center'>
                        <div className='flex items-center gap-0 w-full max-w-2xl'>
                                {/* Step 1 */}
                                <button
                                    onClick={() => setActiveTab('build')}
                                    className='flex items-center gap-2.5 group'
                                >
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-semibold shrink-0 transition-all ${
                                        activeTab === 'build'
                                            ? 'bg-white text-black border-white'
                                            : activeTab === 'settings' || activeTab === 'embed'
                                              ? 'bg-neutral-700 border-neutral-700 text-white'
                                              : 'border-white/20 text-neutral-500'
                                    }`}>
                                        {activeTab === 'settings' || activeTab === 'embed' ? <Check className='w-3 h-3' /> : '1'}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${
                                        activeTab === 'build' ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                                    }`}>Schema</span>
                                </button>

                                {/* Connector */}
                                <div className='flex-1 mx-3 h-px bg-white/10 relative'>
                                    <div className={`absolute inset-y-0 left-0 bg-white/40 transition-all duration-500 ${
                                        activeTab === 'settings' || activeTab === 'embed' ? 'w-full' : 'w-0'
                                    }`} />
                                </div>

                                {/* Step 2 */}
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className='flex items-center gap-2.5 group'
                                >
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-semibold shrink-0 transition-all ${
                                        activeTab === 'settings'
                                            ? 'bg-white text-black border-white'
                                            : activeTab === 'embed'
                                              ? 'bg-neutral-700 border-neutral-700 text-white'
                                              : 'border-white/20 text-neutral-500'
                                    }`}>
                                        {activeTab === 'embed' ? <Check className='w-3 h-3' /> : '2'}
                                    </div>
                                    <span className={`text-xs font-medium transition-colors ${
                                        activeTab === 'settings' ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                                    }`}>Settings</span>
                                </button>

                                {/* Connector */}
                                <div className='flex-1 mx-3 h-px bg-white/10 relative'>
                                    <div className={`absolute inset-y-0 left-0 bg-white/40 transition-all duration-500 ${
                                        activeTab === 'embed' ? 'w-full' : 'w-0'
                                    }`} />
                                </div>

                                {/* Step 3 */}
                                <button
                                    onClick={() => setActiveTab('embed')}
                                    className='flex items-center gap-2.5 group'
                                >
                                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-semibold shrink-0 transition-all ${
                                        activeTab === 'embed'
                                            ? 'bg-white text-black border-white'
                                            : 'border-white/20 text-neutral-500'
                                    }`}>3</div>
                                    <span className={`text-xs font-medium transition-colors ${
                                        activeTab === 'embed' ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'
                                    }`}>Integration</span>
                                </button>
                            </div>
                        </div>

                    {/* Panels Container */}
                    <div className='flex-1 flex overflow-hidden relative w-full'>
                        {/* Left Panel: Controls */}
                        <div
                            className={`w-full xl:w-[55%] 2xl:w-[60%] shrink-0 flex flex-col transition-transform duration-300 ${activeTab === 'preview' ? '-translate-x-full xl:translate-x-0 absolute xl:relative h-full z-10' : ''}`}
                        >
                            {/* Control Content */}
                            <div ref={contentScrollRef} className='flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full'>
                                <div className='p-5 pb-24 lg:pb-6 max-w-3xl mx-auto w-full'>
                                {/* BUILD TAB */}
                                {activeTab === 'build' && (
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between mb-4'>
                                            <div>
                                                <h2 className='text-sm font-semibold text-white'>
                                                    Schema Definition
                                                </h2>
                                                <p className='text-[11px] text-neutral-400 mt-0.5'>
                                                    Configure the structure of
                                                    your data payload.
                                                </p>
                                            </div>
                                            <Button
                                                size='icon'
                                                variant='outline'
                                                onClick={addField}
                                                className={`h-9 w-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white shadow-lg transition-all duration-300 ${
                                                    addPulse
                                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 scale-95'
                                                        : 'hover:scale-110 hover:border-primary/50'
                                                }`}
                                            >
                                                {addPulse ? (
                                                    <Check className='h-4 w-4 text-emerald-400' />
                                                ) : (
                                                    <Plus className='h-5 w-5' />
                                                )}
                                            </Button>
                                        </div>

                                        {/* Cloudinary notice — shown when any image field exists */}
                                        {hasImageFields && (
                                            <div className='flex gap-3 items-start rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 animate-in fade-in slide-in-from-top-2'>
                                                <AlertCircle className='h-4 w-4 text-amber-400 mt-0.5 shrink-0' />
                                                <div className='space-y-1'>
                                                    <p className='text-xs font-semibold text-amber-300'>
                                                        Image Upload requires
                                                        Cloudinary
                                                    </p>
                                                    <p className='text-[11px] text-amber-300/70 leading-relaxed'>
                                                        Your connector must have
                                                        these env vars set for
                                                        image uploads to work:
                                                    </p>
                                                    <pre className='mt-1.5 text-[10px] font-mono text-amber-200/60 bg-black/30 rounded-lg px-3 py-2 leading-relaxed'>
                                                        {`CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://...`}
                                                    </pre>
                                                    <p className='text-[10px] text-amber-300/50 pt-1'>
                                                        Add these in your Vercel
                                                        / cloud dashboard →
                                                        Environment Variables,
                                                        then redeploy your
                                                        connector.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={fields.map((f) => f.id)}
                                                strategy={
                                                    verticalListSortingStrategy
                                                }
                                            >
                                                <div className='space-y-2'>
                                                    {fields.map((field) => (
                                                        <SortableField
                                                            key={field.id}
                                                            field={field}
                                                            updateField={
                                                                updateField
                                                            }
                                                            removeField={
                                                                removeField
                                                            }
                                                            isNew={
                                                                field.id ===
                                                                newFieldId
                                                            }
                                                            availableCollections={
                                                                availableForms
                                                            }
                                                        />
                                                    ))}
                                                    {fields.length === 0 && (
                                                        <div className='text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5'>
                                                            <Layers className='w-8 h-8 mx-auto text-neutral-500 mb-3' />
                                                            <p className='text-sm text-neutral-400'>
                                                                Schema is empty
                                                            </p>
                                                            <Button
                                                                variant='link'
                                                                onClick={
                                                                    addField
                                                                }
                                                                className='text-primary h-auto p-0 mt-2'
                                                            >
                                                                Add your first
                                                                field
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                        <div className='pt-6'>
                                            <Button
                                                onClick={addField}
                                                variant='outline'
                                                className='w-full h-10 border-dashed border-white/20 bg-transparent hover:bg-white/5 hover:border-white/30 text-neutral-400 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2'
                                            >
                                                <Plus className='w-4 h-4' />
                                                <span className='text-xs font-medium'>Add Field</span>
                                            </Button>
                                        </div>
                                        {/* Step footer */}
                                        <div className='pt-8 flex justify-end'>
                                            <Button
                                                onClick={() => setActiveTab('settings')}
                                                className='h-10 px-6 text-xs bg-white text-black hover:bg-neutral-200 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-white/5'
                                            >
                                                Continue to Settings
                                                <ArrowRight className='w-4 h-4' />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* SETTINGS TAB */}
                                {activeTab === 'settings' && (
                                    <div className='space-y-6 animate-in fade-in slide-in-from-right-2 duration-300'>
                                        <div className='space-y-6'>
                                            <div>
                                                <h2 className='text-sm font-medium text-white flex items-center gap-2'>
                                                    <Database className='w-4 h-4 text-neutral-400' />{' '}
                                                    Core Integration
                                                </h2>
                                                <p className='text-xs text-neutral-400 mt-1'>
                                                    Select the backend matrix
                                                    for this form.
                                                </p>
                                            </div>
                                            <div className='space-y-4 bg-[#121212] p-5 rounded-xl border border-white/10'>
                                                 <div className='space-y-2'>
                                                     <Label className='text-xs text-neutral-400 font-medium'>
                                                         Form Group (Optional)
                                                     </Label>
                                                     <div className='relative'>
                                                         <Folders className='absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500' />
                                                         <Input
                                                             value={group}
                                                             onChange={(e) =>
                                                                 setGroup(
                                                                     e.target
                                                                         .value,
                                                                 )
                                                             }
                                                             placeholder='e.g. Support, Auth, Onboarding...'
                                                             className='h-9 pl-9 bg-[#0a0a0a] border-white/10 text-xs text-white placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-white/20'
                                                         />
                                                     </div>
                                                     <p className='text-[10px] text-neutral-500'>
                                                         Group similar forms
                                                         together in your
                                                         dashboard.
                                                     </p>
                                                 </div>
                                                 <div className='space-y-2'>
                                                     <Label className='text-xs text-neutral-400 font-medium'>
                                                         Target Connector
                                                     </Label>
                                                     <Select
                                                         value={connector}
                                                         onValueChange={
                                                             setConnector
                                                         }
                                                     >
                                                        <SelectTrigger className='bg-[#0a0a0a] border-white/10 text-white h-9 focus:ring-1 focus:ring-white/20'>
                                                            <SelectValue placeholder='Choose target connector...' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {connectors.map(
                                                                (c: any) => (
                                                                    <SelectItem
                                                                        key={
                                                                            c.id
                                                                        }
                                                                        value={
                                                                            c.id
                                                                        }
                                                                    >
                                                                        {c.name}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className='space-y-2'>
                                                    <Label className='text-xs text-neutral-400 font-medium'>
                                                        Target Database
                                                    </Label>
                                                    <Select
                                                        value={targetDb}
                                                        onValueChange={
                                                            setTargetDb
                                                        }
                                                    >
                                                        <SelectTrigger className='bg-[#0a0a0a] border-white/10 text-white h-9 focus:ring-1 focus:ring-white/20'>
                                                            <SelectValue placeholder='Select primary database...' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='default'>
                                                                Default Node
                                                            </SelectItem>
                                                            {availableDatabases.map(
                                                                (
                                                                    key: string,
                                                                ) => (
                                                                    <SelectItem
                                                                        key={
                                                                            key
                                                                        }
                                                                        value={
                                                                            key
                                                                        }
                                                                    >
                                                                        {key}
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {connector &&
                                            availableDatabases.length > 0 && (
                                                <div className='space-y-6 pt-6 border-t border-white/10'>
                                                    <div>
                                                        <h2 className='text-sm font-medium text-white flex items-center gap-2'>
                                                            <Send className='w-4 h-4 text-neutral-400' />{' '}
                                                            Advanced Routing
                                                        </h2>
                                                        <p className='text-xs text-neutral-400 mt-1'>
                                                            Distribute subsets
                                                            of data across
                                                            systems.
                                                        </p>
                                                    </div>

                                                    <div className='space-y-4'>
                                                        {/* Broadcast */}
                                                        <div className='space-y-3'>
                                                            <Label className='text-xs font-medium text-neutral-400'>
                                                                Multi-Node
                                                                Broadcast
                                                            </Label>
                                                            <div className='grid grid-cols-1 gap-2'>
                                                                {availableDatabases
                                                                    .filter(
                                                                        (db) =>
                                                                            db !==
                                                                            targetDb,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            db,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    db
                                                                                }
                                                                                className='flex items-center space-x-3 border border-white/10 bg-[#121212] p-3 rounded-xl'
                                                                            >
                                                                                <Switch
                                                                                    id={`broadcast-${db}`}
                                                                                    checked={broadcastTargets.includes(
                                                                                        db,
                                                                                    )}
                                                                                    onCheckedChange={() =>
                                                                                        toggleBroadcast(
                                                                                            db,
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <Label
                                                                                    htmlFor={`broadcast-${db}`}
                                                                                    className='text-xs text-neutral-300'
                                                                                >
                                                                                    Mirror
                                                                                    to{' '}
                                                                                    <span className='font-mono text-white'>
                                                                                        {
                                                                                            db
                                                                                        }
                                                                                    </span>
                                                                                </Label>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                            </div>
                                                        </div>

                                                        {/* Breakpoints */}
                                                        <div className='space-y-3 pt-4 border-t border-white/10'>
                                                            <div className='flex items-center justify-between'>
                                                                <Label className='text-xs font-medium text-neutral-400'>
                                                                    Field
                                                                    Breakpoints
                                                                </Label>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={
                                                                        addSplit
                                                                    }
                                                                    className='h-7 text-xs px-2.5 bg-white/5 hover:bg-white/10 rounded-md text-white'
                                                                >
                                                                    <Plus className='h-3 w-3 mr-1.5' />{' '}
                                                                    Add Rule
                                                                </Button>
                                                            </div>
                                                            <div className='space-y-3'>
                                                                {splits.map(
                                                                    (
                                                                        split,
                                                                        idx,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className='p-4 border border-white/10 bg-[#121212] rounded-xl space-y-4 relative group'
                                                                        >
                                                                            <Button
                                                                                variant='ghost'
                                                                                size='icon'
                                                                                className='h-6 w-6 absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-white bg-transparent hover:bg-white/10'
                                                                                onClick={() =>
                                                                                    removeSplit(
                                                                                        idx,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Trash2 className='h-3.5 w-3.5' />
                                                                            </Button>
                                                                            <div className='grid grid-cols-1 gap-4 pr-8'>
                                                                                <div className='space-y-1.5'>
                                                                                    <Label className='text-[10px] text-neutral-500 uppercase tracking-wider font-medium'>
                                                                                        Target
                                                                                        DB
                                                                                    </Label>
                                                                                    <Select
                                                                                        value={
                                                                                            split.target
                                                                                        }
                                                                                        onValueChange={(
                                                                                            val,
                                                                                        ) =>
                                                                                            updateSplit(
                                                                                                idx,
                                                                                                'target',
                                                                                                val,
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <SelectTrigger className='h-8 text-xs bg-[#0a0a0a] border-white/10 text-white focus:ring-1 focus:ring-white/20'>
                                                                                            <SelectValue />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                            {availableDatabases.map(
                                                                                                (
                                                                                                    db,
                                                                                                ) => (
                                                                                                    <SelectItem
                                                                                                        key={
                                                                                                            db
                                                                                                        }
                                                                                                        value={
                                                                                                            db
                                                                                                        }
                                                                                                    >
                                                                                                        {
                                                                                                            db
                                                                                                        }
                                                                                                    </SelectItem>
                                                                                                ),
                                                                                            )}
                                                                                        </SelectContent>
                                                                                    </Select>
                                                                                </div>
                                                                                <div className='space-y-1.5'>
                                                                                    <Label className='text-[10px] text-neutral-500 uppercase tracking-wider font-medium'>
                                                                                        Fields
                                                                                        (Click
                                                                                        to
                                                                                        toggle)
                                                                                    </Label>
                                                                                    <div className='flex flex-wrap gap-1.5'>
                                                                                        {fields.map(
                                                                                            (
                                                                                                f,
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        f.id
                                                                                                    }
                                                                                                    onClick={() =>
                                                                                                        updateSplit(
                                                                                                            idx,
                                                                                                            'fields',
                                                                                                            split.fields.includes(
                                                                                                                f.label,
                                                                                                            )
                                                                                                                ? split.fields.filter(
                                                                                                                      (
                                                                                                                          n,
                                                                                                                      ) =>
                                                                                                                          n !==
                                                                                                                          f.label,
                                                                                                                  )
                                                                                                                : [
                                                                                                                      ...split.fields,
                                                                                                                      f.label,
                                                                                                                  ],
                                                                                                        )
                                                                                                    }
                                                                                                    className={`cursor-pointer text-[10px] px-2.5 py-1 rounded-md border transition-all ${split.fields.includes(f.label) ? 'bg-white text-black border-white font-medium' : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'}`}
                                                                                                >
                                                                                                    {
                                                                                                        f.label
                                                                                                    }
                                                                                                </div>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className='flex items-center space-x-2 pt-3 border-t border-white/10'>
                                                                                <Switch
                                                                                    className='scale-75 origin-left'
                                                                                    checked={
                                                                                        split.excludeFromMain ||
                                                                                        false
                                                                                    }
                                                                                    onCheckedChange={(
                                                                                        checked,
                                                                                    ) =>
                                                                                        updateSplit(
                                                                                            idx,
                                                                                            'excludeFromMain',
                                                                                            checked,
                                                                                        )
                                                                                    }
                                                                                />
                                                                                <Label className='text-xs text-neutral-400'>
                                                                                    Exclude
                                                                                    from
                                                                                    Main
                                                                                    Database
                                                                                </Label>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        {connector &&
                                            availableDatabases.length > 0 && (
                                                <div className='space-y-6 pt-6 border-t border-white/10'>
                                                    <div>
                                                        <h2 className='text-sm font-medium text-white flex items-center gap-2'>
                                                            <Shield className='w-4 h-4 text-neutral-400' />{' '}
                                                            Security
                                                            Transformations
                                                        </h2>
                                                        <p className='text-xs text-neutral-400 mt-1'>
                                                            Apply cryptographic
                                                            overlays to
                                                            sensitive fields.
                                                        </p>
                                                    </div>
                                                    <div className='grid grid-cols-1 gap-4'>
                                                        <div className='space-y-2 p-4 border border-white/10 bg-[#121212] rounded-xl'>
                                                            <Label className='text-[10px] font-medium text-neutral-400 uppercase tracking-wider'>
                                                                Masking (****)
                                                            </Label>
                                                            <div className='flex flex-wrap gap-1.5 min-h-[40px]'>
                                                                {fields.map(
                                                                    (f) => (
                                                                        <div
                                                                            key={`mask-${f.id}`}
                                                                            onClick={() =>
                                                                                setMaskedFields(
                                                                                    (
                                                                                        prev,
                                                                                    ) =>
                                                                                        prev.includes(
                                                                                            f.label,
                                                                                        )
                                                                                            ? prev.filter(
                                                                                                  (
                                                                                                      n,
                                                                                                  ) =>
                                                                                                      n !==
                                                                                                      f.label,
                                                                                              )
                                                                                            : [
                                                                                                  ...prev,
                                                                                                  f.label,
                                                                                              ],
                                                                                )
                                                                            }
                                                                            className={`cursor-pointer text-[10px] px-2.5 py-1 rounded-md border transition-all ${maskedFields.includes(f.label) ? 'bg-white text-black border-white font-medium' : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'}`}
                                                                        >
                                                                            {
                                                                                f.label
                                                                            }
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='space-y-2 p-4 border border-white/10 bg-[#121212] rounded-xl'>
                                                            <Label className='text-[10px] font-medium text-neutral-400 uppercase tracking-wider'>
                                                                Hashing (SHA256)
                                                            </Label>
                                                            <div className='flex flex-wrap gap-1.5 min-h-[40px]'>
                                                                {fields.map(
                                                                    (f) => (
                                                                        <div
                                                                            key={`hash-${f.id}`}
                                                                            onClick={() =>
                                                                                setHashedFields(
                                                                                    (
                                                                                        prev,
                                                                                    ) =>
                                                                                        prev.includes(
                                                                                            f.label,
                                                                                        )
                                                                                            ? prev.filter(
                                                                                                  (
                                                                                                      n,
                                                                                                  ) =>
                                                                                                      n !==
                                                                                                      f.label,
                                                                                              )
                                                                                            : [
                                                                                                  ...prev,
                                                                                                  f.label,
                                                                                              ],
                                                                                )
                                                                            }
                                                                            className={`cursor-pointer text-[10px] px-2.5 py-1 rounded-md border transition-all ${hashedFields.includes(f.label) ? 'bg-white text-black border-white font-medium' : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10'}`}
                                                                        >
                                                                            {
                                                                                f.label
                                                                            }
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        {/* Step footer */}
                                        <div className='pt-8 flex items-center justify-between'>
                                            <Button
                                                variant='ghost'
                                                onClick={() => setActiveTab('build')}
                                                className='h-10 px-5 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2'
                                            >
                                                <ArrowLeft className='w-4 h-4' />
                                                Back to Schema
                                            </Button>
                                            <Button
                                                onClick={() => setActiveTab('embed')}
                                                className='h-10 px-6 text-xs bg-white text-black hover:bg-neutral-200 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-white/5'
                                            >
                                                Continue to Integration
                                                <ArrowRight className='w-4 h-4' />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* EMBED TAB */}
                                {activeTab === 'embed' && (
                                    <div className='space-y-6 animate-in fade-in slide-in-from-left-2 duration-300 flex flex-col'>
                                        <div>
                                            <h2 className='text-sm font-medium text-white flex items-center gap-2'>
                                                <Code className='w-4 h-4 text-neutral-400' />{' '}
                                                Integration Code
                                            </h2>
                                            <p className='text-xs text-neutral-400 mt-1'>
                                                Copy the snippet below and add
                                                it to your app.
                                            </p>
                                        </div>

                                        {!generatedId ? (
                                            <div className='flex-1 min-h-[300px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-[#121212] text-center p-8'>
                                                <AlertCircle className='h-8 w-8 text-neutral-500 mb-4' />
                                                <p className='text-sm font-medium text-white mb-2'>
                                                    Form not deployed yet
                                                </p>
                                                <p className='text-xs text-neutral-400 max-w-xs mb-6'>
                                                    You need to deploy the form
                                                    to the network before
                                                    connection codes become
                                                    available.
                                                </p>
                                                <Button
                                                    onClick={handleSave}
                                                    className='h-9 px-6 text-sm bg-white text-black hover:bg-neutral-200 rounded-md'
                                                >
                                                    Deploy Now
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className='space-y-4'>
                                                <div className='p-4 border border-white/10 bg-[#121212] rounded-xl'>
                                                    <Label className='text-[10px] text-neutral-400 uppercase tracking-wider font-medium'>
                                                        Endpoint
                                                    </Label>
                                                    <div className='flex items-center mt-2'>
                                                        <input
                                                            readOnly
                                                            value={embedUrl}
                                                            className='flex-1 bg-[#0a0a0a] border border-white/10 rounded-md px-3 h-8 text-xs text-white outline-none mr-2 focus:border-white/20'
                                                        />
                                                        <Button
                                                            size='icon'
                                                            variant='ghost'
                                                            className='h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-md'
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    embedUrl,
                                                                );
                                                                toast({
                                                                    description:
                                                                        'Endpoint copied',
                                                                });
                                                            }}
                                                        >
                                                            <Clipboard className='h-3.5 w-3.5' />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className='relative group border border-white/10 rounded-xl overflow-hidden bg-[#121212]'>
                                                    <Tabs
                                                        defaultValue='react'
                                                        className='w-full'
                                                    >
                                                        <TabsList className='w-full flex bg-[#0a0a0a] border-b border-white/10 p-0 h-auto rounded-none justify-start'>
                                                            <TabsTrigger
                                                                value='react'
                                                                className='text-xs rounded-none py-2.5 px-5 data-[state=active]:bg-[#121212] data-[state=active]:text-white data-[state=active]:border-b data-[state=active]:border-white'
                                                            >
                                                                React / Next.js
                                                            </TabsTrigger>
                                                            <TabsTrigger
                                                                value='html'
                                                                className='text-xs rounded-none py-2.5 px-5 data-[state=active]:bg-[#121212] data-[state=active]:text-white data-[state=active]:border-b data-[state=active]:border-white'
                                                            >
                                                                HTML snippet
                                                            </TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent
                                                            value='react'
                                                            className='mt-0 relative'
                                                        >
                                                            <Button
                                                                size='sm'
                                                                variant='ghost'
                                                                className='absolute top-3 right-3 h-7 px-3 text-[10px] text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/5'
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(
                                                                        embedCodeReact,
                                                                    );
                                                                    toast({
                                                                        description:
                                                                            'React code copied',
                                                                    });
                                                                }}
                                                            >
                                                                <Clipboard className='h-3 w-3 mr-1.5' />{' '}
                                                                Copy
                                                            </Button>
                                                            <pre className='p-5 pt-12 text-xs text-neutral-300 font-mono overflow-auto max-h-[400px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full'>
                                                                <code>
                                                                    {
                                                                        embedCodeReact
                                                                    }
                                                                </code>
                                                            </pre>
                                                        </TabsContent>

                                                        <TabsContent
                                                            value='html'
                                                            className='mt-0 relative'
                                                        >
                                                            <Button
                                                                size='sm'
                                                                variant='ghost'
                                                                className='absolute top-3 right-3 h-7 px-3 text-[10px] text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/5'
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(
                                                                        embedCodeHTML,
                                                                    );
                                                                    toast({
                                                                        description:
                                                                            'HTML copied',
                                                                    });
                                                                }}
                                                            >
                                                                <Clipboard className='h-3 w-3 mr-1.5' />{' '}
                                                                Copy
                                                            </Button>
                                                            <pre className='p-5 pt-12 text-xs text-neutral-300 font-mono overflow-auto max-h-[400px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full'>
                                                                <code>
                                                                    {
                                                                        embedCodeHTML
                                                                    }
                                                                </code>
                                                            </pre>
                                                        </TabsContent>
                                                    </Tabs>
                                                </div>
                                            </div>
                                        )}
                                        {/* Step footer */}
                                        <div className='pt-8 flex items-center justify-between'>
                                            <Button
                                                variant='ghost'
                                                onClick={() => setActiveTab('settings')}
                                                className='h-10 px-5 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2'
                                            >
                                                <ArrowLeft className='w-4 h-4' />
                                                Back to Settings
                                            </Button>
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className='h-10 px-6 text-xs bg-white text-black hover:bg-neutral-200 rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-white/5'
                                            >
                                                {isSaving ? 'Deploying…' : <><Save className='w-4 h-4 mr-1.5' />{initialData ? 'Update' : 'Deploy'}</>}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>

                        {/* Right Panel: Live Preview Canvas */}
                        <div
                            className={`absolute xl:relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full flex justify-center p-4 md:p-6 transition-all duration-300 h-full w-full ${activeTab === 'preview' ? 'z-20' : 'opacity-0 xl:opacity-100 -z-10 xl:z-0'}`}
                        >
                            <div className='w-full flex justify-center items-start animate-in zoom-in-95 xl:zoom-in-100 duration-500'>
                                {renderLivePreview()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
