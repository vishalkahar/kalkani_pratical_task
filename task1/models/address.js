module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('Address', {
        addressLine1: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        addressLine2: {
            type: DataTypes.STRING,
        },
        pincode: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^[0-9]{4,6}$/i,
            },
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('Home', 'Office'),
            allowNull: false,
        },
    });

    Address.associate = (models) => {
        Address.belongsTo(models.User);
    };

    return Address;
};
