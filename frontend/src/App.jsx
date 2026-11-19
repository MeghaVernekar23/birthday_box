import React from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BookNow from "./pages/BookNow";
import PublicBooking from "./pages/PublicBooking";
import Menu from "./pages/Menu";
import ScheduledMessages from "./pages/ScheduledMessages";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/Customer";
import TodaysBookings from "./pages/TodaysBookings";
import UpcomingBookings from "./pages/UpcomingBookings";
import OlderBookings from "./pages/OlderBookings";
import AddBookings from "./pages/AddBookings";
import Packages from "./pages/Packages";

import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// 3D venue tour: loaded only when /tour is opened, so Three.js stays out of the main bundle
const ShopTour = lazy(() => import("./pages/ShopTour"));

// Start each new page at the top (the router otherwise keeps the previous
// page's scroll position, e.g. /menu opened halfway down from the home page).
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // "instant" so Bootstrap's smooth scrolling doesn't animate the jump
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/booknow" element={<BookNow />} />
        <Route path="/booking/:token" element={<PublicBooking />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/tour" element={<Suspense fallback={null}><ShopTour /></Suspense>} />

        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerDetails />} />
          <Route path="/bookings/today" element={<TodaysBookings />} />
          <Route path="/bookings/upcoming" element={<UpcomingBookings />} />
          <Route path="/bookings/older" element={<OlderBookings />} />
          <Route path="addbooking" element={<AddBookings />} />
          <Route path="packages" element={<Packages />} />
          <Route path="scheduled-messages" element={<ScheduledMessages />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
