import { useId, useState, type ReactNode } from 'react';
import { uploadFile, type UploadKind } from './api';

type Obj = Record<string, unknown>;

export type Field =
    | { kind: 'text'; key: string; label: string; hint?: string; multiline?: boolean; optional?: boolean }
    | { kind: 'number'; key: string; label: string; hint?: string; optional?: boolean }
    | { kind: 'toggle'; key: string; label: string; hint?: string }
    | { kind: 'file'; key: string; label: string; upload: UploadKind; hint?: string }
    | { kind: 'tags'; key: string; label: string; hint?: string }
    | { kind: 'strings'; key: string; label: string; itemLabel: string; multiline?: boolean; hint?: string }
    | { kind: 'group'; key: string; label: string; fields: Field[]; optional?: boolean }
    | {
          kind: 'list';
          key: string;
          label: string;
          itemLabel: string;
          itemTitle: (item: Obj) => string;
          fields: Field[];
          newItem: () => Obj;
      };

export const MARKUP_HINT = 'Wrap words in **double stars** for bold or ==double equals== for the accent colour.';

/** Field errors keyed by dotted path, e.g. "projects.2.name" */
export type Errors = Record<string, string>;

const inputClass =
    'w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-error';
const smallButton =
    'inline-flex items-center justify-center h-8 min-w-8 px-2 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:pointer-events-none transition-colors';

function Icon({ name }: { name: string }) {
    return (
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {name}
        </span>
    );
}

