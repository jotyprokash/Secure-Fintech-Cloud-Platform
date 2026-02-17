'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { LogOut, Send, RefreshCw, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Wallet {
    id: string;
    currency: string;
    balance: string; // BigInt as string
}

interface User {
    id: string;
    email: string;
}

interface Transaction {
    id: string;
    amount: string;
    currency: string;
    status: string;
    direction: 'SENT' | 'RECEIVED';
    counterparty: string;
    createdAt: string;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [transferAmount, setTransferAmount] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [transferLoading, setTransferLoading] = useState(false);
    const [depositLoading, setDepositLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [userRes, walletsRes, historyRes] = await Promise.all([
                apiRequest('/auth/profile'),
                apiRequest('/wallets'),
                apiRequest('/transfers'),
            ]);
            setUser(userRes);
            setWallets(walletsRes);
            setTransactions(historyRes);
        } catch (err) {
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    const handleDeposit = async () => {
        setDepositLoading(true);
        setMessage('');
        try {
            const activeWallet = wallets[0];
            if (!activeWallet) return;

            await apiRequest('/transfers/deposit', 'POST', {
                walletId: activeWallet.id,
                amount: 10000, // 100.00 USD
                currency: activeWallet.currency,
                description: 'Web Top-up',
            });

            setMessage('Deposit successful! (+100.00 USD)');
            fetchData();
        } catch (err: any) {
            setMessage('Deposit Error: ' + err.message);
        } finally {
            setDepositLoading(false);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setTransferLoading(true);
        setMessage('');

        try {
            const activeWallet = wallets[0]; // Logic for multi-wallet later
            if (!activeWallet) return;

            const idempotencyKey = crypto.randomUUID();

            await apiRequest('/transfers', 'POST', {
                toWalletId: recipientId,
                amount: Number(transferAmount), // Input in cents for MVP? Or convert. Assuming cents for now as per API.
                currency: activeWallet.currency,
                description: 'Web Transfer',
                idempotencyKey,
            });

            setMessage('Transfer successful!');
            setTransferAmount('');
            setRecipientId('');
            fetchData(); // Refresh balance
        } catch (err: any) {
            setMessage('Error: ' + err.message);
        } finally {
            setTransferLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-pulse text-blue-500">Loading NovaPay...</div>
            </div>
        );
    }

    const primaryWallet = wallets[0];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative">
            {/* Ambient Light */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-900/20 blur-[100px] pointer-events-none" />

            <header className="flex justify-between items-center mb-10 relative z-10 glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center font-bold text-lg">
                        {user?.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">My Wallet</h1>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            <main className="max-w-4xl mx-auto space-y-8 relative z-10">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Balance Card */}
                    <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Wallet className="w-32 h-32" />
                        </div>
                        <p className="text-gray-400 font-medium mb-1">Total Balance</p>
                        <div className="text-5xl font-bold tracking-tight mb-4 flex items-baseline gap-2">
                            {primaryWallet ? (Number(primaryWallet.balance) / 100).toFixed(2) : '0.00'}
                            <span className="text-xl text-gray-500 font-normal">{primaryWallet?.currency || 'USD'}</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDeposit}
                                disabled={depositLoading}
                                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {depositLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                                Add Money
                            </button>
                            <button onClick={fetchData} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                <RefreshCw className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-xs text-gray-500 font-mono">
                                Wallet ID: <span className="select-all text-gray-300">{primaryWallet?.id}</span>
                            </p>
                        </div>
                    </div>

                    {/* Transfer Card */}
                    <div className="glass-card p-8 rounded-2xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-400" />
                            Send Money
                        </h2>

                        <form onSubmit={handleTransfer} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Recipient Wallet ID</label>
                                <input
                                    type="text"
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl input-field"
                                    placeholder="UUID..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Amount (Cents)</label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl input-field font-mono"
                                    placeholder="1000"
                                    min="1"
                                    required
                                />
                            </div>

                            {message && (
                                <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={transferLoading}
                                className="w-full py-4 rounded-xl btn-primary font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {transferLoading ? 'Processing...' : 'Send Payment'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No transactions yet</p>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.direction === 'RECEIVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {tx.direction === 'RECEIVED' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {tx.direction === 'RECEIVED' ? 'Received from' : 'Sent to'} <span className="text-gray-400">{tx.counterparty}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold font-mono ${tx.direction === 'RECEIVED' ? 'text-emerald-400' : 'text-white'}`}>
                                        {tx.direction === 'RECEIVED' ? '+' : '-'}{(Number(tx.amount) / 100).toFixed(2)} {tx.currency}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
