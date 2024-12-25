

const skills = {
  development: ['JavaScript', 'React', 'Next.js', 'HTML', 'CSS/SCSS', 'TailwindCSS', 'Node.js']
};

export function SkillList() {
  return (
    <div>
      <h4 className="text-2xl font-bold text-white mb-4">Skills & Tools</h4>
      <div className="space-y-4">
        <p className="text-gray-300">
          <span className="font-semibold">Development:</span> {skills.development.join(', ')}
        </p>
      </div>
    </div>
  );
}