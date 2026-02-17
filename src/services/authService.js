import { ENDPOINTS } from '../config/apiConfig';

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
                'Accept': 'application/json',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Registration error:', error);
        return { status: false, message: 'Failed to connect to the server' };
    }
};

