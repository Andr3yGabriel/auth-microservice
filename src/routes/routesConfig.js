
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

const routes = {
    AUTH: {
        REGISTER: `${BASE_URL}/auth/register`,
        LOGIN: `${BASE_URL}/auth/login`,
        VERIFY: `${BASE_URL}/auth/verify`,
        RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
        CONFIRM_LOGIN: `${BASE_URL}/auth/confirm-login`,
        ACTIVATE_MULTIFACTOR: `${BASE_URL}/auth/activate-multifactor`,
    },
    USERS: {
        GET_USERS: `${BASE_URL}/users`,
        DELETE_USER: `${BASE_URL}/users`
    }
};

module.exports = routes;