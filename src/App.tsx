import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ScrollToTop } from './components/ScrollToTop';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Work } from './components/Work';
import { Experience } from './components/Experience';
import { ContactPage } from './components/Contact/ContactPage';
import { Footer } from './components/Footer';
import { AskSuanAI } from './components/ai/AskSuanAI';
import { Preloader } from './components/Preloader';

function App() {
  const location = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-background min-h-screen text-on-background font-body relative overflow-x-hidden selection:bg-primary selection:text-on-primary">
        <Preloader />
        <ScrollToTop />
        <ScrollProgressBar />
        <Navbar />
        <main className="relative pt-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/projects" element={<Work />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <AskSuanAI />
      </div>
    </MotionConfig>
  );
}

export default App;