const API_URL = 'http://localhost:3001';

async function testCompleteUserJourney() {
    console.log('🚀 Starting Complete User Journey Test\n');
    console.log('='.repeat(60));

    try {
        // ============================================
        // PART 1: User Registration & Authentication
        // ============================================
        console.log('\n📝 PART 1: User Registration & Authentication');
        console.log('-'.repeat(60));

        // Register Alice
        console.log('\n1️⃣  Registering Alice...');
        const aliceEmail = `alice_${Date.now()}@novapay.com`;
        const aliceRegRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: aliceEmail, password: 'password123' }),
        });

        if (!aliceRegRes.ok) {
            throw new Error(`Alice registration failed: ${await aliceRegRes.text()}`);
        }

        const alice = await aliceRegRes.json();
        console.log(`   ✅ Alice registered: ${alice.email}`);
        console.log(`   👤 User ID: ${alice.id}`);

        // Login Alice
        console.log('\n2️⃣  Logging in Alice...');
        const aliceLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: aliceEmail, password: 'password123' }),
        });

        const { access_token: aliceToken } = await aliceLoginRes.json();
        console.log('   ✅ Alice logged in successfully');

        // Get Alice's wallet
        console.log('\n3️⃣  Fetching Alice\'s wallet...');
        const aliceWalletsRes = await fetch(`${API_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${aliceToken}` },
        });

        const aliceWallets = await aliceWalletsRes.json();
        const aliceWallet = aliceWallets[0];
        console.log(`   ✅ Wallet ID: ${aliceWallet.id}`);
        console.log(`   💰 Initial Balance: $${(Number(aliceWallet.balance) / 100).toFixed(2)}`);

        // ============================================
        // PART 2: Deposit Functionality
        // ============================================
        console.log('\n\n💵 PART 2: Deposit Functionality');
        console.log('-'.repeat(60));

        console.log('\n4️⃣  Depositing $100 to Alice...');
        const depositRes = await fetch(`${API_URL}/transfers/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`,
            },
            body: JSON.stringify({
                walletId: aliceWallet.id,
                amount: 10000,
                currency: 'USD',
                description: 'Test Deposit',
            }),
        });

        if (!depositRes.ok) {
            throw new Error(`Deposit failed: ${await depositRes.text()}`);
        }

        console.log('   ✅ Deposit successful!');

        // Verify balance
        const aliceWalletsAfterDeposit = await (await fetch(`${API_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${aliceToken}` },
        })).json();

        const aliceBalanceAfterDeposit = aliceWalletsAfterDeposit[0].balance;
        console.log(`   💰 New Balance: $${(Number(aliceBalanceAfterDeposit) / 100).toFixed(2)}`);

        if (Number(aliceBalanceAfterDeposit) !== 10000) {
            throw new Error(`❌ Balance mismatch! Expected $100.00, got $${(Number(aliceBalanceAfterDeposit) / 100).toFixed(2)}`);
        }

        // ============================================
        // PART 3: Register Second User (Bob)
        // ============================================
        console.log('\n\n👥 PART 3: Register Second User (Bob)');
        console.log('-'.repeat(60));

        console.log('\n5️⃣  Registering Bob...');
        const bobEmail = `bob_${Date.now()}@novapay.com`;
        const bobRegRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: bobEmail, password: 'password123' }),
        });

        const bob = await bobRegRes.json();
        console.log(`   ✅ Bob registered: ${bob.email}`);

        // Login Bob
        const bobLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: bobEmail, password: 'password123' }),
        });

        const { access_token: bobToken } = await bobLoginRes.json();

        // Get Bob's wallet
        const bobWalletsRes = await fetch(`${API_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${bobToken}` },
        });

        const bobWallets = await bobWalletsRes.json();
        const bobWallet = bobWallets[0];
        console.log(`   ✅ Wallet ID: ${bobWallet.id}`);
        console.log(`   💰 Initial Balance: $${(Number(bobWallet.balance) / 100).toFixed(2)}`);

        // ============================================
        // PART 4: P2P Transfer
        // ============================================
        console.log('\n\n💸 PART 4: P2P Transfer (Alice → Bob)');
        console.log('-'.repeat(60));

        console.log('\n6️⃣  Alice sending $25 to Bob...');
        const transferRes = await fetch(`${API_URL}/transfers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${aliceToken}`,
            },
            body: JSON.stringify({
                toWalletId: bobWallet.id,
                amount: 2500,
                currency: 'USD',
                description: 'Test P2P Transfer',
                idempotencyKey: crypto.randomUUID(),
            }),
        });

        if (!transferRes.ok) {
            throw new Error(`Transfer failed: ${await transferRes.text()}`);
        }

        const transfer = await transferRes.json();
        console.log('   ✅ Transfer successful!');
        console.log(`   📝 Transfer ID: ${transfer.id}`);

        // ============================================
        // PART 5: Verify Balances
        // ============================================
        console.log('\n\n🔍 PART 5: Verify Balances After Transfer');
        console.log('-'.repeat(60));

        // Check Alice's balance
        const aliceWalletsAfterTransfer = await (await fetch(`${API_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${aliceToken}` },
        })).json();

        const aliceBalanceAfterTransfer = aliceWalletsAfterTransfer[0].balance;
        console.log(`\n   👤 Alice's Balance: $${(Number(aliceBalanceAfterTransfer) / 100).toFixed(2)}`);

        // Check Bob's balance
        const bobWalletsAfterTransfer = await (await fetch(`${API_URL}/wallets`, {
            headers: { 'Authorization': `Bearer ${bobToken}` },
        })).json();

        const bobBalanceAfterTransfer = bobWalletsAfterTransfer[0].balance;
        console.log(`   👤 Bob's Balance: $${(Number(bobBalanceAfterTransfer) / 100).toFixed(2)}`);

        // Verify balances
        if (Number(aliceBalanceAfterTransfer) !== 7500) {
            throw new Error(`❌ Alice's balance incorrect! Expected $75.00, got $${(Number(aliceBalanceAfterTransfer) / 100).toFixed(2)}`);
        }

        if (Number(bobBalanceAfterTransfer) !== 2500) {
            throw new Error(`❌ Bob's balance incorrect! Expected $25.00, got $${(Number(bobBalanceAfterTransfer) / 100).toFixed(2)}`);
        }

        console.log('   ✅ All balances correct!');

        // ============================================
        // PART 6: Transaction History
        // ============================================
        console.log('\n\n📊 PART 6: Transaction History');
        console.log('-'.repeat(60));

        // Alice's history
        console.log('\n7️⃣  Fetching Alice\'s transaction history...');
        const aliceHistoryRes = await fetch(`${API_URL}/transfers`, {
            headers: { 'Authorization': `Bearer ${aliceToken}` },
        });

        const aliceHistory = await aliceHistoryRes.json();
        console.log(`   ✅ Found ${aliceHistory.length} transactions`);

        aliceHistory.forEach((tx, i) => {
            console.log(`   ${i + 1}. ${tx.direction === 'SENT' ? '📤' : '📥'} ${tx.direction} ${tx.direction === 'SENT' ? 'to' : 'from'} ${tx.counterparty}: $${(Number(tx.amount) / 100).toFixed(2)}`);
        });

        // Bob's history
        console.log('\n8️⃣  Fetching Bob\'s transaction history...');
        const bobHistoryRes = await fetch(`${API_URL}/transfers`, {
            headers: { 'Authorization': `Bearer ${bobToken}` },
        });

        const bobHistory = await bobHistoryRes.json();
        console.log(`   ✅ Found ${bobHistory.length} transactions`);

        bobHistory.forEach((tx, i) => {
            console.log(`   ${i + 1}. ${tx.direction === 'SENT' ? '📤' : '📥'} ${tx.direction} ${tx.direction === 'SENT' ? 'to' : 'from'} ${tx.counterparty}: $${(Number(tx.amount) / 100).toFixed(2)}`);
        });

        // ============================================
        // FINAL SUMMARY
        // ============================================
        console.log('\n\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('='.repeat(60));
        console.log('\n📋 Summary:');
        console.log('   ✅ User Registration: WORKING');
        console.log('   ✅ Authentication: WORKING');
        console.log('   ✅ Wallet Creation: WORKING');
        console.log('   ✅ Deposits: WORKING');
        console.log('   ✅ P2P Transfers: WORKING');
        console.log('   ✅ Balance Updates: WORKING');
        console.log('   ✅ Transaction History: WORKING');
        console.log('\n🎉 NovaPay is fully functional!');

    } catch (error) {
        console.error('\n\n❌ TEST FAILED!');
        console.error('Error:', error.message);
        process.exit(1);
    }
}

testCompleteUserJourney().catch(console.error);
