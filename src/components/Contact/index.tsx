
import { Github, Linkedin } from 'lucide-react';
import { ContactForm } from './ContactForm';

export function Contact() {
  return (
    <section id="contact" className="min-h-screen bg-navy-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-white mb-8">Let's talk!</h2>
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070"
              alt="Contact illustration"
              className="max-w-md mx-auto"
            />
          </div>
          
          <ContactForm />
        </div>
        
        <footer className="mt-20 flex justify-between items-center">
          <p className="text-gray-400">© 2024 Suan KC</p>
          <div className="flex space-x-4">
            <a href="https://github.com" className="text-white hover:text-pink-500 transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" className="text-white hover:text-pink-500 transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </footer>
      </div>
    </section>
  );
}