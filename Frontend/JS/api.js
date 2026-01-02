// Base URL for the API
const API_BASE_URL = window._env_.BACKEND_URL || "http://localhost:3000/api";

/**
 * A wrapper around the standard fetch API that handles:
 * 1. Automatic token refreshing on 401 Unauthorized errors.
 * 2. Default credentials: 'include' for sending cookies.
 * 3. JSON content type headers by default (unless overridden).
 *
 * @param {string} url - The endpoint URL (can be relative or absolute).
 * @param {object} options - Standard fetch options.
 * @returns {Promise<Response>} - The fetch response.
 */
async function fetchWithAuth(url, options = {}) {
  // Ensure URL is absolute if it's relative
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  // Default headers
  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  // Merge defaults with user options
  const config = {
    ...options,
    credentials: "include", // Always send cookies
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    // 1. Attempt the initial request
    let response = await fetch(fullUrl, config);

    // 2. Check if the token is expired (401 Unauthorized)
    if (response.status === 401) {
      console.log("Access token expired. Attempting to refresh...");

      // 3. Attempt to refresh the token
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // Send the refreshToken cookie
      });

      if (refreshResponse.ok) {
        console.log("Token refresh successful. Retrying original request...");

        // 4. Retry the original request
        response = await fetch(fullUrl, config);
      } else {
        console.warn("Token refresh failed. Redirecting to login...");
        // 5. Refresh failed (e.g., refresh token expired or invalid)
        // Clear any local state if needed and redirect
        window.location.href = "../pages/login.html";
        return response; // Return the 401 response (or the 403 from refresh)
      }
    }

    return response;
  } catch (error) {
    console.error("Network request failed:", error);
    throw error;
  }
}

// Export if using modules, or just expose globally if using vanilla script tags
// window.fetchWithAuth = fetchWithAuth;
