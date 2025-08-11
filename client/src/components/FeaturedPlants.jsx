import React from 'react';

const plants = [
  {
    name: 'Snake Plant',
    description: 'Low maintenance, air-purifying, and tough to kill.',
    image: '/images/snake-plant.jpg',
  },
  {
    name: 'Pothos',
    description: 'Fast-growing and great for beginners.',
    image: '/images/pothos.jpg',
  },
  {
    name: 'ZZ Plant',
    description: 'Thrives on neglect and low light.',
    image: '/images/zz-plant.jpg',
  },
];

const FeaturedPlants = () => {
  return (
    <section className="py-16 px-6 bg-green-50 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-12">
        Featured Plants
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {plants.map((plant, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition">
            <img
              src={plant.image}
              alt={plant.name}
              className="w-full h-56 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-semibold text-green-800">{plant.name}</h3>
            <p className="text-gray-600">{plant.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPlants;
