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
import AdminModeration from './pages/admin/AdminModeration';
import BlogIndex from './pages/BlogIndex';
import CareIndex from './pages/CareIndex';
import BlogPost from './pages/BlogPost';
import CarePost from './pages/CarePost';
import AdminContentAssets from './pages/admin/AdminContentAssets';
import MyWishlist from './pages/MyWishlist';

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
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/care" element={<CareIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/care/:slug" element={<CarePost />} />

        {/* protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-plants" element={<MyPlants />} />
          <Route path="/my-wishlist" element={<MyWishlist />} />
        </Route>

        {/* admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/plants" element={<AdminPlantsList />} />
          <Route path="/admin/plants/new" element={<AdminPlantForm />} />
          <Route path="/admin/plants/:id/edit" element={<AdminPlantForm />} />
          <Route path="/admin/plants/:id/images" element={<AdminPlantImages />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/content-assets" element={<AdminContentAssets />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
