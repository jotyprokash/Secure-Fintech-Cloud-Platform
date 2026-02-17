const API_URL = 'http://localhost:3001';

async function testMerchantJourney() {
    console.log('🏪 Starting Merchant Portal Test\n');
    console.log('='.repeat(60));

    try {
        // ============================================
        // PART 1: Merchant Registration
        // ============================================
        console.log('\n📝 PART 1: Merchant Registration');
        console.log('-'.repeat(60));

        // Register user first
        console.log('\n1️⃣  Registering merchant user...');
        const merchantEmail = `merchant_${Date.now()}@techstore.com`;
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: merchantEmail, password: 'password123' }),
        });

        if (!regRes.ok) {
            throw new Error(`Registration failed: ${await regRes.text()}`);
        }

        const user = await regRes.json();
        console.log(`   ✅ User registered: ${user.email}`);

        // Login
        console.log('\n2️⃣  Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: merchantEmail, password: 'password123' }),
        });

        const { access_token: token } = await loginRes.json();
        console.log('   ✅ Logged in successfully');

        // ============================================
        // PART 2: Create Merchant Profile
        // ============================================
        console.log('\n\n🏪 PART 2: Create Merchant Profile');
        console.log('-'.repeat(60));

        console.log('\n3️⃣  Creating merchant profile...');
        const merchantRes = await fetch(`${API_URL}/merchants`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                businessName: 'Tech Store',
                description: 'Electronics and gadgets',
            }),
        });

        if (!merchantRes.ok) {
            throw new Error(`Merchant creation failed: ${await merchantRes.text()}`);
        }

        const merchant = await merchantRes.json();
        console.log(`   ✅ Merchant created: ${merchant.businessName}`);
        console.log(`   🆔 Merchant ID: ${merchant.id}`);
        console.log(`   💼 Wallet ID: ${merchant.wallet.id}`);

        // ============================================
        // PART 3: Get Merchant Profile
        // ============================================
        console.log('\n\n👤 PART 3: Get Merchant Profile');
        console.log('-'.repeat(60));

        console.log('\n4️⃣  Fetching merchant profile...');
        const myMerchantRes = await fetch(`${API_URL}/merchants/my`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!myMerchantRes.ok) {
            throw new Error(`Failed to fetch merchant: ${await myMerchantRes.text()}`);
        }

        const myMerchant = await myMerchantRes.json();
        console.log(`   ✅ Retrieved: ${myMerchant.businessName}`);
        console.log(`   📧 Email: ${myMerchant.user.email}`);

        // ============================================
        // PART 4: Create Invoices
        // ============================================
        console.log('\n\n📄 PART 4: Create Invoices');
        console.log('-'.repeat(60));

        console.log('\n5️⃣  Creating invoice #1 ($50.00)...');
        const invoice1Res = await fetch(`${API_URL}/merchants/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount: 5000,
                currency: 'USD',
                description: 'Product Purchase',
            }),
        });

        if (!invoice1Res.ok) {
            throw new Error(`Invoice creation failed: ${await invoice1Res.text()}`);
        }

        const invoice1 = await invoice1Res.json();
        console.log(`   ✅ Invoice created: ${invoice1.id}`);
        console.log(`   💵 Amount: $${(Number(invoice1.amount) / 100).toFixed(2)}`);
        console.log(`   📊 Status: ${invoice1.status}`);

        console.log('\n6️⃣  Creating invoice #2 ($100.00)...');
        const invoice2Res = await fetch(`${API_URL}/merchants/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                amount: 10000,
                currency: 'USD',
                description: 'Service Fee',
            }),
        });

        const invoice2 = await invoice2Res.json();
        console.log(`   ✅ Invoice created: ${invoice2.id}`);
        console.log(`   💵 Amount: $${(Number(invoice2.amount) / 100).toFixed(2)}`);

        // ============================================
        // FINAL SUMMARY
        // ============================================
        console.log('\n\n' + '='.repeat(60));
        console.log('✅ ALL MERCHANT TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('\n📋 Summary:');
        console.log('   ✅ Merchant Registration: WORKING');
        console.log('   ✅ Merchant Profile Creation: WORKING');
        console.log('   ✅ Merchant Profile Retrieval: WORKING');
        console.log('   ✅ Invoice Creation: WORKING');
        console.log('   ✅ Merchant Wallet Creation: WORKING');
        console.log('\n🎉 Merchant Portal is fully functional!');

    } catch (error) {
        console.error('\n\n❌ TEST FAILED!');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testMerchantJourney().catch(console.error);
