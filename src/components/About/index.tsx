
import { SkillList } from './SkillList';

export function About() {
  return (
    <section id="about" className="min-h-screen bg-navy-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-pink-500 pl-4 mb-16">
          <h2 className="text-2xl font-bold text-white">About</h2>
        </div>
        
        <h3 className="text-5xl font-bold text-white mb-16">Get a closer look at who I am.</h3>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-12">
            <div>
              <h4 className="text-2xl font-bold text-white mb-4">Who Am I</h4>
              <p className="text-gray-300 text-lg">
              I'm Suan KC a passionate web developer specializing in building dynamic and user-friendly web applications.
              </p>
            </div>
            
            <SkillList />
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070"
              alt="Developer workspace"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}