const sequelize = require('./db/connection');
const Customer = require('./models/customermodel');

async function syncDatabase() {
    try {
        console.log('Connecting and syncing Customer model with alter: true...');
        await Customer.sync({ alter: true });
        console.log('Customer model synced successfully with schema updates.');

        // Check if any existing customer has null values for critical display fields,
        // and populate realistic defaults for sample testing if needed
        const customers = await Customer.findAll();
        console.log(`Found ${customers.length} customer records.`);

        // For records that have no cropType or surveyNumber, populate mock values
        const sampleCrops = ['Paddy (Rice)', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Soybean', 'Groundnut'];
        const sampleSurveys = ['Sy. 104/2B', 'Sy. 45/1A', 'Sy. 210/3', 'Sy. 88/1', 'Sy. 12/4C', 'Sy. 301/A', 'Sy. 67/2'];
        
        let updatedCount = 0;
        for (let i = 0; i < customers.length; i++) {
            const c = customers[i];
            let needsUpdate = false;

            if (!c.cropType) {
                c.cropType = sampleCrops[i % sampleCrops.length];
                needsUpdate = true;
            }
            if (!c.surveyNumber) {
                c.surveyNumber = sampleSurveys[i % sampleSurveys.length];
                needsUpdate = true;
            }
            if (!c.landAreaAcres || parseFloat(c.landAreaAcres) === 0) {
                c.landAreaAcres = ((i % 5) + 1.5).toFixed(2);
                needsUpdate = true;
            }
            if (!c.sanctionedAmount || parseFloat(c.sanctionedAmount) === 0) {
                const baseAmount = (parseFloat(c.landAreaAcres || 2) * 55000);
                c.sanctionedAmount = (baseAmount * 1.3).toFixed(2);
                needsUpdate = true;
            }
            if (!c.cibilScore || c.cibilScore === 700) {
                const scores = [742, 680, 785, 615, 720, 810, 650];
                c.cibilScore = scores[i % scores.length];
                needsUpdate = true;
            }
            if (!c.applicationStatus) {
                const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'FLAGGED', 'REJECTED'];
                c.applicationStatus = statuses[i % statuses.length];
                needsUpdate = true;
            }

            if (needsUpdate) {
                await c.save();
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} customers with underwriting fields.`);
        process.exit(0);
    } catch (err) {
        console.error('Error syncing database:', err);
        process.exit(1);
    }
}

syncDatabase();
