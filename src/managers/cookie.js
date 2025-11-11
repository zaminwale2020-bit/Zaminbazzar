import { differenceInDays, fromUnixTime } from "date-fns"
import Cookies from "js-cookie"
import jwtDecode from "jwt-decode";


/**
 * Manages cookies using the `js-cookie` library and provides methods for accessing, updating, and observing changes to cookies.
 * @class
 */
class CookieManager {
    /**
     * Creates an instance of CookieManager.
     * @constructor
     */
    constructor() {
        // Check if the code is running in the browser and if the hostname includes "localhost"
        const isLocalHost =
            typeof window !== "undefined"
                ? window.location.hostname.includes("localhost")
                : true

        // Determine the cookie key based on the environment variable or the hostname
        const COOKIE_KEY =
            process.env.NEXT_PUBLIC_COOKIE_KEY ||
            (isLocalHost
                ? "lisa"
                : this.cookieKeyForDomain(window.location.hostname))

        // Determine the domain to be used for the cookies based on the current environment
        const domain = isLocalHost
            ? "localhost" // For localhost environment, use "localhost" as the domain
            : window.location.hostname // For other environments, use hostname

        let wildCardDomain
        if (!isLocalHost) {
            const parts = domain.split(".")
            if (parts.length > 2) {
                wildCardDomain = "." + parts.slice(-2).join(".")
            } else {
                wildCardDomain = "." + domain
            }
        }

        // Define the cookie names with the given key as a prefix
        this.cookieKeys = {
            access: `${COOKIE_KEY}_access`,
        }

        // Define the options to be used for the cookies
        this.cookieOptions = {
            path: "/",
            expires: 1, // Set cookies to expire after 1 day
        }
        this.wildCardCookieOptions = {
            domain: wildCardDomain,
            ...this.cookieOptions,
        }

        // Initialize an object to store observers for cookie changes
        this.observers = {}

        // Initialize BroadcastChannel if available
        this.channel =
            typeof BroadcastChannel !== "undefined"
                ? new BroadcastChannel("cookieUpdates")
                : null
        if (this.channel)
            this.channel.onmessage = event => {
                const { cookieKey, value, conditions } = event.data
                this.notify(cookieKey, value, conditions, true)
            }
    }

    /**
     * Subscribes to changes in a specific cookie.
     * @param {string} key - The key of the cookie to subscribe to.
     * @param {Function} callback - The callback function to be called on changes.
     * @returns {Function} - A function to unsubscribe from changes in the specified cookie.
     */
    subscribe(key, callback) {
        const cookieKey = this.cookieKeys[key]

        if (!this.observers[cookieKey]) this.observers[cookieKey] = []

        this.observers[cookieKey].push(callback)

        // Return a function to unsubscribe from changes in a specific cookie
        return () => {
            if (this.observers[cookieKey])
                this.observers[cookieKey] = this.observers[cookieKey].filter(
                    observer => observer !== callback
                )
        }
    }

    /**
     * Notifies all subscribers when a cookie changes.
     * @param {string} cookieKey - The key of the cookie that changed.
     * @param {any} value - The new value of the cookie.
     * @param {Object} [conditions={}] - Additional conditions related to the change.
     * @param {boolean} [isBroadcasted=false] - Indicates whether the notification is from a broadcast.
     */
    notify(cookieKey, value, conditions = {}, isBroadcasted = false) {
        if (this.observers[cookieKey]) {
            this.observers[cookieKey].forEach(observer =>
                observer({
                    value,
                    conditions,
                    isBroadcasted,
                })
            )
            if (!isBroadcasted && this.channel)
                this.channel.postMessage({
                    cookieKey,
                    value,
                    conditions,
                    isBroadcasted,
                })
        }
    }

    /**
     * Retrieves all cookies as an object.
     * @returns {Object} - An object containing all cookies.
     */
    getAll() {
        return Cookies.get() || null
    }

    /**
     * Retrieves the access token from the cookies.
     * @returns {string|null} - The access token or null if not found.
     */
    getAccessToken() {
        return Cookies.get(this.cookieKeys.access) || null
    }

    /**
     * Updates the access token in the cookies.
     * @param {string|null} token - The new access token or null to remove it.
     */
    updateAccessToken(token = null) {
        if (token) {
            const expires = 1 // this.getJwtExpiration(token)
            const prev = this.getAccessToken()
            Cookies.set(this.cookieKeys.access, token, {
                ...this.cookieOptions,
                expires,
            })
            if (prev !== token)
                this.notify(this.cookieKeys.access, token, {
                    fresh: prev === null,
                    updated: prev !== null,
                    reset: false,
                })
        }
    }

    /**
     * Retrieves both access token from the cookies.
     * @returns {Object} - An object containing access token.
     */
    getTokens() {
        return {
            accessToken: this.getAccessToken(),
        }
    }

    /**
     * Sets all or any of the tokens provided in the cookies.
     * @param {Object} tokens - An object containing token values.
     * @param {string | null} [tokens.accessToken=null] - The new access token. Set to null to remove it.
     */
    setTokens({ accessToken = null }) {
        this.updateAccessToken(accessToken)
    }

    /**
     * Gets the value of a specific cookie from the provided cookies string.
     * @param {string} key - The key of the cookie to retrieve.
     * @param {string} cookies - The string containing all cookies.
     * @returns {string} - The value of the specified cookie.
     */
    getServerCookie(key, cookies) {
        const cookieString = RegExp(key + "=[^;]+").exec(cookies)
        return decodeURIComponent(
            !!cookieString ? cookieString.toString().replace(/^[^=]+./, "") : ""
        )
    }

    /**
     * Removes both access token from the cookies.
     */
    removeTokens() {
        Cookies.remove(this.cookieKeys.access, this.cookieOptions)

        // Notify subscribers when tokens are removed
        this.notify(this.cookieKeys.access, null, {
            fresh: false,
            updated: false,
            reset: true,
        })
    }

    /**
     * Decodes a JWT token and extracts the expiration date.
     * @param {string} token - The JWT token to decode.
     * @returns {number} - The expiration date of the token.
     */
    getJwtExpiration(token) {
        const currentTime = new Date()
        const decoded = jwtDecode(token)
        const expirationTime = fromUnixTime(decoded.exp)

        return differenceInDays(expirationTime, currentTime)
    }

    // Formats the domain by removing "www." and any subdomains to create a prefix for the COOKIE_KEY.
    cookieKeyForDomain(hostname) {
        const parts = hostname.split(".")

        // Check if it's a single-word domain
        if (parts.length === 2) return parts[0] // Return the domain as is

        // Remove the top-level domain (e.g., 'in', 'com', etc.)
        if (parts.length > 2) parts.pop()

        // Join the remaining parts with underscores and return the result
        return parts.join("_")
    }
}

export default CookieManager