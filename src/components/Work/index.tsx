import React from 'react';
import { ProjectCarousel } from './ProjectCarousel';

export function Work() {
  return (
    <section id="work" className="min-h-screen bg-navy-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-pink-500 pl-4 mb-16">
          <h2 className="text-2xl font-bold text-white">Work</h2>
        </div>
        <ProjectCarousel />
      </div>
    </section>
  );
}