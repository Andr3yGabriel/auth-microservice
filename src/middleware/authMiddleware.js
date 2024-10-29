const jwt = require('jsonwebtoken');

const verifyToken = (expectedPurpose) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            console.log(error);
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (decoded.purpose !== expectedPurpose) {
            return res.status(403).json({ message: 'Forbidden: Invalid token purpose' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = verifyToken;
