/**
 * API Configuration
 * Centralized place for all API related constants
 */

export const BASE_URL = 'https://nadarmahamai.com/api';

export const ENDPOINTS = {
    LOGIN: `${BASE_URL}/login.php`,
    REGISTER: `${BASE_URL}/register.php`,
    SELECTED_PROFILES: `${BASE_URL}/selected-profiles.php`,
    SEARCH_PROFILES: `${BASE_URL}/search_profiles.php`,
};

export default {
    BASE_URL,
    ENDPOINTS,
};
