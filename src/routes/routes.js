const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/verify/:token', authController.verifyEmail);
router.get('/auth/activateMFA/:token', authController.activateMultifactorAuth);
router.post('/auth/forgot-password/:token', authController.forgotPassword);
router.post('/auth/confirm-login/:token', authController.confirmLogin);

router.use(verifyToken('access'));

router.get('/users', userController.getUsers);
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
