const BASE_URL = 'http://localhost:3000/api';

const routes = {
    AUTH: {
        VERIFY: `${BASE_URL}/auth/verify`,
        VERIFY_LOGIN: `${BASE_URL}/auth/verify-login`,
        ACTIVATE_MULTIFACTOR: `${BASE_URL}/auth/activateMFA`,
        RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    }
};

module.exports = routes;