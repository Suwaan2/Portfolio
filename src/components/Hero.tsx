import myImage from './go.png'

export function Hero() {
  return (
    <div className="relative min-h-screen bg-navy-900 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex justify-between items-center w-full">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white">
            Hey, I'm{' '}
            <span className="text-pink-500">Suan KC</span>
          </h1>
          <h2 className="mt-6 text-3xl md:text-4xl font-bold text-white">
            a <span className="text-pink-500">self-taught</span> coder
            <br />& front-end developer.
          </h2>
          <button className="mt-8 px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-200">
            See my work
          </button>
        </div>
        <div className="hidden lg:block w-1/2">
          <img
            src={myImage}
            alt="Developer illustration"
            className="w-full h-auto max-w-md ml-auto rounded-full"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#6366f1_0%,_transparent_35%)] opacity-20"></div>
    </div>
  );
}