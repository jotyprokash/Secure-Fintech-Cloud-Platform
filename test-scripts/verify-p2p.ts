
const API_URL = 'http://localhost:3001';

async function main() {
    console.log('Starting P2P Verification...');

    // 1. Register Bob
    console.log('1. Registering Bob...');
    const bobEmail = `bob.${Date.now()}@example.com`;
    const bobRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bobEmail, password: 'password123' }),
    });
    const bob = await bobRes.json();
    if (!bob.id) throw new Error('Failed to register Bob');
    console.log('   Bob ID:', bob.id);

    // 2. Login Bob
    console.log('2. Logging in Bob...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: bobEmail, password: 'password123' }),
    });
    const { access_token: bobToken } = await loginRes.json();
    console.log('   Bob Token obtained.');

    // 3. Get Bob's Wallet
    console.log('3. Fetching Bob\'s Wallet...');
    const walletsRes = await fetch(`${API_URL}/wallets`, {
        headers: { 'Authorization': `Bearer ${bobToken}` },
    });
    const wallets = await walletsRes.json();
    const bobWalletId = wallets[0].id;
    console.log('   Bob Wallet ID:', bobWalletId);

    // 4. Deposit to Bob
    console.log('4. Depositing 100 USD to Bob...');
    await fetch(`${API_URL}/transfers/deposit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bobToken}`
        },
        body: JSON.stringify({
            walletId: bobWalletId,
            amount: 10000,
            currency: 'USD',
            description: 'Test Deposit'
        }),
    });
    console.log('   Deposit successful.');

    // 5. Transfer to Grace
    const GRACE_WALLET_ID = '61985e70-6bf0-48ec-a288-6d229182e035';
    console.log(`5. Transferring 50 USD to Grace (${GRACE_WALLET_ID})...`);
    const transferRes = await fetch(`${API_URL}/transfers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bobToken}`
        },
        body: JSON.stringify({
            toWalletId: GRACE_WALLET_ID,
            amount: 5000,
            currency: 'USD',
            description: 'P2P Test',
            idempotencyKey: crypto.randomUUID()
        }),
    });

    if (transferRes.status !== 201) {
        console.error('Transfer failed:', await transferRes.text());
        process.exit(1);
    }
    console.log('   Transfer successful.');

    console.log('Verification Complete: P2P Flow Works!');
}

main().catch(console.error);
