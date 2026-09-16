import { BrowserRouter, Routes, Route } from "react-router-dom"

import Navbar from "@/components/layout/Navbar"

import Home from "@/pages/Home"
import Rooms from "@/pages/Rooms"
import RoomDetails from "@/pages/RoomDetails"
import Booking from "@/pages/Booking"
import BookingDetails from "@/pages/BookingDetails"
import BookingLookup from "@/pages/BookingLookup"
import Login from "@/pages/Login"
import CustomerRegister from "@/pages/CustomerRegister"

import CustomerDashboard from "@/pages/CustomerDashboard"
import CustomerBookingDetails from "@/pages/CustomerBookingDetails"
import CustomerPayments from "@/pages/CustomerPayments"

import AdminBookings from "@/pages/AdminBookings"
import AdminRooms from "@/pages/AdminRooms"
import AdminEmployees from "@/pages/AdminEmployees"
import AdminPayments from "@/pages/AdminPayments"

import EmployeeHome from "@/pages/EmployeeHome"

import OperationsDashboard from "@/pages/operations/OperationsDashboard"
import Housekeeping from "@/pages/operations/Housekeeping"
import Maintenance from "@/pages/operations/Maintenance"
import GuestSearch from "@/pages/operations/GuestSearch"
import EmployeeHousekeeping from "@/pages/operations/EmployeeHousekeeping"
import EmployeeMaintenance from "@/pages/operations/EmployeeMaintenance"

import PublicBookingDetails from "@/pages/public/PublicBookingDetails"

import ProtectedRoute from "@/components/auth/ProtectedRoute"

import "./App.css"


function App() {

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* =========================================
            PUBLIC ROUTES
        ========================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/rooms"
          element={<Rooms />}
        />

        <Route
          path="/rooms/:id"
          element={<RoomDetails />}
        />

        <Route
          path="/booking"
          element={<Booking />}
        />

        <Route
          path="/booking/:id"
          element={<PublicBookingDetails />}
        />

        <Route
          path="/booking-lookup"
          element={<BookingLookup />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<CustomerRegister />}
        />


        {/* =========================================
            CUSTOMER
        ========================================= */}

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/bookings/:id"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerBookingDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/payments"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerPayments />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - BOOKINGS
        ========================================= */}

        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - ROOMS
        ========================================= */}

        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminRooms />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - EMPLOYEES
        ========================================= */}

        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminEmployees />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - PAYMENTS
        ========================================= */}

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - OPERATIONS DASHBOARD
        ========================================= */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <OperationsDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - HOUSEKEEPING
        ========================================= */}

        <Route
          path="/admin/housekeeping"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Housekeeping />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - MAINTENANCE
        ========================================= */}

        <Route
          path="/admin/maintenance"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Maintenance />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN - GUEST SEARCH
        ========================================= */}

        <Route
          path="/admin/guests"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <GuestSearch />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            EMPLOYEE - HOME / BOOKINGS
        ========================================= */}

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeHome />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            EMPLOYEE - GUEST SEARCH
        ========================================= */}

        <Route
          path="/employee/guests"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <GuestSearch />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            EMPLOYEE - HOUSEKEEPING
        ========================================= */}

        <Route
          path="/employee/housekeeping"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeHousekeeping />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            EMPLOYEE - MAINTENANCE
        ========================================= */}

        <Route
          path="/employee/maintenance"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeMaintenance />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            EMPLOYEE - OPERATIONS DASHBOARD
        ========================================= */}

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <OperationsDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/operations"
          element={
            <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
              <OperationsDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            ADMIN + EMPLOYEE BOOKING DETAILS
        ========================================= */}

        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "EMPLOYEE"]}
            >
              <BookingDetails />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            PUBLIC / LEGACY BOOKING DETAILS
        ========================================= */}

        <Route
          path="/booking-details/:id"
          element={<PublicBookingDetails />}
        />


        {/* =========================================
            FALLBACK
        ========================================= */}

        <Route
          path="*"
          element={<Home />}
        />

      </Routes>

    </BrowserRouter>
  )
}


export default App