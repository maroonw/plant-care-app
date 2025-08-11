import React from 'react';
import { Leaf, Sun, Droplet } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section className="py-16 px-6 bg-white text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-12">
        How EasyHouseplant Works
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
        <div className="flex flex-col items-center">
          <Leaf className="w-12 h-12 text-green-700 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Pick Your Plant</h3>
          <p className="text-gray-600">
            Browse curated plants for every skill level and home environment.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Sun className="w-12 h-12 text-yellow-600 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Track with Ease</h3>
          <p className="text-gray-600">
            Add plants to your dashboard and stay on top of watering, sunlight, and care.
          </p>
        </div>

        <div className="flex flex-col items-center">
          <Droplet className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Watch It Grow</h3>
          <p className="text-gray-600">
            Use reminders and progress tracking to watch your plants thrive.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
