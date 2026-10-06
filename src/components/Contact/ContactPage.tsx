import { useRef, useState } from 'react';
import { useScrollReveal } from '../../lib/useScrollReveal';

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputClass =
    'w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline-variant/50 transition-[border-color,box-shadow] duration-200 font-body';

export function ContactPage() {
    const [status, setStatus] = useState<Status>('idle');
    const ref = useRef<HTMLElement>(null);
    useScrollReveal(ref);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        const payload: Record<string, string> = {};
        data.forEach((value, key) => {
            payload[key] = typeof value === 'string' ? value : value.name;
        });
        payload['_subject'] = payload['subject'] || 'New message from portfolio';
        payload['_template'] = 'table';
        payload['_captcha'] = 'false';

        setStatus('sending');
        try {
            const res = await fetch('https://formsubmit.co/ajax/suankc22@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setStatus('success');
                form.reset();
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    }

    return (
        <section ref={ref} className="relative py-24 md:py-32 overflow-hidden" id="contact-page">
            <div className="hud-grid absolute inset-x-0 top-0 h-[480px] pointer-events-none" aria-hidden="true" />
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <div className="relative text-center mb-16 flex flex-col items-center">
                    <div data-reveal className="eyebrow mb-6">
                        <span>Say hello</span>
                        <span data-line className="h-px w-10 bg-primary/60" aria-hidden="true" />
                    </div>
                    <h2 data-split className="text-4xl md:text-5xl font-headline font-bold mb-4 text-on-background">
                        Get In <span className="text-primary">Touch</span>
                    </h2>
                    <p data-reveal className="text-lg text-on-surface-variant font-body max-w-2xl mx-auto">
                        Have a project in mind or just want to say hi? Fill out the form and I'll get back to you as soon as I can.
                    </p>
                </div>

                <form
                    data-reveal
                    onSubmit={handleSubmit}
                    className="spotlight relative glass-card p-8 md:p-12 rounded-[2rem]"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block font-label text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                                Name
                            </label>
                            <input id="name" name="name" type="text" required placeholder="Your name" className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block font-label text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                                Email
                            </label>
                            <input id="email" name="email" type="email" required placeholder="you@example.com" className={inputClass} />
                        </div>
                    </div>

                    <div className="space-y-2 mt-6">
                        <label htmlFor="subject" className="block font-label text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                            Subject
                        </label>
                        <input id="subject" name="subject" type="text" placeholder="What's this about?" className={inputClass} />
                    </div>

                    <div className="space-y-2 mt-6">
                        <label htmlFor="message" className="block font-label text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            required
                            rows={6}
                            placeholder="Tell me about your project..."
                            className={`${inputClass} resize-y`}
                        ></textarea>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-[box-shadow,transform] duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            {status === 'sending' && (
                                <span className="h-4 w-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" aria-hidden="true" />
                            )}
                            {status === 'success' && <span className="material-symbols-outlined text-xl" aria-hidden="true">check_circle</span>}
                            {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent' : 'Send Message'}
                        </button>
                    </div>

                    <div role="status" aria-live="polite">
                        {status === 'success' && (
                            <p className="mt-6 flex items-start gap-2 text-primary font-body font-semibold animate-[status-in_300ms_ease-out]">
                                <span className="material-symbols-outlined" aria-hidden="true">mark_email_read</span>
                                Thanks for reaching out! Your message has been sent and I'll reply soon.
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="mt-6 flex items-start gap-2 text-error font-body font-semibold animate-[status-in_300ms_ease-out]">
                                <span className="material-symbols-outlined" aria-hidden="true">error</span>
                                Something went wrong while sending your message. Please try again or email me directly at suankc22@gmail.com.
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
