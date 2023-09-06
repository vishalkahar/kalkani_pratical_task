module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        mobileNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                is: /^[0-9]{10}$/i,
            },
        },
        birthdate: {
            type: DataTypes.DATE,
        },
    });

    User.associate = (models) => {
        User.hasMany(models.Address);
    };

    return User;
};
