const express = require('express');
const http = require('http');
const adminRoute = require('./routes/adminRoute');
const Customer = require('./models/customermodel');

const app = express();
app.use(express.json());
app.use(adminRoute);

async function runTests() {
    console.log('--- Starting Comprehensive Backend Verification Tests ---');

    // Start real HTTP server on random available port
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Test Express server running at ${baseUrl}`);

    try {
        // Find existing sample customer from database
        const customers = await Customer.findAll({ limit: 1 });
        if (!customers.length) {
            throw new Error('No customers found in DB! Please run database seed/sync.');
        }
        const sampleId = customers[0].id;
        const sampleName = customers[0].firstName;
        console.log(`Using sample customer #${sampleId} (${sampleName})`);

        // Helper fetch wrapper
        const apiGet = async (path) => {
            const res = await fetch(`${baseUrl}${path}`);
            const data = await res.json().catch(() => null);
            return { status: res.status, ok: res.ok, data };
        };

        const apiPut = async (path, body) => {
            const res = await fetch(`${baseUrl}${path}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json().catch(() => null);
            return { status: res.status, ok: res.ok, data };
        };

        // 1. GET /api/admin/applications
        console.log('\n[Test 1] GET /api/admin/applications');
        const res1 = await apiGet('/api/admin/applications');
        if (res1.status !== 200 || !res1.data?.success) {
            throw new Error(`Test 1 Failed: Status ${res1.status}, data: ${JSON.stringify(res1.data)}`);
        }
        console.log('✓ Success! KPIs:', res1.data.kpis);
        console.log('✓ Top-level KPI totalApplications:', res1.data.totalApplications);
        console.log('✓ Top-level KPI pendingReview:', res1.data.pendingReview);
        console.log('✓ Top-level KPI totalDisbursed:', res1.data.totalDisbursed);
        console.log('✓ Top-level KPI approvalRatio:', res1.data.approvalRatio);
        console.log('✓ Applications count:', res1.data.applications?.length, 'Total in DB:', res1.data.totalCount);

        // 2. GET /admin/applications (alternate mount path)
        console.log('\n[Test 2] GET /admin/applications (alternate path)');
        const res2 = await apiGet('/admin/applications');
        if (res2.status !== 200 || !res2.data?.success) {
            throw new Error(`Test 2 Failed: Status ${res2.status}`);
        }
        console.log('✓ Alternate path /admin/applications returned 200 OK');

        // 3. Status filter: PENDING
        console.log('\n[Test 3] GET /api/admin/applications?status=PENDING');
        const res3 = await apiGet('/api/admin/applications?status=PENDING');
        if (res3.status !== 200) throw new Error('Status PENDING query failed');
        console.log('✓ PENDING filter returned count:', res3.data.applications?.length);

        // 4. Status filter: APPROVED
        console.log('\n[Test 4] GET /api/admin/applications?status=APPROVED');
        const res4 = await apiGet('/api/admin/applications?status=APPROVED');
        if (res4.status !== 200) throw new Error('Status APPROVED query failed');
        console.log('✓ APPROVED filter returned count:', res4.data.applications?.length);

        // 5. Search query by sample customer first name
        console.log(`\n[Test 5] Search by firstName "${sampleName}"`);
        const res5 = await apiGet(`/api/admin/applications?search=${encodeURIComponent(sampleName)}&limit=100`);
        console.log('Test 5 totalCount:', res5.data?.totalCount, 'IDs returned:', res5.data?.applications?.map(a => a.id));
        if (res5.status !== 200 || !res5.data.applications?.some(a => a.id === sampleId)) {
            throw new Error(`Search by name "${sampleName}" failed to find record #${sampleId}. totalCount: ${res5.data?.totalCount}`);
        }
        console.log(`✓ Search found ${res5.data.applications.length} match(es) including #${sampleId}`);

        // 6. Search query by application ID in official format (e.g. KCC-2026-0001)
        const formattedAppId = `KCC-2026-${String(sampleId).padStart(4, '0')}`;
        console.log(`\n[Test 6] Search by KCC formatted Application ID "${formattedAppId}"`);
        const res6 = await apiGet(`/api/admin/applications?search=${formattedAppId}`);
        if (res6.status !== 200 || !res6.data.applications?.some(a => a.id === sampleId)) {
            throw new Error(`Search by ID "${formattedAppId}" failed`);
        }
        console.log(`✓ Search by formatted ID found record #${sampleId}`);

        // 7. GET /api/admin/applications/:id
        console.log(`\n[Test 7] GET /api/admin/applications/${sampleId}`);
        const res7 = await apiGet(`/api/admin/applications/${sampleId}`);
        if (res7.status !== 200 || !res7.data?.application) {
            throw new Error(`Single dossier fetch failed: ${JSON.stringify(res7.data)}`);
        }
        console.log('✓ Dossier KYC Status:', res7.data.application.kycStatus?.aadhaar?.status);
        console.log('✓ Dossier Cadastral Land:', res7.data.application.landDossier?.surveyNumber);
        console.log('✓ Scale of Finance Limit:', res7.data.application.calculatedBreakdown?.totalCalculatedLimit);

        // 8. PUT /api/admin/applications/:id/decision - Approve with sanction
        console.log(`\n[Test 8] PUT /api/admin/applications/${sampleId}/decision (Approve Sanction)`);
        const res8 = await apiPut(`/api/admin/applications/${sampleId}/decision`, {
            decision: 'APPROVED',
            remarks: 'Cadastral GIS boundary and KYC Aadhaar verified. Approved by Branch Underwriting Lead.',
            officerId: 101,
            sanctionedAmount: 175000
        });
        if (res8.status !== 200 || !res8.data?.success) {
            throw new Error(`PUT decision failed: ${JSON.stringify(res8.data)}`);
        }
        if (!res8.data.customer || !res8.data.application) {
            throw new Error('PUT decision must return both customer and application');
        }
        if (res8.data.customer.applicationStatus !== 'APPROVED') {
            throw new Error(`Expected APPROVED, got ${res8.data.customer.applicationStatus}`);
        }
        console.log('✓ Decision updated to APPROVED');
        console.log('✓ Customer record returned:', res8.data.customer.firstName, res8.data.customer.applicationStatus);
        console.log('✓ Sanctioned amount:', res8.data.customer.sanctionedAmount);

        // 9. PUT /admin/applications/:id/decision (alternate path) - Flag inspection
        console.log(`\n[Test 9] PUT /admin/applications/${sampleId}/decision (Alternate path: Flag)`);
        const res9 = await apiPut(`/admin/applications/${sampleId}/decision`, {
            decision: 'FLAGGED',
            remarks: 'Physical field inspection scheduled with agriculture field officer.',
            officerId: 102
        });
        if (res9.status !== 200 || res9.data.customer?.applicationStatus !== 'FLAGGED') {
            throw new Error(`Alternate PUT decision failed: ${JSON.stringify(res9.data)}`);
        }
        console.log('✓ Alternate path /admin/applications/:id/decision updated to FLAGGED');

        // 10. PUT decision validation error on invalid status
        console.log('\n[Test 10] PUT decision with invalid status (Expect 400)');
        const res10 = await apiPut(`/api/admin/applications/${sampleId}/decision`, {
            decision: 'INVALID_STATUS_TEST'
        });
        if (res10.status !== 400) {
            throw new Error(`Expected 400 on invalid decision, got ${res10.status}`);
        }
        console.log('✓ Successfully rejected invalid decision with 400 Bad Request');

        // 11. GET non-existent application dossier (Expect 404)
        console.log('\n[Test 11] GET /api/admin/applications/999999999 (Expect 404)');
        const res11 = await apiGet('/api/admin/applications/999999999');
        if (res11.status !== 404) {
            throw new Error(`Expected 404 on non-existent application, got ${res11.status}`);
        }
        console.log('✓ Non-existent ID returned 404 Not Found');

        console.log('\n======================================================');
        console.log('🎉 ALL 11 BACKEND API AND UNDERWRITING TESTS PASSED! 🎉');
        console.log('======================================================\n');

        server.close();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Test Suite Failure:', err);
        server.close();
        process.exit(1);
    }
}

runTests();
