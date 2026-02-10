import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS, COMMON_HEADERS } from './apiConfig';

/**
 * Generic POST request handler
 */
const postRequest = async (url, params) => {
    try {
        const body = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');

        const response = await fetch(url, {
            method: 'POST',
            headers: COMMON_HEADERS,
            body: body,
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error(`API Error (${url}):`, error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};

/**
 * User Login
 */
export const loginUser = async (profileId, password) => {
    const result = await postRequest(API_ENDPOINTS.LOGIN, {
        email: profileId,
        password: password
    });
    return result;
};

/**
 * Get User Profile
 */
export const getUserProfile = async (tamilClientId) => {
    // If tamilClientId is not provided, try to get it from session
    let id = tamilClientId;
    if (!id) {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            id = user.id || user.tamil_client_id;
        }
    }

    if (!id) {
        return { status: false, message: 'No client ID found' };
    }

    const result = await postRequest(API_ENDPOINTS.GET_PROFILE, {
        tamil_client_id: id
    });
    return result;
};

/**
 * Manual Session Setter (Helper for development/testing as requested)
 */
export const setManualSession = async (clientId) => {
    try {
        await AsyncStorage.setItem('userSession', 'true');
        await AsyncStorage.setItem('userData', JSON.stringify({ id: clientId, tamil_client_id: clientId }));
        return true;
    } catch (error) {
        console.error('Error setting manual session:', error);
        return false;
    }
};
