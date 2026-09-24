const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kcc_database', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
  port: 3306,
  logging: false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});

sequelize.authenticate()
  .then(() => console.log('MySQL Database Connected Successfully...'))
  .catch(err => console.log('Database connection error:', err));

module.exports = sequelize;
