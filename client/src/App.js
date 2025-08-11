import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import './index.css'; // Assuming Tailwind is set up here

import PlantGallery from './pages/PlantGallery';
import PlantDetail from './pages/PlantDetail';
import Login from './pages/Login';
import MyPlants from './pages/MyPlants';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plantgallery" element={<PlantGallery />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/my-plants" element={<MyPlants />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;


