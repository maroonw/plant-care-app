// src/pages/Home.jsx
import React from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import FeaturedPlants from '../components/FeaturedPlants';
import CallToAction from '../components/CallToAction';

const Home = () => {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <FeaturedPlants />
      <CallToAction />
    </div>
  );
};

export default Home;
