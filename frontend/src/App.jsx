import React from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CustomerDetails from "./pages/Customer";
import Bookings from "./pages/Bookings";
import AddBookings from "./pages/AddBookings";

import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customers" element={<CustomerDetails />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="addbooking" element={<AddBookings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
