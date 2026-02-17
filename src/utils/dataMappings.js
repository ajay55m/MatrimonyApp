export const RELIGION_MAP = {
    '1': 'Hindu',
    '2': 'Christian',
    '3': 'Muslim',
    '4': 'Other'
};

export const CASTE_MAP = {
    '1': 'Nadar',
    '2': 'Other'
};

export const EDUCATION_MAP = {
    '1': 'B.E',
    '2': 'M.E',
    '3': 'B.Tech',
    '4': 'M.Tech',
    '5': 'MBBS',
    '6': 'MD',
    '7': 'BDS',
    '8': 'B.Sc',
    '9': 'M.Sc',
    '10': 'B.Com',
    '11': 'M.Com',
    '12': 'B.A',
    '13': 'M.A',
    '14': 'MBA',
    '15': 'MCA',
    '16': 'PhD',
    '17': 'Diploma',
    '18': 'HSC',
    '19': 'SSLC',
    '20': 'Degree',
    '21': 'Other'
};

export const OCCUPATION_MAP = {
    '1': 'Software Engineer',
    '2': 'Government',
    '3': 'Doctor',
    '4': 'Teacher',
    '5': 'Banker',
    '6': 'Business',
    '18': 'Private Sector',
    '20': 'Employee',
    '21': 'Self Employed'
};

export const LOCATION_MAP = {
    '1': 'Chennai',
    '2': 'Madurai',
    '3': 'Coimbatore',
    '4': 'Trichy',
    '5': 'Salem',
    '6': 'Tirunelveli',
    '7': 'Thoothukudi',
    '26': 'Thoothukudi' // Assuming 26 based on common districts list
};

export const getLabel = (map, value, fallback = '') => {
    if (!value) return fallback;
    // If value is already text (not numeric string), return it
    if (isNaN(value)) return value;

    // Check map
    if (map[value.toString()]) {
        return map[value.toString()];
    }

    return fallback || value; // Return value if no fallback, or fallback
};
