import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sectionSchemas, type Content, type SectionKey } from '../../shared/schema';
import { ContentContext } from '../lib/content';
import { markIntroDone } from '../lib/intro';
import { adminApi, AdminApiError, type AdminSections } from './api';
import { FieldsEditor, type Errors } from './fields';
import { SECTIONS, SECTION_ORDER } from './sections';

type Obj = Record<string, unknown>;
type Drafts = Record<SectionKey, Obj>;

type SaveState =
    | { kind: 'idle' }
    | { kind: 'saving' }
    | { kind: 'saved' }
    | { kind: 'invalid'; count: number }
    | { kind: 'conflict'; message: string; version: number }
    | { kind: 'error'; message: string };

const buttonPrimary =
    'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:shadow-[0_0_24px_rgba(129,236,255,0.35)] active:scale-[0.97] transition-[box-shadow,transform] disabled:opacity-50 disabled:pointer-events-none';
const buttonGhost =
    'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold text-on-surface-variant hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:pointer-events-none';

function useNoIndex() {
    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);
        const title = document.title;
        document.title = 'Admin | Portfolio';
        return () => {
            meta.remove();
            document.title = title;
        };
    }, []);
}

function issuesToErrors(issues: { path: PropertyKey[] | string; message: string }[]): Errors {
    const errors: Errors = {};
    for (const i of issues) {
        const path = Array.isArray(i.path) ? i.path.map(String).join('.') : String(i.path);
        errors[path] ??= i.message;
    }
    return errors;
}

function validate(key: SectionKey, draft: Obj): Errors {
    const result = sectionSchemas[key].safeParse(draft);
    return result.success ? {} : issuesToErrors(result.error.issues);
}

function LoginForm({ onSuccess, notice }: { onSuccess: () => void; notice?: string }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string>();
    const [busy, setBusy] = useState(false);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setBusy(true);
        setError(undefined);
        try {
            await adminApi.login(password);
            setPassword('');
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={submit} className="glass-card rounded-2xl p-8 w-full max-w-sm space-y-5">
            <div>
                <h1 className="font-headline text-2xl font-bold">Portfolio admin</h1>
                <p className="text-sm text-on-surface-variant mt-1">{notice ?? 'Log in to edit your site.'}</p>
            </div>
            <div className="space-y-1.5">
                <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                    Password
                </label>
                <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>
            {error && (
                <p className="text-sm text-error font-semibold" role="alert">
                    {error}
                </p>
            )}
            <button type="submit" className={`${buttonPrimary} w-full`} disabled={busy || !password}>
                {busy ? 'Logging in…' : 'Log in'}
            </button>
        </form>
    );
}

function SaveStatus({ state, dirty }: { state: SaveState; dirty: boolean }) {
    if (state.kind === 'saving') return <span className="text-sm text-on-surface-variant">Saving…</span>;
    if (state.kind === 'saved' && !dirty)
        return (
            <span className="text-sm text-primary font-semibold inline-flex items-center gap-1" role="status">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
                Saved. Live on the site within about a minute.
            </span>
        );
    if (state.kind === 'invalid')
        return (
            <span className="text-sm text-error font-semibold" role="alert">
                {state.count === 1 ? '1 field needs' : `${state.count} fields need`} fixing before saving.
            </span>
        );
    if (state.kind === 'error')
        return (
            <span className="text-sm text-error font-semibold" role="alert">
                {state.message}
            </span>
        );
    if (dirty) return <span className="text-sm text-on-surface-variant">Unsaved changes</span>;
    return null;
}

function Dashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
    const [sections, setSections] = useState<AdminSections | null>(null);
    const [drafts, setDrafts] = useState<Drafts | null>(null);
    const [loadError, setLoadError] = useState<string>();
    const [active, setActive] = useState<SectionKey>('hero');
    const [tab, setTab] = useState<'edit' | 'preview'>('edit');
    const [showErrors, setShowErrors] = useState(false);
    const [save, setSave] = useState<SaveState>({ kind: 'idle' });
    const [sessionExpired, setSessionExpired] = useState(false);

    // No preloader here, so let the hero's entrance play in the preview
    useEffect(markIntroDone, []);

    const load = useCallback(async (only?: SectionKey) => {
        setLoadError(undefined);
        try {
            const fresh = await adminApi.content();
            setSections((prev) => (only && prev ? { ...prev, [only]: fresh[only] } : fresh));
            setDrafts((prev) => {
                const fromServer = Object.fromEntries(Object.entries(fresh).map(([k, s]) => [k, structuredClone(s.data)])) as unknown as Drafts;
                return only && prev ? { ...prev, [only]: fromServer[only] } : fromServer;
            });
        } catch (err) {
            if (err instanceof AdminApiError && err.status === 401) return onLoggedOut();
            setLoadError(err instanceof Error ? err.message : 'Could not load content');
        }
    }, [onLoggedOut]);

    useEffect(() => {
        load();
    }, [load]);

    const isDirty = useCallback(
        (key: SectionKey) => Boolean(sections && drafts && JSON.stringify(drafts[key]) !== JSON.stringify(sections[key].data)),
        [sections, drafts],
    );
    const anyDirty = SECTION_ORDER.some(isDirty);

    useEffect(() => {
        if (!anyDirty) return;
        const warn = (e: BeforeUnloadEvent) => e.preventDefault();
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [anyDirty]);

    const errors = useMemo(() => (drafts && showErrors ? validate(active, drafts[active]) : {}), [drafts, active, showErrors]);

    const previewContent = useMemo(() => (drafts ? (drafts as unknown as Content) : null), [drafts]);

    if (loadError)
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-error font-semibold">{loadError}</p>
                <button className={buttonGhost} onClick={() => load()}>
                    Try again
                </button>
            </div>
        );
    if (!sections || !drafts) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Loading content…</div>;

    const config = SECTIONS[active];
    const dirty = isDirty(active);
    const state = sections[active];

    function selectSection(key: SectionKey) {
        setActive(key);
        setShowErrors(false);
        setSave({ kind: 'idle' });
        if (!SECTIONS[key].preview) setTab('edit');
    }

    async function saveActive(version = state.version) {
        const problems = validate(active, drafts![active]);
        const count = Object.keys(problems).length;
        if (count) {
            setShowErrors(true);
            setTab('edit');
            setSave({ kind: 'invalid', count });
            return;
        }
        setSave({ kind: 'saving' });
        const data = drafts![active] as Content[SectionKey];
        try {
            const newVersion = await adminApi.save(active, data, version);
            setSections((prev) => prev && { ...prev, [active]: { data: structuredClone(data), version: newVersion, updatedAt: new Date().toISOString() } });
            setShowErrors(false);
            setSave({ kind: 'saved' });
        } catch (err) {
            if (!(err instanceof AdminApiError)) return setSave({ kind: 'error', message: 'Save failed' });
            if (err.status === 401) {
                setSessionExpired(true);
                return setSave({ kind: 'error', message: 'Your login expired. Log in again, then save.' });
            }
            if (err.status === 409) return setSave({ kind: 'conflict', message: err.message, version: err.version ?? 0 });
            if (err.status === 400 && err.issues.length) {
                setShowErrors(true);
                return setSave({ kind: 'invalid', count: err.issues.length });
            }
            setSave({ kind: 'error', message: err.message });
        }
    }

    function discard() {
        if (!confirm(`Discard your unsaved changes to ${config.title}?`)) return;
        setDrafts((prev) => prev && { ...prev, [active]: structuredClone(state.data) as Obj });
        setShowErrors(false);
        setSave({ kind: 'idle' });
    }

    async function logout() {
        if (anyDirty && !confirm('You have unsaved changes. Log out anyway?')) return;
        await adminApi.logout().catch(() => {});
        onLoggedOut();
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 border-b border-outline-variant/20 bg-neutral-950/85 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="font-headline font-bold text-primary">Admin</span>
                        <label className="md:hidden">
                            <span className="sr-only">Section</span>
                            <select
                                value={active}
                                onChange={(e) => selectSection(e.target.value as SectionKey)}
                                className="bg-surface-container-highest border border-outline-variant/30 rounded-lg px-2 py-1.5 text-sm"
                            >
                                {SECTION_ORDER.map((k) => (
                                    <option key={k} value={k}>
                                        {SECTIONS[k].title}
                                        {isDirty(k) ? ' •' : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/" target="_blank" className={`${buttonGhost} !px-3 !py-2`}>
                            View site
                        </Link>
                        <button className={`${buttonGhost} !px-3 !py-2`} onClick={logout}>
                            Log out
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex gap-8">
                <nav className="hidden md:block w-52 shrink-0" aria-label="Sections">
                    <ul className="sticky top-24 space-y-1">
                        {SECTION_ORDER.map((k) => (
                            <li key={k}>
                                <button
                                    onClick={() => selectSection(k)}
                                    aria-current={k === active ? 'page' : undefined}
                                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                                        k === active ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                                    }`}
                                >
                                    {SECTIONS[k].title}
                                    {isDirty(k) && <span className="h-2 w-2 rounded-full bg-primary" title="Unsaved changes" />}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="flex-1 min-w-0 space-y-6 pb-28">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="font-headline text-3xl font-bold">{config.title}</h1>
                            <p className="text-sm text-on-surface-variant mt-1">{config.description}</p>
                            <p className="text-xs text-on-surface-variant/70 mt-1 font-mono">
                                {state.version === 0
                                    ? 'Not saved to the database yet (showing the copy from the code)'
                                    : `Version ${state.version}${state.updatedAt ? ` · last saved ${new Date(state.updatedAt).toLocaleString()}` : ''}`}
                            </p>
                        </div>
                        {config.preview && (
                            <div className="inline-flex rounded-xl border border-outline-variant/30 p-1" role="tablist">
                                {(['edit', 'preview'] as const).map((t) => (
                                    <button
                                        key={t}
                                        role="tab"
                                        aria-selected={tab === t}
                                        onClick={() => setTab(t)}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize ${tab === t ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {save.kind === 'conflict' && (
                        <div className="rounded-xl border border-error/50 bg-error/10 p-4 space-y-3" role="alert">
                            <p className="text-sm font-semibold">{save.message}</p>
                            <div className="flex flex-wrap gap-2">
                                <button className={buttonGhost} onClick={() => load(active).then(() => setSave({ kind: 'idle' }))}>
                                    Load the latest version (discard mine)
                                </button>
                                <button
                                    className={buttonGhost}
                                    onClick={() => confirm('Replace the newer version with yours?') && saveActive(save.version)}
                                >
                                    Save mine anyway
                                </button>
                            </div>
                        </div>
                    )}

                    {tab === 'edit' || !config.preview ? (
                        <div className="glass-card rounded-2xl p-5 md:p-8">
                            <FieldsEditor
                                fields={config.fields}
                                value={drafts[active]}
                                errors={errors}
                                onChange={(next) => {
                                    setDrafts((prev) => prev && { ...prev, [active]: next });
                                    if (save.kind === 'saved' || save.kind === 'error') setSave({ kind: 'idle' });
                                }}
                            />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-outline-variant/30 overflow-hidden bg-background">
                            <p className="px-4 py-2 text-xs font-mono text-on-surface-variant border-b border-outline-variant/20 bg-surface-container-low">
                                Preview with your unsaved changes. Scroll to play the animations.
                            </p>
                            <ContentContext.Provider value={previewContent!}>
                                {config.preview.map((Section, i) => (
                                    <Section key={i} />
                                ))}
                            </ContentContext.Provider>
                        </div>
                    )}
                </main>
            </div>

            <div className="fixed bottom-0 inset-x-0 z-40 border-t border-outline-variant/20 bg-neutral-950/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-end gap-3 flex-wrap">
                    <div className="mr-auto">
                        <SaveStatus state={save} dirty={dirty} />
                    </div>
                    <button className={buttonGhost} onClick={discard} disabled={!dirty}>
                        Discard
                    </button>
                    <button className={buttonPrimary} onClick={() => saveActive()} disabled={!dirty || save.kind === 'saving'}>
                        Save {config.title}
                    </button>
                </div>
            </div>

            {sessionExpired && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
                    <LoginForm
                        notice="Your login expired. Log in again. Your unsaved changes are kept."
                        onSuccess={() => {
                            setSessionExpired(false);
                            setSave({ kind: 'idle' });
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default function AdminApp() {
    useNoIndex();
    const [auth, setAuth] = useState<'checking' | 'out' | 'in' | 'unavailable'>('checking');
    const [problem, setProblem] = useState<string>();

    useEffect(() => {
        adminApi
            .session()
            .then((ok) => setAuth(ok ? 'in' : 'out'))
            .catch((err) => {
                setProblem(err instanceof Error ? err.message : 'Admin is unavailable');
                setAuth('unavailable');
            });
    }, []);

    const loggedOut = useCallback(() => setAuth('out'), []);

    return (
        <div className="bg-background min-h-screen text-on-background font-body">
            {auth === 'checking' && <div className="min-h-screen" />}
            {auth === 'unavailable' && (
                <div className="min-h-screen flex items-center justify-center px-4 text-center">
                    <p className="text-error font-semibold max-w-md">{problem}</p>
                </div>
            )}
            {auth === 'out' && (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <LoginForm onSuccess={() => setAuth('in')} />
                </div>
            )}
            {auth === 'in' && <Dashboard onLoggedOut={loggedOut} />}
        </div>
    );
}
