import { ENDPOINTS } from '../config/apiConfig';
import { parseUTF8JSON } from '../utils/utf8Helper';

/**
 * Login User
 * @param {string} profileId 
 * @param {string} password 
 */
export const loginUser = async (profileId, password) => {
    try {
        const body = `email=${encodeURIComponent(profileId)}&password=${encodeURIComponent(password)}`;

        const response = await fetch(ENDPOINTS.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Charset': 'utf-8',
                'Cache-Control': 'no-cache',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Read response as text first to ensure proper UTF-8 decoding
        const responseText = await response.text();
        const result = parseUTF8JSON(responseText);

        console.log("Login Response Data:", JSON.stringify(result, null, 2));
        return result;
    } catch (error) {
        console.error('Login error:', error);
        return { status: false, message: 'Network error or server unavailable. Please check your connection.' };
    }
};

/**
 * Register User
 * @param {Object} formData 
 */
export const registerUser = async (formData) => {
    try {
        // Construct form data for multipart/form-data or urlencoded
        // For now, let's use JSON if the API supports it, or urlencoded
        const response = await fetch(ENDPOINTS.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Charset': 'utf-8',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        // Read response as text first to ensure proper UTF-8 decoding
        const responseText = await response.text();
        const result = parseUTF8JSON(responseText);

        return result;
    } catch (error) {
        console.error('Registration error:', error);
        return { status: false, message: 'Failed to connect to the server' };
    }
};

