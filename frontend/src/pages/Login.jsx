import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
  login,
  saveToken,
  saveRole,
} from "@/services/authService"

import { Button } from "@/components/ui/button"

function Login() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const [loginType, setLoginType] =
    useState("CUSTOMER")

  const [email, setEmail] =
    useState(
      location.state?.email || ""
    )

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  const [registeredMessage] =
    useState(
      location.state?.registered
        ? "Account created successfully. You can now sign in."
        : ""
    )

  async function handleSubmit(event) {
    event.preventDefault()

    if (loading) {
      return
    }

    try {
      setLoading(true)
      setError("")

      const data =
        await login(
          email,
          password
        )

      if (
        data.role !== loginType
      ) {
        setError(
          `This account is registered as ${data.role}, not ${loginType}.`
        )

        return
      }

      saveToken(
        data.token
      )

      saveRole(
        data.role
      )

      if (
        data.role === "ADMIN"
      ) {
        navigate(
          "/admin/bookings",
          {
            replace: true,
          }
        )
      } else if (
        data.role === "EMPLOYEE"
      ) {
        navigate(
          "/employee",
          {
            replace: true,
          }
        )
      } else if (
        data.role === "CUSTOMER"
      ) {
        navigate(
          "/customer",
          {
            replace: true,
          }
        )
      } else {
        navigate(
          "/",
          {
            replace: true,
          }
        )
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-12 sm:px-6 sm:py-20">

      <div className="mx-auto max-w-md">

        <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">

          {/* HEADER */}

          <div className="text-center">

            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Paradise Resort
            </p>

            <h1 className="mt-4 text-3xl font-bold tracking-tight">
              Welcome Back
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sign in to manage your Paradise Resort account.
            </p>

          </div>

          {/* LOGIN TYPE */}

          <div className="mt-8 grid grid-cols-3 gap-2">

            <button
              type="button"
              onClick={() => {
                setLoginType("CUSTOMER")
                setError("")
              }}
              disabled={loading}
              className={`rounded-xl border px-2 py-3 text-xs font-semibold transition sm:text-sm ${
                loginType === "CUSTOMER"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType("ADMIN")
                setError("")
              }}
              disabled={loading}
              className={`rounded-xl border px-2 py-3 text-xs font-semibold transition sm:text-sm ${
                loginType === "ADMIN"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginType("EMPLOYEE")
                setError("")
              }}
              disabled={loading}
              className={`rounded-xl border px-2 py-3 text-xs font-semibold transition sm:text-sm ${
                loginType === "EMPLOYEE"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Employee
            </button>

          </div>

          {/* REGISTERED MESSAGE */}

          {registeredMessage && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary"
            >
              {registeredMessage}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            {/* EMAIL */}

            <div>

              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-semibold"
              >
                {loginType === "CUSTOMER"
                  ? "Email Address"
                  : `${loginType === "ADMIN" ? "Admin" : "Employee"} Email`}
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                autoComplete="email"
                placeholder={
                  loginType === "CUSTOMER"
                    ? "you@example.com"
                    : loginType === "ADMIN"
                      ? "admin@paradiseresort.com"
                      : "employee@example.com"
                }
                className="min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                className="min-h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

            </div>

            {/* SUBMIT */}

            <Button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                !password
              }
              className="min-h-11 w-full rounded-xl"
            >
              {loading
                ? "Signing In..."
                : `Sign In as ${loginType}`}
            </Button>

          </form>

          {/* CUSTOMER REGISTRATION */}

          {loginType === "CUSTOMER" && (
            <div className="mt-7 border-t border-border pt-6 text-center">

              <p className="text-sm text-muted-foreground">
                Don't have a customer account?
              </p>

              <Link
                to="/register"
                className="mt-2 inline-block text-sm font-semibold text-foreground underline-offset-4 hover:underline"
              >
                Create an account
              </Link>

            </div>
          )}

        </div>

      </div>

    </main>
  )
}

export default Login