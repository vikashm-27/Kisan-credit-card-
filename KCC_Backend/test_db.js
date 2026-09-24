const sequelize = require('./db/connection');
const Customer = require('./models/customermodel');

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connected');
        const desc = await sequelize.query("DESCRIBE customers;");
        console.log(desc[0].map(c => c.Field));
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
test();
