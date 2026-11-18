import { NameReveal } from './NameReveal';
import { SectionReveal } from './SectionReveal';
import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { WorkGallery } from './Work/WorkGallery';
import { Experience } from './Experience';
import { Contact } from './Contact';

export function Home() {
    return (
        <div className="flex flex-col">
            {/* Scroll-driven name mask; the hero's entrance waits until it is scrolled into view */}
            <NameReveal />
            <Hero introOn="scroll" />

            <SectionReveal>
                <About textReveal="scrub" />
            </SectionReveal>
            <SectionReveal>
                <Skills />
            </SectionReveal>

            {/* Pins itself, so it can't sit inside SectionReveal's transforms */}
            <WorkGallery />

            <SectionReveal>
                <Experience />
            </SectionReveal>
            <SectionReveal>
                <Contact />
            </SectionReveal>
        </div>
    );
}
