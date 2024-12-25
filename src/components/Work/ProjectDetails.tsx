
import { Project } from './types';

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div>
        <h2 className="text-5xl font-bold text-white mb-6">{project.title}</h2>
        <p className="text-gray-300 text-lg mb-8">{project.description}</p>
        <a
          href={project.link}
          className="inline-block px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200"
        >
          Visit Site
        </a>
      </div>
      <div className="relative">
        <div className="bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg p-4">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}