import { useState } from 'react';
import { motion } from 'framer-motion';

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputClass =
    'w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors font-body';

export function ContactPage() {
    const [status, setStatus] = useState<Status>('idle');

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
        <section className="py-24 md:py-32 overflow-hidden" id="contact-page">
            <div className="max-w-5xl mx-auto px-4 md:px-8">
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.5 }}
                >
                    <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 text-on-background">
                        Get In <span className="text-primary">Touch</span>
                    </h2>
                    <p className="text-lg text-on-surface-variant font-body max-w-2xl mx-auto">
                        Have a project in mind or just want to say hi? Fill out the form and I'll get back to you as soon as I can.
                    </p>
                </motion.div>

                <motion.form
                    onSubmit={handleSubmit}
                    className="glass-card p-8 md:p-12 rounded-[2rem]"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    viewport={{ once: true, amount: 0.2 }}
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
                            className="w-full md:w-auto px-10 py-4 bg-primary text-on-primary font-bold rounded-xl hover:shadow-[0_0_30px_rgba(129,236,255,0.3)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            {status === 'sending' ? 'Sending...' : status === 'success' ? 'Message Sent' : 'Send Message'}
                        </button>
                    </div>

                    {status === 'success' && (
                        <p className="mt-6 text-primary font-body font-semibold">
                            Thanks for reaching out! Your message has been sent and I'll reply soon.
                        </p>
                    )}
                    {status === 'error' && (
                        <p className="mt-6 text-error font-body font-semibold">
                            Something went wrong while sending your message. Please try again or email me directly at suankc22@gmail.com.
                        </p>
                    )}
                </motion.form>
            </div>
        </section>
    );
}
