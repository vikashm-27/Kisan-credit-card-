const { MongoClient } = require('mongodb');
const sequelize = require('./db/connection');
const User = require('./models/usermodel');

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'userfilevalidation';

async function migrateUsers() {
    let mongoClient;
    try {
        console.log('Connecting to MySQL (Sequelize)...');
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        
        console.log('Connecting to MongoDB...');
        mongoClient = new MongoClient(MONGO_URI);
        await mongoClient.connect();
        const db = mongoClient.db(DB_NAME);
        
        const usersCollection = db.collection('users');
        const users = await usersCollection.find({}).toArray();
        console.log(`Found ${users.length} users in MongoDB.`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const mongoUser of users) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ where: { email: mongoUser.email } });
                if (existingUser) {
                    console.log(`User ${mongoUser.email} already exists. Skipping.`);
                    skippedCount++;
                    continue;
                }
                
                await User.create({
                    username: mongoUser.username,
                    firstName: mongoUser.firstName,
                    lastName: mongoUser.lastName,
                    userId: mongoUser.userId,
                    verified: mongoUser.verified,
                    email: mongoUser.email,
                    confirmPassword: mongoUser.confirmPassword || mongoUser.password, // Required field
                    password: mongoUser.password,
                    role: mongoUser.role || 'user',
                    department: mongoUser.department,
                    status: mongoUser.status || 'active',
                    isDeleted: mongoUser.isDeleted || false,
                    joinDate: mongoUser.joinDate,
                    passwordExpiration: mongoUser.passwordExpiration,
                    passwordResetToken: mongoUser.passwordResetToken,
                    passwordResetTokenExpires: mongoUser.passwordResetTokenExpires
                });
                migratedCount++;
                console.log(`Migrated user: ${mongoUser.email}`);
            } catch (err) {
                console.error(`Error migrating user ${mongoUser.email}:`, err.message);
            }
        }
        
        console.log(`Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        if (mongoClient) {
            await mongoClient.close();
        }
        await sequelize.close();
    }
}

migrateUsers();
