const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  ""

const TOKEN_KEY =
  "resort_auth_token"

const ROLE_KEY =
  "resort_user_role"


export function saveToken(token) {

  localStorage.setItem(
    TOKEN_KEY,
    token
  )

}


export function getToken() {

  return localStorage.getItem(
    TOKEN_KEY
  )

}


export function saveRole(role) {

  localStorage.setItem(
    ROLE_KEY,
    role
  )

}


export function getRole() {

  return localStorage.getItem(
    ROLE_KEY
  )

}


export function removeToken() {

  localStorage.removeItem(
    TOKEN_KEY
  )

}


export function removeRole() {

  localStorage.removeItem(
    ROLE_KEY
  )

}


export function isAuthenticated() {

  return Boolean(
    getToken()
  )

}


export async function login(
  email,
  password
) {

  let response


  try {

    response =
      await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim(),
            password,
          }),
        }
      )

  } catch (error) {

    if (
      error instanceof TypeError
    ) {

      throw new Error(
        "Unable to connect to the server. Please make sure the backend is running and try again.",
        { cause: error }
      )

    }

    throw new Error(
      "Something went wrong while connecting to the server.",
      { cause: error }
    )

  }


  const data =
    await response
      .json()
      .catch(() => null)


  if (!response.ok) {

    if (
      data &&
      typeof data === "object" &&
      typeof data.message === "string" &&
      data.message.trim()
    ) {

      throw new Error(
        data.message.trim()
      )

    }


    if (
      typeof data === "string" &&
      data.trim()
    ) {

      throw new Error(
        data.trim()
      )

    }


    throw new Error(
      "Invalid email or password."
    )

  }


  /*
   * Validate the expected login response.
   *
   * We still DO NOT save the token here.
   *
   * Login.jsx must first verify that the
   * selected login type matches the actual
   * backend role.
   */

  if (
    !data ||
    typeof data !== "object" ||
    typeof data.token !== "string" ||
    typeof data.role !== "string"
  ) {

    throw new Error(
      "The server returned an invalid login response."
    )

  }


  return data

}


export function logout() {

  removeToken()
  removeRole()

}