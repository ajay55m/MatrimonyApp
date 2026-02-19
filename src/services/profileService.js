import { ENDPOINTS } from '../config/apiConfig';

// Manual UTF-8 decoder as a safe fallback
const manualDecodeUTF8 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let result = '';
    let i = 0;

    while (i < bytes.length) {
        const c = bytes[i++];
        if (c < 128) {
            result += String.fromCharCode(c);
        } else if (c >= 192 && c < 224) {
            result += String.fromCharCode(((c & 31) << 6) | (bytes[i++] & 63));
        } else if (c >= 224 && c < 240) {
            result += String.fromCharCode(((c & 15) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63));
        } else if (c >= 240 && c < 248) {
            const val = ((c & 7) << 18) | ((bytes[i++] & 63) << 12) | ((bytes[i++] & 63) << 6) | (bytes[i++] & 63);
            result += String.fromCharCode(0xD800 + ((val - 0x10000) >> 10), 0xDC00 + ((val - 0x10000) & 0x3FF));
        }
    }
    return result;
};

// Robust fetch that forces UTF-8 decoding from raw bytes
// This fixes the issue where PHP APIs missing 'charset=utf-8' cause Android fetch to default to Latin-1
const fetchJSON = async (url, options) => {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    try {
        const buffer = await response.arrayBuffer();

        // Try native TextDecoder first
        if (typeof TextDecoder !== 'undefined') {
            try {
                const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true });
                const text = decoder.decode(buffer);
                return JSON.parse(text);
            } catch (e) {
                console.warn('TextDecoder failed, using manual decoder', e);
            }
        }

        // Fallback to manual decoding
        const text = manualDecodeUTF8(buffer);
        return JSON.parse(text);
    } catch (e) {
        console.error('Buffer decode error, falling back to text()', e);
        // Last resort fallback
        const text = await response.text();
        return JSON.parse(text);
    }
};

export const getSelectedProfiles = async (tamilClientId) => {
    try {
        const result = await fetchJSON(ENDPOINTS.SELECTED_PROFILES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: `tamil_client_id=${encodeURIComponent(tamilClientId)}`,
        });

        if (result && Array.isArray(result.data)) {
            result.data = result.data.map(profile => ({
                ...profile,
                id: profile.tamil_profile_id || profile.id || profile.profile_id,
                profile_id: profile.profile_id || profile.id,
                name: profile.name || profile.user_name || profile.profile_name,
                // API response doesn't provide image path, rely on default if missing
                profile_image: profile.user_photo
                    ? `https://nadarmahamai.com/uploads/${profile.user_photo}`
                    : (profile.photo_data1 ? `https://nadarmahamai.com/uploads/${profile.photo_data1}` : null),
                age: profile.age,
                height: profile.height || (profile.height_feet ? `${profile.height_feet}ft ${profile.height_inches}in` : ''),
                education: (Array.isArray(profile.education) ? profile.education[0] : profile.education) || profile.padippu || '',
                occupation: profile.occupation || profile.profession || 'Not Specified',
                location: profile.location || profile.gplace || profile.city || profile.district || 'Unknown',
                religion: profile.religion,
                caste: profile.caste,
                verified: profile.ver_flag === 1 || profile.profile_status === '1' || profile.viewed === true,
            }));
        }
        return result;
    } catch (error) {
        console.error('Get selected profiles error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};

export const searchProfiles = async (searchParams) => {
    try {
        const cleanParams = {};
        Object.keys(searchParams).forEach(key => {
            const value = searchParams[key];
            if (value !== undefined && value !== null && value !== '' &&
                !(typeof value === 'string' && value.startsWith('SELECT_'))) {
                cleanParams[key] = value;
            }
        });

        const body = Object.keys(cleanParams)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(cleanParams[key])}`)
            .join('&');

        const result = await fetchJSON(ENDPOINTS.SEARCH_PROFILES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body,
        });

        if (result.status && Array.isArray(result.data)) {
            if (result.data.length > 50) result.data = result.data.slice(0, 50);
            result.data = result.data.map(profile => ({
                ...profile,
                id: profile.id || profile.profile_id,
                profile_id: profile.profile_id || profile.id,
                name: profile.user_name || profile.profile_name || profile.name,
                profile_image: profile.user_photo
                    ? `https://nadarmahamai.com/uploads/${profile.user_photo}`
                    : (profile.photo_data1 ? `https://nadarmahamai.com/uploads/${profile.photo_data1}` : null),
                lastActive: profile.last_seen || 'Online',
                viewed: false,
                verified: profile.ver_flag === 1 || profile.profile_status === '1',
                education: profile.padippu || (Array.isArray(profile.education) ? profile.education[0] : profile.education) || '',
                occupation: profile.occupation || profile.profession || 'Not Specified',
                location: profile.gplace || profile.city || profile.district || 'Unknown',
                avatarColor: Math.random() > 0.5 ? ['#f3f4f7', '#2C73D2'] : ['#E74C5C', '#D32F2F'],
                age: profile.age,
                height: profile.height || (profile.height_feet ? `${profile.height_feet}ft ${profile.height_inches}in` : ''),
                religion: profile.religion,
                caste: profile.caste,
                district: profile.district,
                city: profile.city,
            }));
        }
        return result;
    } catch (error) {
        console.error('Search profiles error:', error);
        return { status: false, message: 'Network error or search failed' };
    }
};