function FieldShell({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {label}
            </label>
            {children}
            {hint && !error && <p className="text-xs text-on-surface-variant/70">{hint}</p>}
            {error && (
                <p className="text-xs text-error font-semibold" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

function hasErrorUnder(errors: Errors, path: string) {
    return Object.keys(errors).some((p) => p === path || p.startsWith(`${path}.`));
}

function move<T>(items: T[], from: number, to: number): T[] {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

function ReorderButtons({ index, count, onMove, onRemove, itemLabel }: {
    index: number;
    count: number;
    onMove: (to: number) => void;
    onRemove: () => void;
    itemLabel: string;
}) {
    return (
        <div className="flex items-center shrink-0">
            <button type="button" className={smallButton} onClick={() => onMove(index - 1)} disabled={index === 0} aria-label={`Move ${itemLabel} up`}>
                <Icon name="arrow_upward" />
            </button>
            <button type="button" className={smallButton} onClick={() => onMove(index + 1)} disabled={index === count - 1} aria-label={`Move ${itemLabel} down`}>
                <Icon name="arrow_downward" />
            </button>
            <button type="button" className={`${smallButton} hover:!text-error hover:!bg-error/10`} onClick={onRemove} aria-label={`Remove ${itemLabel}`}>
                <Icon name="delete" />
            </button>
        </div>
    );
}

function TextField({ field, value, onChange, error }: { field: Extract<Field, { kind: 'text' }>; value: unknown; onChange: (v: unknown) => void; error?: string }) {
    const id = useId();
    const props = {
        id,
        value: typeof value === 'string' ? value : '',
        'aria-invalid': Boolean(error),
        className: inputClass,
        // Empty optional fields are removed so the schema treats them as "not set"
        onChange: (e: { target: { value: string } }) => onChange(field.optional && e.target.value === '' ? undefined : e.target.value),
    };
    return (
        <FieldShell id={id} label={field.optional ? `${field.label} (optional)` : field.label} hint={field.hint} error={error}>
            {field.multiline ? <textarea rows={3} {...props} className={`${inputClass} resize-y`} /> : <input type="text" {...props} />}
        </FieldShell>
    );
}

function NumberField({ field, value, onChange, error }: { field: Extract<Field, { kind: 'number' }>; value: unknown; onChange: (v: unknown) => void; error?: string }) {
    const id = useId();
    return (
        <FieldShell id={id} label={field.optional ? `${field.label} (optional)` : field.label} hint={field.hint} error={error}>
            <input
                id={id}
                type="number"
                min={0}
                step={1}
                className={inputClass}
                aria-invalid={Boolean(error)}
                value={typeof value === 'number' ? value : ''}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            />
        </FieldShell>
    );
}

function ToggleField({ field, value, onChange }: { field: Extract<Field, { kind: 'toggle' }>; value: unknown; onChange: (v: unknown) => void }) {
    const id = useId();
    return (
        <div className="flex items-start gap-3">
            <input id={id} type="checkbox" className="mt-1 h-4 w-4 accent-primary" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
            <div>
                <label htmlFor={id} className="text-sm font-semibold text-on-surface">
                    {field.label}
                </label>
                {field.hint && <p className="text-xs text-on-surface-variant/70">{field.hint}</p>}
            </div>
        </div>
    );
}

function FileField({ field, value, onChange, error }: { field: Extract<Field, { kind: 'file' }>; value: unknown; onChange: (v: unknown) => void; error?: string }) {
    const id = useId();
    const [busy, setBusy] = useState(false);
    const [uploadError, setUploadError] = useState<string>();
    const url = typeof value === 'string' ? value : '';

    async function handleFile(file: File | undefined) {
        if (!file) return;
        setBusy(true);
        setUploadError(undefined);
        try {
            onChange(await uploadFile(file, field.upload));
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <FieldShell id={id} label={field.label} hint={field.hint ?? 'Paste a URL or a path such as /projects/x.png, or upload a file.'} error={uploadError ?? error}>
            <div className="flex gap-3 items-start">
                {field.upload === 'image' && url && (
                    <img src={url} alt="" className="h-16 w-24 object-cover rounded-md border border-outline-variant/30 bg-surface-container-highest shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                    <input id={id} type="text" className={inputClass} aria-invalid={Boolean(error)} value={url} onChange={(e) => onChange(e.target.value)} />
                    <label className={`inline-flex items-center gap-1.5 text-sm font-semibold text-primary cursor-pointer ${busy ? 'opacity-60 pointer-events-none' : 'hover:underline'}`}>
                        <Icon name={busy ? 'hourglass_top' : 'upload'} />
                        {busy ? 'Uploading…' : field.upload === 'image' ? 'Upload image' : 'Upload PDF'}
                        <input
                            type="file"
                            className="sr-only"
                            accept={field.upload === 'image' ? 'image/*' : 'application/pdf'}
                            onChange={(e) => {
                                handleFile(e.target.files?.[0]);
                                e.target.value = '';
                            }}
                        />
                    </label>
                </div>
            </div>
        </FieldShell>
    );
}

function TagsField({ field, value, onChange, error }: { field: Extract<Field, { kind: 'tags' }>; value: unknown; onChange: (v: unknown) => void; error?: string }) {
    const id = useId();
    const [draft, setDraft] = useState('');
    const tags = Array.isArray(value) ? (value as string[]) : [];

    function add() {
        const next = draft
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t && !tags.includes(t));
        if (next.length) onChange([...tags, ...next]);
        setDraft('');
    }

    return (
        <FieldShell id={id} label={field.label} hint={field.hint ?? 'Press Enter or comma to add. Tags show on the site in this order.'} error={error}>
            <div className={`${inputClass} flex flex-wrap gap-1.5 items-center`} aria-invalid={Boolean(error)}>
                {tags.map((t, i) => (
                    <span key={t} className="inline-flex items-center gap-0.5 pl-2 rounded bg-primary/10 text-primary text-xs font-semibold">
                        {t}
                        <button type="button" className="px-1 py-0.5 hover:text-error" onClick={() => onChange(tags.filter((_, j) => j !== i))} aria-label={`Remove ${t}`}>
                            ×
                        </button>
                    </span>
                ))}
                <input
                    id={id}
                    className="flex-1 min-w-24 bg-transparent outline-none text-sm py-0.5"
                    value={draft}
                    placeholder={tags.length ? '' : 'Add…'}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={add}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add();
                        } else if (e.key === 'Backspace' && !draft && tags.length) {
                            onChange(tags.slice(0, -1));
                        }
                    }}
                />
            </div>
        </FieldShell>
    );
}

function StringsField({ field, value, onChange, path, errors }: { field: Extract<Field, { kind: 'strings' }>; value: unknown; onChange: (v: unknown) => void; path: string; errors: Errors }) {
    const items = Array.isArray(value) ? (value as string[]) : [];
    const set = (i: number, v: string) => onChange(items.map((s, j) => (j === i ? v : s)));
    return (
        <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">{field.label}</legend>
            {field.hint && <p className="text-xs text-on-surface-variant/70 -mt-1">{field.hint}</p>}
            {items.map((s, i) => {
                const error = errors[`${path}.${i}`];
                const common = {
                    value: s,
                    'aria-label': `${field.itemLabel} ${i + 1}`,
                    'aria-invalid': Boolean(error),
                    onChange: (e: { target: { value: string } }) => set(i, e.target.value),
                };
                return (
                    <div key={i}>
                        <div className="flex gap-1 items-start">
                            {field.multiline ? <textarea rows={2} {...common} className={`${inputClass} resize-y`} /> : <input {...common} className={inputClass} />}
                            <ReorderButtons
                                index={i}
                                count={items.length}
                                itemLabel={field.itemLabel}
                                onMove={(to) => onChange(move(items, i, to))}
                                onRemove={() => (!s.trim() || confirm(`Remove this ${field.itemLabel}?`)) && onChange(items.filter((_, j) => j !== i))}
                            />
                        </div>
                        {error && <p className="text-xs text-error font-semibold mt-1">{error}</p>}
                    </div>
                );
            })}
            {errors[path] && <p className="text-xs text-error font-semibold">{errors[path]}</p>}
            <button type="button" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1" onClick={() => onChange([...items, ''])}>
                <Icon name="add" /> Add {field.itemLabel}
            </button>
        </fieldset>
    );
}

function ListField({ field, value, onChange, path, errors }: { field: Extract<Field, { kind: 'list' }>; value: unknown; onChange: (v: unknown) => void; path: string; errors: Errors }) {
    const items = Array.isArray(value) ? (value as Obj[]) : [];
    const [open, setOpen] = useState<number | null>(null);

    return (
        <fieldset className="space-y-2">
            <legend className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5">
                {field.label} <span className="font-mono normal-case tracking-normal">({items.length})</span>
            </legend>
            {items.map((item, i) => {
                const itemPath = `${path}.${i}`;
                const invalid = hasErrorUnder(errors, itemPath);
                const isOpen = open === i || invalid;
                return (
                    <div key={i} className={`rounded-xl border ${invalid ? 'border-error/60' : 'border-outline-variant/30'} bg-surface-container-low`}>
                        <div className="flex items-center gap-2 pl-3 pr-1 py-1">
                            <button type="button" className="flex-1 flex items-center gap-2 text-left py-1.5 min-w-0" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                                <Icon name={isOpen ? 'expand_more' : 'chevron_right'} />
                                <span className="font-mono text-xs text-on-surface-variant">{String(i + 1).padStart(2, '0')}</span>
                                <span className="font-semibold text-sm truncate">{field.itemTitle(item) || `New ${field.itemLabel}`}</span>
                                {invalid && <span className="text-xs text-error font-semibold shrink-0">needs fixing</span>}
                            </button>
                            <ReorderButtons
                                index={i}
                                count={items.length}
                                itemLabel={field.itemLabel}
                                onMove={(to) => {
                                    onChange(move(items, i, to));
                                    if (open === i) setOpen(to);
                                }}
                                onRemove={() => {
                                    const title = field.itemTitle(item);
                                    if (confirm(`Remove ${title ? `"${title}"` : `this ${field.itemLabel}`}? This takes effect when you save.`)) {
                                        onChange(items.filter((_, j) => j !== i));
                                        setOpen(null);
                                    }
                                }}
                            />
                        </div>
                        {isOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-outline-variant/20">
                                <FieldsEditor fields={field.fields} value={item} path={itemPath} errors={errors} onChange={(next) => onChange(items.map((it, j) => (j === i ? next : it)))} />
                            </div>
                        )}
                    </div>
                );
            })}
            {errors[path] && <p className="text-xs text-error font-semibold">{errors[path]}</p>}
            <button
                type="button"
                className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
                onClick={() => {
                    onChange([...items, field.newItem()]);
                    setOpen(items.length);
                }}
            >
                <Icon name="add" /> Add {field.itemLabel}
            </button>
        </fieldset>
    );
}

function GroupField({ field, value, onChange, path, errors }: { field: Extract<Field, { kind: 'group' }>; value: unknown; onChange: (v: unknown) => void; path: string; errors: Errors }) {
    const obj = (value && typeof value === 'object' ? value : {}) as Obj;
    return (
        <fieldset className="rounded-xl border border-outline-variant/20 p-4 space-y-4">
            <legend className="px-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                {field.label}
                {field.optional ? ' (optional)' : ''}
            </legend>
            <FieldsEditor
                fields={field.fields}
                value={obj}
                path={path}
                errors={errors}
                // An optional group with nothing filled in is removed entirely
                onChange={(next) => onChange(field.optional && Object.values(next).every((v) => v === undefined) ? undefined : next)}
            />
        </fieldset>
    );
}

export function FieldsEditor({ fields, value, onChange, path = '', errors }: { fields: Field[]; value: Obj; onChange: (next: Obj) => void; path?: string; errors: Errors }) {
    function set(key: string, v: unknown) {
        const next = { ...value };
        if (v === undefined) delete next[key];
        else next[key] = v;
        onChange(next);
    }

    return (
        <div className="space-y-5">
            {fields.map((field) => {
                const p = path ? `${path}.${field.key}` : field.key;
                const props = { value: value[field.key], onChange: (v: unknown) => set(field.key, v), error: errors[p] };
                switch (field.kind) {
                    case 'text':
                        return <TextField key={field.key} field={field} {...props} />;
                    case 'number':
                        return <NumberField key={field.key} field={field} {...props} />;
                    case 'toggle':
                        return <ToggleField key={field.key} field={field} {...props} />;
                    case 'file':
                        return <FileField key={field.key} field={field} {...props} />;
                    case 'tags':
                        return <TagsField key={field.key} field={field} {...props} />;
                    case 'strings':
                        return <StringsField key={field.key} field={field} {...props} path={p} errors={errors} />;
                    case 'list':
                        return <ListField key={field.key} field={field} {...props} path={p} errors={errors} />;
                    case 'group':
                        return <GroupField key={field.key} field={field} {...props} path={p} errors={errors} />;
                }
            })}
        </div>
    );
}
