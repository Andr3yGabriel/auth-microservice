const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/verify/:token', authController.verifyEmail);
router.get('/auth/activateMFA/:token', authController.activateMultifactorAuth);
router.get('/auth/verify-login/:token', authController.verifyLogin);

router.get('/users', verifyToken('access'), userController.getUsers);
router.delete('/users/:id', verifyToken('access'), userController.deleteUser);

module.exports = router;