export const getProfile = async (profileId) => {
    try {
        const result = await fetchJSON(ENDPOINTS.GET_PROFILE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: `tamil_client_id=${encodeURIComponent(profileId)}`,
        });
        return result;
    } catch (error) {
        console.error('Get profile error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};

export const getDashboardStats = async (clientId) => {
    try {
        const result = await fetchJSON(ENDPOINTS.DASHBOARD, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: `tamil_client_id=${encodeURIComponent(clientId)}`,
        });
        return result;
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};

export const getUserProfiles = async (tamilClientId) => {
    try {
        const result = await fetchJSON(ENDPOINTS.USER_PROFILES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json',
            },
            body: `tamil_client_id=${encodeURIComponent(tamilClientId)}`,
        });

        if (result && result.status) {
            let profileData = null;

            // Handle single profile response object (e.g. from get-profile.php)
            if (result.data && (result.data.tamil_profile || result.data.main_profile)) {
                const rawProfile = result.data.tamil_profile || result.data.main_profile;
                profileData = [rawProfile]; // Wrap in array
            }
            // Handle array response
            else if (Array.isArray(result.data)) {
                profileData = result.data;
            }

            if (profileData) {
                result.data = profileData.map(profile => ({
                    ...profile,
                    id: profile.tamil_profile_id || profile.id || profile.profile_id,
                    profile_id: profile.profile_id || profile.id,
                    name: profile.name || profile.user_name || profile.profile_name,
                    // API response doesn't provide image path, rely on default if missing
                    profile_image: profile.user_photo
                        ? `https://nadarmahamai.com/uploads/${profile.user_photo}`
                        : (profile.photo_data1 ? `https://nadarmahamai.com/uploads/${profile.photo_data1}` : null),
                    age: profile.age,
                    height: profile.height || (profile.height_feet ? `${profile.height_feet}ft ${profile.height_inches}in` : ''),
                    education: (Array.isArray(profile.education) ? profile.education[0] : profile.education) || profile.padippu || '',
                    occupation: profile.occupation || profile.profession || 'Not Specified',
                    location: profile.location || profile.gplace || profile.city || profile.district || 'Unknown',
                    religion: profile.religion,
                    caste: profile.caste,
                    verified: profile.ver_flag === 1 || profile.profile_status === '1' || profile.viewed === true,
                }));
            }
        }
        return result;
    } catch (error) {
        console.error('Get user profiles error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};