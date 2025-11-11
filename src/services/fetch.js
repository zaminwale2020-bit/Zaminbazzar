"use server";

import jwtDecode from "jwt-decode";
import { cookies } from "next/headers";

/**
 * Retrieve token from cookies
 * @param {string} tokenType
 * @returns {string|null}
 */
const getToken = (tokenType = "access") => {
  try {
    const token = cookies().get(`${process.env.NEXT_PUBLIC_COOKIE_KEY}_${tokenType}`);
    if (!token) {
      console.warn(`Token of type "${tokenType}" not found in cookies.`);
      return null;
    }
    return token.value;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Handle token refresh failure
 */
const handleTokenRefreshFailure = () => {
  try {
    const cookieKey = process.env.NEXT_PUBLIC_COOKIE_KEY;
    cookies().delete(`${cookieKey}_access`);
    console.warn("Access token deleted due to refresh failure.");
  } catch (error) {
    console.error("Error deleting access token:", error);
  }
};

/**
 * Add Authorization header
 */
const addAuthorizationHeader = (headers, token, fallbackToken) => {
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (fallbackToken) headers.Authorization = `Bearer ${fallbackToken}`;
  else throw new Error("Token not found for authorization");
};

/**
 * Log API request and response
 */
const logApiDetails = (baseUrl, endpoint, options, res, responseContent) => {
  console.log(
    `API Call: ${options.method || "GET"} ${baseUrl}${endpoint}\n` +
      `Status: ${res.status} ${res.statusText}\n` +
      `Headers: ${JSON.stringify(options.headers, null, 2)}\n` +
      `Response: ${
        typeof responseContent === "object"
          ? JSON.stringify(responseContent, null, 2)
          : responseContent
      }`
  );
};

/**
 * Custom Fetch Wrapper
 */
const customFetch = async (
  baseUrl,
  endpoint,
  options = { headers: {}, noContentType: false },
  tokenType = "access",
  retryCount = 0
) => {
  try {
    const headers = { ...(options.headers || {}) };

    if (!options.noContentType && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const token = tokenType ? getToken(tokenType) : null;
    const fallbackToken = options?.fallbackToken;

    if (tokenType !== null) {
      addAuthorizationHeader(headers, token, fallbackToken);
    }

    // Decode token
    if (tokenType === "access" && (token || fallbackToken)) {
      try {
        const decodedToken = jwtDecode(token || fallbackToken);
        if (!decodedToken?.id) throw new Error("Invalid access token");
        options = { ...options, id: decodedToken.id };
      } catch (error) {
        handleTokenRefreshFailure();
        throw new Error("Failed to decode access token");
      }
    }

    // Timeout controller
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let res;
    try {
      res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeout);
    }

    // Parse response
    const contentType = res.headers.get("content-type") || "";
    let responseContent =
      contentType.includes("application/json") ? await res.json() : await res.text();

    logApiDetails(baseUrl, endpoint, { ...options, headers }, res, responseContent);

    if (!res.ok) {
      if (res.status === 401) {
        handleTokenRefreshFailure();
        throw new Error("Token expired. Please reauthenticate.");
      }

      const errorMessage =
        responseContent?.results?.data?.error ||
        responseContent?.message ||
        JSON.stringify(responseContent) ||
        "API error occurred";

      throw new Error(errorMessage);
    }

    return responseContent;
  } catch (error) {
    console.error(`customFetch error: ${error.message}`);

    if ((error.name === "AbortError" || error.message.includes("network")) && retryCount < 2) {
      console.warn(`Retrying API call (${retryCount + 1})...`);
      return await customFetch(baseUrl, endpoint, options, tokenType, retryCount + 1);
    }

    throw error;
  }
};

/**
 * Fetch with token
 */
export const fetchWithToken = async (endpoint, options = {}) => {
  return await customFetch(process.env.NEXT_PUBLIC_API_URL, endpoint, options, "access");
};

/**
 * Fetch without token
 */
export const fetchWithoutToken = async (endpoint, options = {}) => {
  return await customFetch(process.env.NEXT_PUBLIC_API_URL, endpoint, options, null);
};
