import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import Categories from "./components/Categories";
import BestSelling from "./components/BestSelling";
import NewLaunches from "./components/NewLaunches";
import BrandStory from "./components/BrandStory";
import Footer from "./components/Footer";
import RecommendationsCarousel from "./components/RecommendationsCarousel";
import SuggestionNotification from "./components/SuggestionNotification";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AIRecommendations from "./pages/AIRecommendations";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import RoomPlanner from "./pages/RoomPlanner";
import AboutUs from "./pages/AboutUs";
import OurStores from "./pages/OurStores";
import ContactUs from "./pages/ContactUs";
import ReturnPolicy from "./pages/ReturnPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { Toaster } from "./components/ui/toaster";

// Admin Imports
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import SystemSettings from './pages/admin/SystemSettings';
import AdminLogin from "./pages/admin/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import RecommendationRules from './pages/admin/RecommendationRules';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <Features />
      <Categories />
      <BestSelling />
      <NewLaunches />
      <BrandStory />
      <SuggestionNotification />
      <Footer />
    </div>
  );
};

function App() {
  const isAdminPort = window.location.port === '4030';

  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={isAdminPort ? <Navigate to="/admin" replace /> : <Home />} />
                <Route path="/login" element={isAdminPort ? <Navigate to="/admin/login" replace /> : <Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/ai-recommendations" element={<AIRecommendations />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/products" element={<ProductListing />} />
                <Route path="/category/:categoryName" element={<ProductListing />} />
                <Route path="/search" element={<ProductListing />} />
                <Route path="/product/:productId" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/room-planner" element={<RoomPlanner />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/our-stores" element={<OurStores />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="analytics" element={<AnalyticsDashboard />} />
                    <Route path="recommendation-rules" element={<RecommendationRules />} />
                    <Route path="settings" element={<SystemSettings />} />
                    <Route path="users" element={<UserManagement />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
