import React from 'react';

const Hero = () => {
  return (
    <section className="bg-green-100 py-16 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-4">
          Welcome to EasyHouseplant.com
        </h1>
        <p className="text-lg md:text-xl text-green-800 mb-6">
          Where healthy plants and happy homes grow together.
        </p>
        <a
          href="#get-started"
          className="inline-block bg-green-700 hover:bg-green-800 text-white text-lg font-semibold px-6 py-3 rounded-full shadow-md transition"
        >
          Get Started
        </a>
      </div>

      <div className="mt-12 flex justify-center">
        <img
          src="/images/random_plant.jpg"
          alt="Lush indoor plant in ceramic pot"
          className="rounded-xl shadow-lg max-h-96"
        />
      </div>
    </section>
  );
};

export default Hero;
