
import AsyncStorage from '@react-native-async-storage/async-storage';

// Session keys
const KEYS = {
    USER_SESSION: 'userSession',
    USER_DATA: 'userData',
    CLIENT_ID: 'client_id',
    TAMIL_CLIENT_ID: 'tamil_client_id',
    USERNAME: 'username',
};

/**
 * Initialize session with login data
 * @param {Object} data - The data object from login response
 */
export const setSession = async (data) => {
    try {
        if (!data) return;

        const sessionData = {
            [KEYS.USER_SESSION]: 'true',
            [KEYS.USER_DATA]: JSON.stringify(data),
        };

        if (data.client_id) {
            sessionData[KEYS.CLIENT_ID] = String(data.client_id);
        }
        if (data.tamil_client_id) {
            sessionData[KEYS.TAMIL_CLIENT_ID] = String(data.tamil_client_id);
        }
        if (data.username) {
            sessionData[KEYS.USERNAME] = data.username;
        }

        // Store all values in parallel
        const pairs = Object.entries(sessionData);
        await AsyncStorage.multiSet(pairs);

        console.log('Session initialized:', sessionData);
        return true;
    } catch (error) {
        console.error('Error setting session:', error);
        return false;
    }
};

/**
 * Get a specific value from session
 * @param {string} key - 'client_id', 'tamil_client_id', 'username', or 'userData'
 */
export const getSession = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (key === KEYS.USER_DATA && value) {
            return JSON.parse(value);
        }
        return value;
    } catch (error) {
        console.error(`Error getting session key ${key}:`, error);
        return null;
    }
};

/**
 * Clear all session data
 */
export const clearSession = async () => {
    try {
        const keys = Object.values(KEYS);
        await AsyncStorage.multiRemove(keys);
        console.log('Session cleared');
        return true;
    } catch (error) {
        console.error('Error clearing session:', error);
        return false;
    }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
    try {
        const session = await AsyncStorage.getItem(KEYS.USER_SESSION);
        return session === 'true';
    } catch (error) {
        return false;
    }
};

export default {
    setSession,
    getSession,
    clearSession,
    isLoggedIn,
    KEYS
};
