import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
} from "lucide-react"

import apiRequest from "@/services/apiClient"

function CustomerRegister() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError("")
    }

    if (success) {
      setSuccess("")
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) {
      return
    }

    setError("")
    setSuccess("")

    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const password = form.password
    const confirmPassword = form.confirmPassword

    // -----------------------------
    // CLIENT-SIDE VALIDATION
    // -----------------------------

    if (!name) {
      setError("Please enter your full name.")
      return
    }

    if (name.length > 100) {
      setError("Name must not exceed 100 characters.")
      return
    }

    if (!email) {
      setError("Please enter your email address.")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.")
      return
    }

    if (password.length > 72) {
      setError("Password must not exceed 72 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    // -----------------------------
    // REGISTER CUSTOMER
    // -----------------------------

    setLoading(true)

    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      console.log("Customer registration request completed successfully.")

      setSuccess(
        "Account created successfully. Redirecting to login..."
      )

      setForm({
        name: "",
        email,
        password: "",
        confirmPassword: "",
      })

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email,
          },
        })
      }, 800)
    } catch (err) {
      console.error("Customer registration failed:", err)

      setError(
        err?.message ||
          "Unable to create your account. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-81px)] bg-[#faf9f6] px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
          {/* HEADER */}

          <div className="px-6 pb-6 pt-8 text-center sm:px-8 sm:pt-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#193b28] text-white shadow-sm">
              <UserPlus className="h-5 w-5" />
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-gray-950">
              Create Your Account
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
              Create an account to manage your bookings and
              payments in one place.
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-6 pb-8 sm:px-8 sm:pb-10"
          >
            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{success}</span>
              </div>
            )}

            {/* NAME */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#193b28] focus:ring-2 focus:ring-[#193b28]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={255}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#193b28] focus:ring-2 focus:ring-[#193b28]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  maxLength={72}
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#193b28] focus:ring-2 focus:ring-[#193b28]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Use at least 8 characters.
              </p>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  maxLength={72}
                  disabled={loading}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#193b28] focus:ring-2 focus:ring-[#193b28]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#193b28] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12301f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* DIVIDER */}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400">
                  Already registered?
                </span>
              </div>
            </div>

            {/* LOGIN LINK */}

            <Link
              to="/login"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-900 transition hover:border-gray-300 hover:bg-gray-50"
            >
              Sign in to your account
            </Link>
          </form>
        </div>
      </div>
    </main>
  )
}

export default CustomerRegister