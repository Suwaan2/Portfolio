import  { useState } from 'react';
import { Project } from './types';
import { ProjectDetails } from './ProjectDetails';
import { ProjectNavigation } from './ProjectNavigation';

const projects: Project[] = [
  {
    id: 1,
    title: 'E-commerce Cart System',
    description: 'Mini E-commerce cart system which shows the working of the cart system. This cart system is built using Redux and React Router',
    image: 'https://unsplash.com/photos/a-toy-shopping-cart-BQ9usyzHx_w',
    link: 'https://ecommerce-cart-system.vercel.app/'
  },
  {
    id: 2,
    title: 'Portfolio v1',
    description: 'My first portfolio website built with React and TailwindCSS. A clean and minimal design to showcase my work and skills.',
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=2071',
    link: '#'
  },
  {
    id: 3,
    title: 'Weather App',
    description: 'A beautiful weather application built with React that shows current weather and forecasts. Uses OpenWeather API for real-time data.',
    image: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?q=80&w=2075',
    link: '#'
  }
];

export function ProjectCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  return (
    <div className="relative">
      <ProjectNavigation 
        currentIndex={currentIndex} 
        totalProjects={projects.length} 
        onPrev={prevProject} 
        onNext={nextProject} 
      />
      <ProjectDetails project={projects[currentIndex]} />
    </div>
  );
}