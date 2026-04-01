import React from "react";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/Customer";
import TodaysBookings from "./pages/TodaysBookings";
import UpcomingBookings from "./pages/UpcomingBookings";
import OlderBookings from "./pages/OlderBookings";
import AddBookings from "./pages/AddBookings";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerDetails />} />
          <Route path="/bookings/today" element={<TodaysBookings />} />
          <Route path="/bookings/upcoming" element={<UpcomingBookings />} />
          <Route path="/bookings/older" element={<OlderBookings />} />
          <Route path="addbooking" element={<AddBookings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
