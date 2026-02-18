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
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch selected profiles');
        }

        const result = await response.json();
        // Limit results to 50
        if (result.status && Array.isArray(result.data)) {
            result.data = result.data.slice(0, 50);
        }
        return result;
    } catch (error) {
        console.error('Get selected profiles error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};

/**
 * Search Profiles based on filters
 * @param {Object} searchParams 
 */
export const searchProfiles = async (searchParams) => {
    try {
        // Filter out default/placeholder values
        const cleanParams = {};

        Object.keys(searchParams).forEach(key => {
            const value = searchParams[key];

            if (
                value !== undefined &&
                value !== null &&
                value !== '' &&
                !(typeof value === 'string' && value.startsWith('SELECT_'))
            ) {
                cleanParams[key] = value;
            }
        });


        console.log('Searching with params:', cleanParams);

        // Convert JS object to x-www-form-urlencoded format
        const body = Object.keys(cleanParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(cleanParams[key])}`)
            .join('&');

        const response = await fetch(ENDPOINTS.SEARCH_PROFILES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: body,
        });

        const result = await response.json();
        console.log('Search response:', JSON.stringify(result).substring(0, 200));

        if (!response.ok) {
            throw new Error('Search request failed: ' + (result.message || response.status));
        }

        if (result.status && Array.isArray(result.data)) {
            // Limit results to 50 for performance
            if (result.data.length > 50) {
                result.data = result.data.slice(0, 50);
            }

            // Map data to match ProfileScreen expected format
            result.data = result.data.map(profile => ({
                ...profile,
                // Ensure ID is present
                id: profile.profile_id || profile.id,
                profile_id: profile.profile_id || profile.id,

                // Name mapping
                name: profile.user_name || profile.profile_name || profile.name,

                // Image mapping (construct URL if needed or use placeholder logic)
                profile_image: profile.user_photo ? `https://nadarmahamai.com/uploads/${profile.user_photo}` :
                    (profile.photo_data1 ? `https://nadarmahamai.com/uploads/${profile.photo_data1}` : null),

                // Defaults for UI badges
                lastActive: profile.last_seen || 'Online', // Default to Online if missing
                viewed: false,
                verified: profile.ver_flag === 1 || profile.profile_status === '1',

                // Map fields if names differ
                education: profile.padippu || (Array.isArray(profile.education) ? profile.education[0] : profile.education) || '',
                occupation: profile.occupation || profile.profession || 'Not Specified',
                location: profile.gplace || profile.city || profile.district || 'Unknown',

                // Ensure avatar colors exist if no image (Randomize for variety)
                avatarColor: Math.random() > 0.5 ? ['#f3f4f7', '#2C73D2'] : ['#E74C5C', '#D32F2F'],

                // Maintain key fields explicitly to be safe
                age: profile.age,
                height: profile.height || (profile.height_feet ? `${profile.height_feet}ft ${profile.height_inches}in` : ''),
                religion: profile.religion,
                caste: profile.caste,
                district: profile.district,
                city: profile.city
            }));

            return result;
        }
        return result;
    } catch (error) {
        console.error('Search profiles error:', error);
        return { status: false, message: 'Network error or search failed' };
    }
};

/**
 * Get Specific Profile Details
 * @param {string} profileId
 */
export const getProfile = async (profileId) => {
    try {
        const body = `profile_id=${encodeURIComponent(profileId)}`;

        const response = await fetch(ENDPOINTS.GET_PROFILE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile details');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Get profile error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};
