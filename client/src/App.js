import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PlantGallery from './pages/PlantGallery';
import PlantDetail from './pages/PlantDetail';
import MyPlants from './pages/MyPlants';
import Login from './pages/Login';
import Signup from './pages/Signup';              // ✅ add
import ProtectedRoute from './components/ProtectedRoute'; // ✅ add

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* public */}
        <Route path="/" element={<Home />} />
        <Route path="/plantgallery" element={<PlantGallery />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />   {/* ✅ new */}

        {/* protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-plants" element={<MyPlants />} />
          {/* add more protected pages here later */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
