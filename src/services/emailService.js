const nodemailer = require('nodemailer');
const routes = require('../routes/routesConfig');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const secretKey = process.env.JWT_SECRET || 'secret';

class emailService {
    static async sendVerificationEmail(email, token) {
        const verificationUrl = `${routes.AUTH.VERIFY}/${token}`;

        const multifactorToken = jwt.sign(
            { email, purpose: 'activate-mfa' },
            secretKey,
            { expiresIn: '1h' }
        );

        const activateMultifactorUrl = `${routes.AUTH.ACTIVATE_MULTIFACTOR}/${multifactorToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your email',
            text: `Click on the following link to verify your email: ${verificationUrl}\n\n
                   If you want to activate multi-factor authentication, click on the following link: ${activateMultifactorUrl}`
        };

        await transporter.sendMail(mailOptions);
    }

    static async sendLoginConfirmEmail(email, token) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Login confirmation token',
            text: `Paste this token on the login page: ${token}`
        };

        await transporter.sendMail(mailOptions);
    }

    static async sendPasswordResetEmail(email, token) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password reset token',
            text: `Paste this token on the reset password page: ${token}`
        };

        await transporter.sendMail(mailOptions);
    }
}

module.exports = emailService;