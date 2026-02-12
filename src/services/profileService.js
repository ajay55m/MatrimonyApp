import { ENDPOINTS } from '../config/apiConfig';

/**
 * Get Selected Profiles (Shortlisted)
 * @param {string} clientId 
 */
export const getSelectedProfiles = async (tamilClientId) => {
    try {
        const body = `tamil_client_id=${encodeURIComponent(tamilClientId)}`;

        const response = await fetch(ENDPOINTS.SELECTED_PROFILES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch selected profiles');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Get selected profiles error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};

/**
 * Search Profiles (Placeholder for future search logic)
 */
export const searchProfiles = async (searchParams) => {
    // This could be another endpoint like search.php
    return { status: false, message: 'Search API not implemented yet' };
};
