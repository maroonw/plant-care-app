import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import './index.css'; // Assuming Tailwind is set up here

import PlantGallery from './pages/PlantGallery';
import PlantDetail from './pages/PlantDetail';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plantgallery" element={<PlantGallery />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;


