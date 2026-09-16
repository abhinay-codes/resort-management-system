import { useState } from "react"

import {
  useLocation,
  useNavigate,
} from "react-router-dom"

import {
  isAuthenticated,
  getRole,
  logout,
} from "@/services/authService"


function Navbar() {

  const navigate = useNavigate()

  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)


  const authenticated =
    isAuthenticated()

  const role =
    getRole()


  function handleNavigate(path) {

    navigate(path)

    setMobileMenuOpen(false)
  }


  function handleLogout() {

    logout()

    setMobileMenuOpen(false)

    navigate("/login")
  }


  function getNavLinkClass(path) {

    const isActive =
      location.pathname === path

    return `
      text-sm font-medium transition
      ${
        isActive
          ? "text-black"
          : "text-gray-600 hover:text-black"
      }
    `
  }


  function getMobileNavClass(path) {

    const isActive =
      location.pathname === path

    return `
      border-b px-2 py-3 text-left text-sm font-medium
      ${
        isActive
          ? "text-black"
          : "text-gray-700 hover:text-black"
      }
    `
  }


  return (

    <nav className="border-b bg-white">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

        {/* BRAND */}

        <button
          type="button"
          onClick={() =>
            handleNavigate("/")
          }
          className="text-lg font-bold sm:text-xl"
        >
          Paradise Resort
        </button>


        {/* DESKTOP NAVIGATION */}

        <div className="hidden items-center gap-6 md:flex">

          <button
            type="button"
            onClick={() =>
              handleNavigate("/")
            }
            className={getNavLinkClass("/")}
          >
            Home
          </button>


          <button
            type="button"
            onClick={() =>
              handleNavigate("/rooms")
            }
            className={getNavLinkClass("/rooms")}
          >
            Rooms
          </button>


          <button
            type="button"
            onClick={() =>
              handleNavigate("/booking")
            }
            className={getNavLinkClass("/booking")}
          >
            Book Now
          </button>


          {/* PUBLIC BOOKING LOOKUP */}

          <button
            type="button"
            onClick={() =>
              handleNavigate("/booking-lookup")
            }
            className={getNavLinkClass(
              "/booking-lookup"
            )}
          >
            My Booking
          </button>


          {authenticated && (

            <>

              {/* CUSTOMER */}

              {role === "CUSTOMER" && (

                <>

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate("/customer")
                    }
                    className={getNavLinkClass(
                      "/customer"
                    )}
                  >
                    Dashboard
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/customer/payments"
                      )
                    }
                    className={getNavLinkClass(
                      "/customer/payments"
                    )}
                  >
                    Payments
                  </button>

                </>

              )}


              {/* ADMIN */}

              {role === "ADMIN" && (

                <>

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/admin/bookings"
                      )
                    }
                    className={getNavLinkClass(
                      "/admin/bookings"
                    )}
                  >
                    Admin
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/admin/rooms"
                      )
                    }
                    className={getNavLinkClass(
                      "/admin/rooms"
                    )}
                  >
                    Rooms
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/admin/employees"
                      )
                    }
                    className={getNavLinkClass(
                      "/admin/employees"
                    )}
                  >
                    Employees
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/admin/payments"
                      )
                    }
                    className={getNavLinkClass(
                      "/admin/payments"
                    )}
                  >
                    Payments
                  </button>

                </>

              )}


              {/* EMPLOYEE */}

              {role === "EMPLOYEE" && (

                <>

                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate("/employee")
                    }
                    className={getNavLinkClass(
                      "/employee"
                    )}
                  >
                    Bookings
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/employee/guests"
                      )
                    }
                    className={getNavLinkClass(
                      "/employee/guests"
                    )}
                  >
                    Guests
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/employee/housekeeping"
                      )
                    }
                    className={getNavLinkClass(
                      "/employee/housekeeping"
                    )}
                  >
                    Housekeeping
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/employee/maintenance"
                      )
                    }
                    className={getNavLinkClass(
                      "/employee/maintenance"
                    )}
                  >
                    Maintenance
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      handleNavigate(
                        "/employee/dashboard"
                      )
                    }
                    className={getNavLinkClass(
                      "/employee/dashboard"
                    )}
                  >
                    Dashboard
                  </button>

                </>

              )}


              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
              >
                Logout
              </button>

            </>

          )}


          {!authenticated && (

            <button
              type="button"
              onClick={() =>
                handleNavigate("/login")
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
            >
              Login
            </button>

          )}

        </div>


        {/* MOBILE MENU BUTTON */}

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              (previous) =>
                !previous
            )
          }
          className="rounded-lg border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
          aria-label={
            mobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
        >

          {mobileMenuOpen ? (

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>

          ) : (

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>

          )}

        </button>

      </div>


      {/* MOBILE NAVIGATION */}

      {mobileMenuOpen && (

        <div className="border-t bg-white md:hidden">

          <div className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">

            <button
              type="button"
              onClick={() =>
                handleNavigate("/")
              }
              className={getMobileNavClass("/")}
            >
              Home
            </button>


            <button
              type="button"
              onClick={() =>
                handleNavigate("/rooms")
              }
              className={getMobileNavClass(
                "/rooms"
              )}
            >
              Rooms
            </button>


            <button
              type="button"
              onClick={() =>
                handleNavigate("/booking")
              }
              className={getMobileNavClass(
                "/booking"
              )}
            >
              Book Now
            </button>


            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "/booking-lookup"
                )
              }
              className={getMobileNavClass(
                "/booking-lookup"
              )}
            >
              My Booking
            </button>


            {authenticated && (

              <>

                {/* CUSTOMER */}

                {role === "CUSTOMER" && (

                  <>

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/customer"
                        )
                      }
                      className={getMobileNavClass(
                        "/customer"
                      )}
                    >
                      Dashboard
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/customer/payments"
                        )
                      }
                      className={getMobileNavClass(
                        "/customer/payments"
                      )}
                    >
                      Payments
                    </button>

                  </>

                )}


                {/* ADMIN */}

                {role === "ADMIN" && (

                  <>

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/admin/bookings"
                        )
                      }
                      className={getMobileNavClass(
                        "/admin/bookings"
                      )}
                    >
                      Admin
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/admin/rooms"
                        )
                      }
                      className={getMobileNavClass(
                        "/admin/rooms"
                      )}
                    >
                      Rooms
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/admin/employees"
                        )
                      }
                      className={getMobileNavClass(
                        "/admin/employees"
                      )}
                    >
                      Employees
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/admin/payments"
                        )
                      }
                      className={getMobileNavClass(
                        "/admin/payments"
                      )}
                    >
                      Payments
                    </button>

                  </>

                )}


                {/* EMPLOYEE */}

                {role === "EMPLOYEE" && (

                  <>

                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/employee"
                        )
                      }
                      className={getMobileNavClass(
                        "/employee"
                      )}
                    >
                      Bookings
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/employee/guests"
                        )
                      }
                      className={getMobileNavClass(
                        "/employee/guests"
                      )}
                    >
                      Guests
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/employee/housekeeping"
                        )
                      }
                      className={getMobileNavClass(
                        "/employee/housekeeping"
                      )}
                    >
                      Housekeeping
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/employee/maintenance"
                        )
                      }
                      className={getMobileNavClass(
                        "/employee/maintenance"
                      )}
                    >
                      Maintenance
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        handleNavigate(
                          "/employee/dashboard"
                        )
                      }
                      className={getMobileNavClass(
                        "/employee/dashboard"
                      )}
                    >
                      Dashboard
                    </button>

                  </>

                )}


                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
                >
                  Logout
                </button>

              </>

            )}


            {!authenticated && (

              <button
                type="button"
                onClick={() =>
                  handleNavigate("/login")
                }
                className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100"
              >
                Login
              </button>

            )}

          </div>

        </div>

      )}

    </nav>
  )
}


export default Navbar