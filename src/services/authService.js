export const loginUser = async (email, password) => {
    try {
        const body = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;

        const response = await fetch('https://nadarmahamai.com/api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body,
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Login error:', error);
        return { status: false, message: 'Network error or server unavailable' };
    }
};
