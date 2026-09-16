import {
  apiRequest,
} from "@/services/apiClient"


const API_URL =
  "/api/admin/users"


/*
 * ==========================================
 * GET ALL USERS
 * ==========================================
 */

export async function getUsers() {

  return apiRequest(
    API_URL,
    {
      auth: true,

      fallbackMessage:
        "Failed to fetch users.",
    }
  )

}


/*
 * ==========================================
 * CREATE EMPLOYEE
 * ==========================================
 */

export async function createEmployee(
  employeeData
) {

  return apiRequest(
    API_URL,
    {
      method: "POST",

      auth: true,

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(
          employeeData
        ),

      fallbackMessage:
        "Failed to create employee.",
    }
  )

}


/*
 * ==========================================
 * ENABLE / DISABLE USER
 * ==========================================
 */

export async function updateUserEnabled(
  id,
  enabled
) {

  const params =
    new URLSearchParams({
      enabled:
        String(enabled),
    })


  return apiRequest(
    `${API_URL}/${id}/enabled?${params}`,
    {
      method: "PUT",

      auth: true,

      fallbackMessage:
        "Failed to update user.",
    }
  )

}