
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectNavigationProps {
  currentIndex: number;
  totalProjects: number;
  onPrev: () => void;
  onNext: () => void;
}

export function ProjectNavigation({ 
  currentIndex, 
  totalProjects, 
  onPrev, 
  onNext 
}: ProjectNavigationProps) {
  return (
    <div className="flex items-center space-x-4 mb-8">
      <button
        onClick={onPrev}
        className="p-3 bg-navy-800 hover:bg-navy-700 text-white rounded-lg transition-colors"
        aria-label="Previous project"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <span className="text-white font-medium">
        {String(currentIndex + 1).padStart(2, '0')}/{String(totalProjects).padStart(2, '0')}
      </span>
      <button
        onClick={onNext}
        className="p-3 bg-navy-800 hover:bg-navy-700 text-white rounded-lg transition-colors"
        aria-label="Next project"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}