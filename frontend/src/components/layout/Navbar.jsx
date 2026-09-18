import { useState, useEffect } from "react"
import { Bell, Menu, X, Search, User, LogOut } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { isAuthenticated, getRole, logout } from "@/services/authService"
import { notificationService } from "@/services/notificationService"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  const authenticated = isAuthenticated()
  const role = getRole()

  const isHome = location.pathname === "/"

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (authenticated && role === "CUSTOMER") {
      notificationService.getUnreadCount()
        .then(res => setUnreadCount(res.count))
        .catch(console.error)
    }
  }, [authenticated, role, location.pathname]);

  function handleNavigate(path) {
    navigate(path)
    setMobileMenuOpen(false)
  }

  function handleLogout() {
    logout()
    setMobileMenuOpen(false)
    navigate("/login")
  }

  // If on home page and not scrolled, navbar text should be white and background transparent
  const isTransparent = isHome && !scrolled && !mobileMenuOpen

  const navClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isTransparent
      ? "bg-transparent text-white"
      : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm text-foreground"
  }`

  function getNavLinkClass(path) {
    const isActive = location.pathname === path
    return `text-sm font-medium tracking-wide transition-colors ${
      isActive
        ? (isTransparent ? "text-white" : "text-primary")
        : (isTransparent ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground")
    }`
  }

  function getMobileNavClass(path) {
    const isActive = location.pathname === path
    return `block w-full text-left px-4 py-3 text-lg font-medium tracking-wide transition-colors ${
      isActive ? "text-primary bg-primary/5" : "text-foreground/80 hover:bg-muted"
    }`
  }

  return (
    <>
      <nav className={navClass}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* BRAND */}
          <button type="button" onClick={() => handleNavigate("/")} className="text-xl font-semibold tracking-tight uppercase">
            Paradise Resort
          </button>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex lg:gap-x-8 items-center">
            <button type="button" onClick={() => handleNavigate("/")} className={getNavLinkClass("/")}>Home</button>
            <button type="button" onClick={() => handleNavigate("/rooms")} className={getNavLinkClass("/rooms")}>Rooms</button>
            <button type="button" onClick={() => handleNavigate("/booking-lookup")} className={getNavLinkClass("/booking-lookup")}>My Booking</button>

            {authenticated && role === "CUSTOMER" && (
              <>
                <button type="button" onClick={() => handleNavigate("/customer")} className={getNavLinkClass("/customer")}>Dashboard</button>
                <button type="button" onClick={() => handleNavigate("/customer/payments")} className={getNavLinkClass("/customer/payments")}>Payments</button>
              </>
            )}

            {authenticated && role === "ADMIN" && (
              <>
                <button type="button" onClick={() => handleNavigate("/admin/bookings")} className={getNavLinkClass("/admin/bookings")}>Admin</button>
                <button type="button" onClick={() => handleNavigate("/admin/rooms")} className={getNavLinkClass("/admin/rooms")}>Rooms</button>
                <button type="button" onClick={() => handleNavigate("/admin/employees")} className={getNavLinkClass("/admin/employees")}>Employees</button>
                <button type="button" onClick={() => handleNavigate("/admin/analytics")} className={getNavLinkClass("/admin/analytics")}>Analytics</button>
              </>
            )}

            {authenticated && role === "EMPLOYEE" && (
              <>
                <button type="button" onClick={() => handleNavigate("/employee")} className={getNavLinkClass("/employee")}>Bookings</button>
                <button type="button" onClick={() => handleNavigate("/employee/housekeeping")} className={getNavLinkClass("/employee/housekeeping")}>Housekeeping</button>
                <button type="button" onClick={() => handleNavigate("/employee/dashboard")} className={getNavLinkClass("/employee/dashboard")}>Dashboard</button>
              </>
            )}
          </div>

          <div className="hidden lg:flex lg:items-center lg:gap-x-4">
            {authenticated && role === "CUSTOMER" && (
              <button
                type="button"
                onClick={() => handleNavigate("/customer/notifications")}
                className={`relative p-2 rounded-full transition-colors ${isTransparent ? "hover:bg-white/10" : "hover:bg-muted"}`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white transform translate-x-1/2 -translate-y-1/2 bg-destructive rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {authenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className={`p-2 rounded-full transition-colors ${isTransparent ? "hover:bg-white/10" : "hover:bg-muted"}`}
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavigate("/login")}
                className={`p-2 rounded-full transition-colors ${isTransparent ? "hover:bg-white/10" : "hover:bg-muted"}`}
                title="Sign In"
              >
                <User className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavigate("/booking")}
              className={`px-5 py-2 text-sm font-medium tracking-wide transition-all uppercase ${
                isTransparent
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              Book Now
            </button>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => handleNavigate("/booking")}
              className={`px-4 py-2 text-xs font-medium tracking-wide uppercase transition-all ${
                isTransparent
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              Book
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`p-2 -m-2 transition-colors ${isTransparent ? "text-white" : "text-foreground"}`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE NAV DRAWER */}
      <div className={`fixed inset-0 z-[100] transform transition-transform duration-300 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className="absolute inset-y-0 right-0 w-4/5 max-w-sm bg-background shadow-2xl flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <span className="text-lg font-semibold uppercase tracking-widest">Menu</span>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-2 -m-2 text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 py-4 flex flex-col">
            <button type="button" onClick={() => handleNavigate("/")} className={getMobileNavClass("/")}>Home</button>
            <button type="button" onClick={() => handleNavigate("/rooms")} className={getMobileNavClass("/rooms")}>Rooms</button>
            <button type="button" onClick={() => handleNavigate("/booking")} className={getMobileNavClass("/booking")}>Book Now</button>
            <button type="button" onClick={() => handleNavigate("/booking-lookup")} className={getMobileNavClass("/booking-lookup")}>My Booking</button>

            {authenticated && role === "CUSTOMER" && (
              <>
                <div className="px-4 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</div>
                <button type="button" onClick={() => handleNavigate("/customer")} className={getMobileNavClass("/customer")}>Dashboard</button>
                <button type="button" onClick={() => handleNavigate("/customer/payments")} className={getMobileNavClass("/customer/payments")}>Payments</button>
                <button type="button" onClick={() => handleNavigate("/customer/notifications")} className={getMobileNavClass("/customer/notifications")}>
                  Notifications {unreadCount > 0 && <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">{unreadCount}</span>}
                </button>
              </>
            )}

            {authenticated && role === "ADMIN" && (
              <>
                <div className="px-4 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</div>
                <button type="button" onClick={() => handleNavigate("/admin/bookings")} className={getMobileNavClass("/admin/bookings")}>Admin</button>
                <button type="button" onClick={() => handleNavigate("/admin/rooms")} className={getMobileNavClass("/admin/rooms")}>Rooms</button>
                <button type="button" onClick={() => handleNavigate("/admin/employees")} className={getMobileNavClass("/admin/employees")}>Employees</button>
                <button type="button" onClick={() => handleNavigate("/admin/payments")} className={getMobileNavClass("/admin/payments")}>Payments</button>
                <button type="button" onClick={() => handleNavigate("/admin/analytics")} className={getMobileNavClass("/admin/analytics")}>Analytics</button>
              </>
            )}

            {authenticated && role === "EMPLOYEE" && (
              <>
                <div className="px-4 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</div>
                <button type="button" onClick={() => handleNavigate("/employee")} className={getMobileNavClass("/employee")}>Bookings</button>
                <button type="button" onClick={() => handleNavigate("/employee/guests")} className={getMobileNavClass("/employee/guests")}>Guests</button>
                <button type="button" onClick={() => handleNavigate("/employee/housekeeping")} className={getMobileNavClass("/employee/housekeeping")}>Housekeeping</button>
                <button type="button" onClick={() => handleNavigate("/employee/maintenance")} className={getMobileNavClass("/employee/maintenance")}>Maintenance</button>
                <button type="button" onClick={() => handleNavigate("/employee/dashboard")} className={getMobileNavClass("/employee/dashboard")}>Dashboard</button>
              </>
            )}
          </div>

          <div className="p-6 border-t border-border mt-auto">
            {authenticated ? (
              <button type="button" onClick={handleLogout} className="flex items-center gap-2 w-full justify-center px-4 py-3 text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : (
              <button type="button" onClick={() => handleNavigate("/login")} className="flex items-center gap-2 w-full justify-center px-4 py-3 text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors">
                <User className="h-4 w-4" /> Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
