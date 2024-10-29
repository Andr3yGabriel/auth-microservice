const { Model, DataTypes } = require("sequelize");
const sequelize = require('../config/Database');
const bcrypt = require('bcryptjs');

class User extends Model {
    async validatePassword(password) {
        return await bcrypt.compare(password, this.password);
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    hasMultifactor: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    sequelize,
    modelName: 'User',
    timestamps: false,
});

User.beforeCreate(async (user) => {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
});

module.exports = User;