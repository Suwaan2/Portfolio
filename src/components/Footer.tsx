export function Footer() {
    return (
        <footer className="w-full border-t border-outline-variant/30 bg-surface">
            <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="font-headline font-bold text-primary">
                    SUAN.CODE
                </div>
                <p className="font-body text-sm text-on-surface-variant">
                    © 2024 SUAN KC. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                    <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://github.com/Suwaan2" target="_blank">GitHub</a>
                    <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://www.linkedin.com/in/suan-kc/" target="_blank">LinkedIn</a>
                    <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="https://x.com/Suan45126923" target="_blank">Twitter</a>
                    <a className="text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100" href="mailto:suankc22@gmail.com" target="_blank">Email</a>
                </div>
            </div>
        </footer>
    );
}
