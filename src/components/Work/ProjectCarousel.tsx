import React, { useState } from 'react';
import { Project } from './types';
import { ProjectDetails } from './ProjectDetails';
import { ProjectNavigation } from './ProjectNavigation';

const projects: Project[] = [
  {
    id: 1,
    title: 'DevBlogs',
    description: 'DevBlogs is a NextJs site, where i used to write blogs about web-development and software-development. If you want to learn something, do check this website.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072',
    link: '#'
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