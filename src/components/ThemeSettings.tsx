import { useEffect, useId, useRef, useState } from 'react';

type Palette = 'cyan' | 'sunset';
type Mode = 'dark' | 'light';
type Theme = { palette: Palette; mode: Mode };

// Also read by the inline script in index.html, which applies the theme before first paint
const STORAGE_KEY = 'theme';
const DEFAULT: Theme = { palette: 'cyan', mode: 'dark' };

const palettes: { id: Palette; label: string; swatch: string }[] = [
    { id: 'cyan', label: 'Cyan', swatch: 'linear-gradient(135deg, #81ecff, #70aaff)' },
    { id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg, #ff7ab6, #ffb057)' },
];
const modes: { id: Mode; label: string; icon: string }[] = [
    { id: 'dark', label: 'Dark', icon: 'dark_mode' },
    { id: 'light', label: 'Light', icon: 'light_mode' },
];

function loadTheme(): Theme {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<Theme> | null;
        return {
            palette: saved?.palette === 'sunset' ? 'sunset' : 'cyan',
            mode: saved?.mode === 'light' ? 'light' : 'dark',
        };
    } catch {
        return DEFAULT;
    }
}

const optionClass = (selected: boolean) =>
    `flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition-colors duration-200 ${
        selected ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface'
    }`;

/**
 * Site theme settings: a gear button that opens a small panel with the palette and
 * light/dark choices. Applied to <html> as data-palette / data-mode while the site is
 * mounted; the admin panel (a separate tree) always uses the default theme.
 * The themes themselves live in src/theme.css.
 */
export function ThemeSettings() {
    const [theme, setTheme] = useState<Theme>(loadTheme);
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    // React 18 has no `inert` prop, so it's set on the element directly
    useEffect(() => {
        if (panelRef.current) panelRef.current.inert = !open;
    }, [open]);

    useEffect(() => {
        const root = document.documentElement;
        if (theme.palette === 'cyan') root.removeAttribute('data-palette');
        else root.setAttribute('data-palette', theme.palette);
        if (theme.mode === 'dark') root.removeAttribute('data-mode');
        else root.setAttribute('data-mode', theme.mode);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
        } catch {
            // Storage unavailable (private window): the choice just won't persist
        }
    }, [theme]);

    // Leaving the site (e.g. for /admin) restores the default theme
    useEffect(
        () => () => {
            document.documentElement.removeAttribute('data-palette');
            document.documentElement.removeAttribute('data-mode');
        },
        [],
    );

    // Close on Escape or a click anywhere outside the button and panel
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setOpen(false);
            buttonRef.current?.focus();
        };
        const onPointer = (e: PointerEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onPointer);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('pointerdown', onPointer);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="fixed bottom-6 left-4 z-40 md:left-6">
            {/* Kept in the DOM while closed so it can fade/slide; inert stops it taking focus or clicks */}
            <div
                id={panelId}
                role="group"
                aria-label="Theme settings"
                ref={panelRef}
                className={`glass-card absolute bottom-full left-0 mb-3 w-60 origin-bottom-left rounded-xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                    open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-2 scale-95 opacity-0'
                }`}
            >
                <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Colour</p>
                <div className="mb-3 flex gap-1" role="radiogroup" aria-label="Colour palette">
                    {palettes.map((p) => (
                        <button
                            key={p.id}
                            role="radio"
                            aria-checked={theme.palette === p.id}
                            onClick={() => setTheme((t) => ({ ...t, palette: p.id }))}
                            className={optionClass(theme.palette === p.id)}
                        >
                            <span className="h-3 w-3 rounded-full ring-1 ring-on-surface/20" style={{ background: p.swatch }} aria-hidden="true" />
                            {p.label}
                        </button>
                    ))}
                </div>
                <p className="mb-2 px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-on-surface-variant">Appearance</p>
                <div className="flex gap-1" role="radiogroup" aria-label="Light or dark mode">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            role="radio"
                            aria-checked={theme.mode === m.id}
                            onClick={() => setTheme((t) => ({ ...t, mode: m.id }))}
                            className={optionClass(theme.mode === m.id)}
                        >
                            <span className="material-symbols-outlined text-base" aria-hidden="true">{m.icon}</span>
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <button
                ref={buttonRef}
                type="button"
                aria-label="Theme settings"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((o) => !o)}
                className={`glass-card flex h-12 w-12 items-center justify-center rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-[color,border-color,transform] duration-200 hover:border-primary/40 hover:text-primary active:scale-90 ${
                    open ? 'border-primary/40 text-primary' : 'text-on-surface-variant'
                }`}
            >
                <span
                    className={`material-symbols-outlined transition-transform duration-300 ease-out motion-reduce:transition-none ${open ? 'rotate-90' : ''}`}
                    aria-hidden="true"
                >
                    settings
                </span>
            </button>
        </div>
    );
}
