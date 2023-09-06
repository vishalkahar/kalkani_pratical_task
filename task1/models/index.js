const Sequelize = require('sequelize');

const sequelize = new Sequelize('practical_test2', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('./user')(sequelize, Sequelize);
db.Address = require('./address')(sequelize, Sequelize);

db.User.hasMany(db.Address);
db.Address.belongsTo(db.User);

module.exports = db;
