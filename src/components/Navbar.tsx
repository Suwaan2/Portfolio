
import { Code2 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Code2 className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold text-white">Suwaan</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {['Home', 'Work', 'About', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-white hover:text-pink-500 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}