const User = require('../models/User');

class userController {
    static async getUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'username', 'email', 'hasMultifactor', 'isVerified']
            });
            res.status(200).json(users);
        } catch (error) {
            console.error('Error at getUsers', error);
            res.status(400).json({ message: 'Unexpected error at getUsers', error });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            await user.destroy();
            res.status(200).json({ message: 'User deleted successfully!' });
        } catch (error) {
            console.error('Error at deleteUser', error);
            res.status(400).json({ message: 'Unexpected error at deleteUser', error });
        }
    }
}

module.exports = userController;