import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Work } from './Work';
import { Experience } from './Experience';
import { Contact } from './Contact';

export function Home() {
    return (
        <div className="flex flex-col gap-10">
            <Hero />
            
            {/* Quick summaries of the other sections */}
            <div className="border-t border-outline-variant/10">
                <About />
            </div>
            
            <div className="border-t border-outline-variant/10">
                <Skills />
            </div>
            
            <div className="border-t border-outline-variant/10">
                <Work />
            </div>

            <div className="border-t border-outline-variant/10">
                <Experience />
            </div>
            
            <div className="border-t border-outline-variant/10">
                <Contact />
            </div>
        </div>
    );
}
