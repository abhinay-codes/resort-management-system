const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  ""

import {
  getToken,
  logout,
} from "@/services/authService"

/*
 * ==========================================
 * API ERROR
 * ==========================================
 *
 * A custom error lets us keep the HTTP status
 * available when a request fails.
 */

export class ApiError extends Error {
  constructor(
    message,
    status = null
  ) {
    super(message)

    this.name = "ApiError"
    this.status = status
  }
}


/*
 * ==========================================
 * READ ERROR MESSAGE
 * ==========================================
 *
 * Backend may return:
 *
 * {
 *   "message": "Something went wrong."
 * }
 *
 * It may also return a plain string.
 */

async function getResponseErrorMessage(
  response,
  fallbackMessage
) {
  const data =
    await response
      .json()
      .catch(() => null)

  if (
    data &&
    typeof data === "object" &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message.trim()
  }

  if (
    data &&
    typeof data === "object" &&
    typeof data.error === "string" &&
    data.error.trim()
  ) {
    return data.error.trim()
  }

  /*
   * Some validation responses may contain
   * multiple field-level errors.
   */

  if (
    data &&
    typeof data === "object" &&
    data.errors &&
    typeof data.errors === "object"
  ) {
    const messages =
      Object.values(data.errors)
        .filter(
          (value) =>
            typeof value === "string" &&
            value.trim()
        )

    if (messages.length > 0) {
      return messages.join(" ")
    }
  }

  if (
    typeof data === "string" &&
    data.trim()
  ) {
    return data.trim()
  }

  return fallbackMessage
}


/*
 * ==========================================
 * API REQUEST
 * ==========================================
 *
 * auth: true
 *     Adds the JWT Authorization header.
 *
 * auth: false
 *     Makes a public request.
 */

export async function apiRequest(
  url,
  options = {}
) {
  const {
    auth = false,
    headers = {},
    ...fetchOptions
  } = options

  const requestHeaders = {
    ...headers,
  }

  /*
   * Add JWT only when the endpoint requires
   * authentication.
   */

  if (auth) {
    const token = getToken()

    if (token) {
      requestHeaders.Authorization =
        `Bearer ${token}`
    }
  }

  let response

  try {
    response =
      await fetch(
        /^https?:\/\//i.test(url)
          ? url
          : `${API_BASE_URL}${url}`,
        {
          ...fetchOptions,
          headers: requestHeaders,
        }
      )
  } catch (error) {
    /*
     * fetch() throws when the browser cannot
     * reach the backend at all.
     */

    if (
      error instanceof TypeError
    ) {
      throw new ApiError(
        "Unable to connect to the server. Please make sure the backend is running and try again.",
        null
      )
    }

    throw new ApiError(
      "Something went wrong while connecting to the server.",
      null
    )
  }


  /*
   * ========================================
   * UNAUTHORIZED
   * ========================================
   *
   * Only authenticated requests should cause
   * the frontend session to be cleared.
   *
   * Public requests can legitimately return
   * 401/403 without having a logged-in session.
   */

  if (
    response.status === 401 &&
    auth
  ) {
    logout()

    /*
     * Send the user back to login.
     *
     * We use the browser location here because
     * this utility is outside React components.
     */

    if (
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login"
    }

    throw new ApiError(
      "Your session has expired. Please log in again.",
      401
    )
  }


  /*
   * ========================================
   * OTHER HTTP ERRORS
   * ========================================
   */

  if (!response.ok) {
    const message =
      await getResponseErrorMessage(
        response,
        "The request could not be completed. Please try again."
      )

    throw new ApiError(
      message,
      response.status
    )
  }


  /*
   * ========================================
   * SUCCESS RESPONSE
   * ========================================
   *
   * Some successful requests may not return
   * a body, so JSON parsing is optional.
   */

  if (response.status === 204) {
    return null
  }

  const contentType =
    response.headers.get(
      "content-type"
    )

  if (
    contentType &&
    contentType.includes(
      "application/json"
    )
  ) {
    return response.json()
  }

  return null
}


/*
 * ==========================================
 * AUTHENTICATED API CLIENT
 * ==========================================
 *
 * Operation services use this default client
 * for protected admin/employee endpoints.
 */

async function apiClient(
  url,
  options = {}
) {
  return apiRequest(
    url,
    {
      ...options,
      auth: true,
    }
  )
}

export default apiClient