const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendMessage = require('../../kafka/producers/kafkaProducer');
const emailService = require('../services/emailService');
const secretKey = process.env.JWT_SECRET;

class AuthController {
    static generateToken(payload) {
        const { id, purpose, expiresIn } = payload;

        if (!id || !purpose || !expiresIn) {
            throw new Error('Missing information!');
        }

        return jwt.sign(
            { id, purpose },
            secretKey,
            { expiresIn: expiresIn }
        );
    }

    static async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const newUser = await User.create({ username, email, password });
            const token = AuthController.generateToken({ id: newUser.id, purpose: 'email-verification', expiresIn: '1h' });

            await emailService.sendVerificationEmail(email, token);

            await sendMessage('auth-events', {
                event: 'user-registered',
                userId: newUser.id,
                username,
                email
            });

            res.status(201).json({ message: 'User registered. Please check your email for verification.' });
        } catch (error) {
            console.error('Error at register:', error);
            res.status(400).json({ message: 'Unexpected error at register', error });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;

            const decoded = jwt.verify(token, secretKey);

            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.isVerified = true;
            await user.save();

            res.status(200).json({ message: 'Email verified successfully!' });
        } catch (error) {
            console.error('Error at verify email:', error);
            res.status(400).json({ message: 'Unexpected error at verify email', error });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            if (!user.isVerified) {
                return res.status(400).json({ message: 'Email not verified, please check your inbox!' });
            }
            const isPasswordValid = await user.validatePassword(password);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid password' });
            }

            if (user.hasMultifactor) {
                await AuthController.confirmLogin(req, res);
            } else {
                const token = AuthController.generateToken({ id: user.id, purpose: 'access', expiresIn: '7d' });

                await sendMessage('auth-events', {
                    event: 'user-logged_in',
                    userId: user.id,
                    email
                });

                res.status(200).json({ token });
            }
        } catch (error) {
            console.error('Error at login:', error);
            res.status(400).json({ message: 'Unexpected error at login!', error });
        }
    }

    static async confirmLogin(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const loginConfirmToken = AuthController.generateToken({ id: user.id, purpose: 'login-confirmation', expiresIn: '1h' });

            await emailService.sendLoginConfirmEmail(email, loginConfirmToken);

            res.status(200).json({ message: 'Confirmation email sent. Please check your inbox.' });
        } catch (error) {
            console.error('Error at confirmLogin:', error);
            res.status(400).json({ message: 'Unexpected error at confirmLogin!', error });
        }
    }

    static async verifyLogin(req, res) {
        try {
            const { token } = req.params;

            const decoded = jwt.verify(token, secretKey);

            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const accessToken = AuthController.generateToken({ id: user.id, purpose: 'access', expiresIn: '7d' });

            await sendMessage('auth-events', {
                event: 'user-logged_in',
                userId: user.id,
                email: user.email
            });

            res.status(200).json({ token: accessToken });
        } catch (error) {
            console.error('Error at verifyLogin:', error);
            res.status(400).json({ message: 'Unexpected error at verifyLogin!', error });
        }
    }

    static async activateMultifactorAuth(req, res) {
        try {
            const { token } = req.params;
            const decoded = jwt.verify(token, secretKey);

            const user = await User.findOne({ where: { email: decoded.email } });

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            user.hasMultifactor = true;
            await sendMessage('auth-events', {
                event: 'multifactor activated',
                userId: user.id,
                email: user.email
            })

            await user.save();

            window.location.href = 'http://localhost:5173/login';
        } catch (error) {
            console.error('Error at activating multifactor auth:', error);
            res.status(400).json({ message: 'Unexpected error at activating multifactor auth', error });
        }
    }

    static async resetPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const token = AuthController.generateToken({ id: user.id, purpose: 'password-reset', expiresIn: '1h' });

            await emailService.sendPasswordResetEmail(email, token);

            await sendMessage('auth-events', {
                event: 'password reset requested',
                userId: user.id,
                email
            });

            res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
        } catch (error) {
            console.error('Error at resetPassword:', error);
            res.status(400).json({ message: 'Unexpected error at resetPassword', error });
        }
    }

    static async changePassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const decoded = jwt.verify(token, secretKey);

            const user = await User.findByPk(decoded.id);
            user.password = newPassword;
            await user.save();

            await sendMessage('auth-events', {
                event: 'password changed',
                userId: user.id,
                email: user.email
            });

            res.status(200).json({ message: 'Password changed successfully!' });
        } catch (error) {
            console.error('Error at changePassword:', error);
            res.status(400).json({ message: 'Unexpected error at changePassword', error });
        }
    }
}

module.exports = AuthController;