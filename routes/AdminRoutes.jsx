import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import ArtikelAdmin from '../pages/ArtikelAdmin';
import KatalogAdmin from '../pages/KatalogAdmin';
import PetaAdmin from '../pages/PetaAdmin';
import KuisAdmin from '../pages/KuisAdmin';
import ForumAdmin from '../pages/ForumAdmin';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/admin/artikel" element={<ArtikelAdmin />} />
      <Route path="/admin/katalog" element={<KatalogAdmin />} />
      <Route path="/admin/peta" element={<PetaAdmin />} />
      <Route path="/admin/kuis" element={<KuisAdmin />} />
      <Route path="/admin/forum" element={<ForumAdmin />} />
    </Routes>
  );
}

export default AdminRoutes;