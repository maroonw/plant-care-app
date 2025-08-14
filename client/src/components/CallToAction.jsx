import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="bg-green-700 text-white py-16 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Grow Your Plant Family?
        </h2>
        <p className="text-lg md:text-xl mb-8">
          Explore our curated collection of easy-care houseplants and find your next leafy friend.
        </p>
        <Link to="/plantgallery" className="bg-white text-green-800 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition">
          Browse All Plants
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
