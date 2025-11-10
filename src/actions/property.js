"use server";

import { fetchWithoutToken, fetchWithToken } from "@/services/fetch";

/**
 * Format filter parameters for query strings
 */
function formatFilterForQuery(filter) {
    const queryString = new URLSearchParams();

    Object.keys(filter).forEach((key) => {
        const value = filter[key];

        if (Array.isArray(value)) {
            value.forEach((item) => queryString.append(`${key}[]`, item));
        } else if (value !== undefined && value !== null) {
            queryString.append(key, value);
        }
    });

    return queryString.toString();
}

/* -------------------------------------------------------------------------- */
/*                                Property APIs                               */
/* -------------------------------------------------------------------------- */

export async function createProperty(body) {
    const resp = await fetchWithToken("/property/add", {
        method: "POST",
        body: JSON.stringify(body),
    });
    return resp?.results?.data;
}

export async function getAllProperty({ page, limit }) {
    const resp = await fetchWithoutToken(`/property/getAll?page=${page}&limit=${limit}`, {
        method: "GET",
    });
    return resp?.results?.data;
}

export async function getOneProperty(propertyId) {
    const resp = await fetchWithoutToken(`/property/${propertyId}`, {
        method: "GET",
    });
    return resp?.results?.data;
}

export async function updateProperty(body) {
    const resp = await fetchWithToken("/user/properties/edit", {
        method: "PUT",
        body: JSON.stringify(body),
    });
    return resp?.results?.data;
}

export async function deleteProperty(propertyId) {
    const resp = await fetchWithToken(`/user/properties/delete/${propertyId}`, {
        method: "DELETE",
    });
    return resp?.results?.data;
}

export async function filterProperty(filter) {
    const formattedFilter = formatFilterForQuery(filter);
    const resp = await fetchWithoutToken(`/property/getAll/filter?${formattedFilter}`, {
        method: "GET",
    });
    return resp?.results?.data;
}

export async function uploadPropertyImage({ body }) {
    const resp = await fetchWithToken("/property/upload/file", {
        method: "POST",
        noContentType: true,
        body,
    });
    return resp?.results;
}

/* -------------------------------------------------------------------------- */
/*                            Website Enquiry APIs                            */
/* -------------------------------------------------------------------------- */

export async function createWebsiteEnquiry(body) {
    const resp = await fetchWithoutToken("/enquiry/website/add", {
        method: "POST",
        body: JSON.stringify(body),
    });
    return resp?.results?.data;
}

export async function getWebsiteEnquiry({ page, limit }) {
    const resp = await fetchWithToken(`/enquiry/website/getAll?page=${page}&limit=${limit}`, {
        method: "GET",
    });
    return resp?.results?.data;
}

export async function downloadWebsiteEnquiry({ startDate = null, endDate = null }) {
    const resp = await fetchWithToken(
        `/enquiry/website/export?startDate=${startDate}&endDate=${endDate}`,
        { method: "GET" }
    );
    return resp;
}

/* -------------------------------------------------------------------------- */
/*                           Property Enquiry APIs                            */
/* -------------------------------------------------------------------------- */

export async function createPropertyEnquiry({ body, propertyId }) {
    const resp = await fetchWithoutToken(`/enquiry/property/add/${propertyId}`, {
        method: "POST",
        body: JSON.stringify(body),
    });
    return resp?.results?.data;
}

export async function getPropertyEnquiry({ propertyId, page, limit }) {
    const resp = await fetchWithToken(
        `/enquiry/property/getAll/${propertyId}?page=${page}&limit=${limit}`,
        { method: "GET" }
    );
    return resp?.results?.data;
}

export async function downloadPropertyEnquiry({ propertyId, startDate = null, endDate = null }) {
    const resp = await fetchWithToken(
        `/enquiry/property/export/${propertyId}?startDate=${startDate}&endDate=${endDate}`,
        { method: "GET" }
    );
    return resp;
}

/* -------------------------------------------------------------------------- */
/*                             Property Visit APIs                            */
/* -------------------------------------------------------------------------- */

export async function createPropertyVisit({ body, propertyId }) {
    const resp = await fetchWithoutToken(`/enquiry/property/add/visit/${propertyId}`, {
        method: "POST",
        body: JSON.stringify(body),
    });
    return resp?.results?.data;
}

export async function getPropertyVisits({ propertyId, page, limit }) {
    const resp = await fetchWithToken(
        `/enquiry/property/getAll/visit/${propertyId}?page=${page}&limit=${limit}`,
        { method: "GET" }
    );
    return resp?.results?.data;
}

export async function downloadPropertyVisit({ propertyId, startDate = null, endDate = null }) {
    const resp = await fetchWithToken(
        `/enquiry/property/export/visit/${propertyId}?startDate=${startDate}&endDate=${endDate}`,
        { method: "GET" }
    );
    return resp;
}
