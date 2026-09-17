import { Navigate } from "react-router-dom"

import {
  isAuthenticated,
  getRole,
} from "@/services/authService"


function ProtectedRoute({
  children,
  allowedRoles,
}) {

  /*
   * ==========================================
   * STEP 1 — AUTHENTICATION CHECK
   * ==========================================
   *
   * If there is no JWT token, the user is not
   * logged in.
   *
   * Send them to the login page.
   */

  if (!isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }


  /*
   * ==========================================
   * STEP 2 — ROLE CHECK
   * ==========================================
   *
   * The user is authenticated.
   *
   * Now make sure their actual role matches
   * the role required by this route.
   */

  const currentRole = getRole()


  /*
   * If this route requires one or more roles
   * and the logged-in user's role is not allowed,
   * deny access.
   */

  if (
    Array.isArray(allowedRoles) &&
    !allowedRoles.includes(currentRole)
  ) {

    /*
     * Send the user to their own dashboard.
     */

    if (currentRole === "ADMIN") {
      return (
        <Navigate
          to="/admin/bookings"
          replace
        />
      )
    }


    if (currentRole === "EMPLOYEE") {
      return (
        <Navigate
          to="/employee"
          replace
        />
      )
    }


    if (currentRole === "CUSTOMER") {
      return (
        <Navigate
          to="/customer"
          replace
        />
      )
    }


    /*
     * Unknown or invalid role.
     */

    return (
      <Navigate
        to="/"
        replace
      />
    )
  }


  /*
   * ==========================================
   * STEP 3 — ACCESS GRANTED
   * ==========================================
   *
   * Authentication passed.
   *
   * Role also passed.
   *
   * Render the requested page.
   */

  return children
}


export default ProtectedRoute
