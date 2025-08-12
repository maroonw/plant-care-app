import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import PlantGallery from './pages/PlantGallery';
import PlantDetail from './pages/PlantDetail';
import MyPlants from './pages/MyPlants';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AdminPlantsList from './pages/admin/AdminPlantsList';
import AdminPlantForm from './pages/admin/AdminPlantForm';
import AdminPlantImages from './pages/admin/AdminPlantImages';

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
        <Route path="/signup" element={<Signup />} />

        {/* protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-plants" element={<MyPlants />} />
        </Route>

        {/* admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/plants" element={<AdminPlantsList />} />
          <Route path="/admin/plants/new" element={<AdminPlantForm />} />
          <Route path="/admin/plants/:id/edit" element={<AdminPlantForm />} />
          <Route path="/admin/plants/:id/images" element={<AdminPlantImages />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
