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
 * Add Authorization header to headers object
 * @param {object} headers
 * @param {string} token
 * @param {string} fallbackToken
 */
const addAuthorizationHeader = (headers, token, fallbackToken) => {
    if (token) headers.Authorization = `Bearer ${token}`;
    else if (fallbackToken) headers.Authorization = `Bearer ${fallbackToken}`;
    else throw new Error("Token not found for authorization");
};

/**
 * Log API request and response details
 */
const logApiDetails = (baseUrl, endpoint, options, res, responseContent) => {
    console.log(
        `API Call: ${options.method || "GET"} ${baseUrl}${endpoint}\n` +
        `Status: ${res.status} ${res.statusText}\n` +
        `Request Headers: ${JSON.stringify(options.headers, null, 2)}\n` +
        `Response: ${typeof responseContent === "object" ? JSON.stringify(responseContent, null, 2) : responseContent}`
    );
};

/**
 * Custom fetch wrapper
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

        // Decode token if access token is used
        if (tokenType === "access" && (token || fallbackToken)) {
            try {
                const decodedToken = jwtDecode(token || fallbackToken);
                if (!decodedToken?.id) throw new Error("Invalid access token");
                options = { ...options, id: decodedToken.id }; // Do not mutate original options
            } catch (error) {
                handleTokenRefreshFailure();
                throw new Error("Failed to decode access token");
            }
        }

        // AbortController for timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

        let res;
        try {
            res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers, signal: controller.signal });
        } finally {
            clearTimeout(timeout);
        }

        // Parse response
        const contentType = res.headers.get("content-type") || "";
        let responseContent;
        if (contentType.includes("application/json")) {
            responseContent = await res.json();
        } else {
            responseContent = await res.text();
        }

        logApiDetails(baseUrl, endpoint, { ...options, headers }, res, responseContent);

        // Handle errors
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

        // Retry logic for network errors (max 2 retries)
        if ((error.name === "AbortError" || error.message.includes("network")) && retryCount < 2) {
            console.warn(`Retrying API call (${retryCount + 1})...`);
            return customFetch(baseUrl, endpoint, options, tokenType, retryCount + 1);
        }

        throw error;
    }
};

/**
 * Fetch with token
 */
export const fetchWithToken = (endpoint, options = {}) =>
    customFetch(process.env.API_URL, endpoint, options, "access");

/**
 * Fetch without token
 */
export const fetchWithoutToken = (endpoint, options = {}) =>
    customFetch(process.env.API_URL, endpoint, options, null);
