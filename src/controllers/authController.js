const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendMessage = require('../../kafka/producers/kafkaProducer');
const emailService = require('../services/emailService');

const secretKey = process.env.JWT_SECRET || 'secret';

class AuthController {
    static async register (req, res) {
        try {
            const { username, email, password } = req.body;
            const user = await User.findOne({ where: { email }});
            if (user) {
                return res.status(400).json({ message: 'User already exists' });
            }
            const newUser = await User.create({ username, email, password });
            const token = jwt.sign(
                { id: newUser.id, purpose: 'email-verification' },
                secretKey,
                { expiresIn: '1h' }
              );

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
            const { token } = req.query;
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

    static async forgotPassword (req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email }});
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }
            const token = jwt.sign(
                { id: user.id, purpose: 'password-reset' },
                secretKey,
                { expiresIn: '1h' }
              );

            await emailService.sendPasswordResetEmail(email, token);

            res.status(200).json({ message: 'Password reset link sent to email' });
        } catch (error) {
            console.error('Error at forgot password:', error);
            res.status(400).json({ message: 'Unexpected error at forgot password', error });
        }
    }

    static async login (req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email }});
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

            const userHasMultifactor = user.hasMultifactor;

            if (userHasMultifactor) {
                const token = jwt.sign(
                    { id: user.id, purpose: 'confirm-login' },
                    secretKey,
                    { expiresIn: '1h' }
                );

                await emailService.sendLoginConfirmEmail(email, token);
            }

            const token = jwt.sign(
                { id: user.id, purpose: 'access' },
                secretKey,
                { expiresIn: '7d' }
            );

            await sendMessage('auth-events', {
                event: 'user-logged_in',
                userId: user.id,
                email
            });

            res.status(200).json({ token });

        } catch (error) {
            console.error('Error at login:', error);
            res.status(400).json({ message: 'Unexpected error at login!', error });
        }
    }

    static async confirmLogin (req, res) {
        try {
            const { token } = req.query;
            const decoded = jwt.verify(token, secretKey);

            const user = await User.findByPk(decoded.id);

            const accessToken = jwt.sign(
                { id: user.id, purpose: 'access' },
                secretKey,
                { expiresIn: '7d' }
              );

            await sendMessage('auth-events', {
                event: 'user-logged_in',
                userId: user.id,
                email
            });

            res.status(200).json({ accessToken });

        } catch (error) {
            console.error('Error at confirm login:', error);
            res.status(400).json({ message: 'Unexpected error at confirm login', error });
        }
    }

    static async activateMultifactorAuth (req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ where: { email }});

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            user.hasMultifactor = true;

            await user.save();

            res.status(200).json({ message: 'Multifactor auth activated successfully!' });
        } catch (error) {
            console.error('Error at activating multifactor auth:', error);
            res.status(400).json({ message: 'Unexpected error at activating multifactor auth', error });
        }
    }
}

module.exports = AuthController;