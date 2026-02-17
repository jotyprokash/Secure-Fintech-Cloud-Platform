'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { LogOut, Store, FileText, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { deleteCookie } from 'cookies-next';

interface Merchant {
    id: string;
    businessName: string;
    wallet: {
        id: string;
        currency: string;
    };
}

interface Invoice {
    id: string;
    amount: string;
    currency: string;
    status: string;
    createdAt: string;
}

export default function MerchantDashboard() {
    const [merchant, setMerchant] = useState<Merchant | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [createLoading, setCreateLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const fetchData = async () => {
        try {
            setLoading(true);
            const merchantData = await apiRequest('/merchants/my');
            setMerchant(merchantData);
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
        deleteCookie('merchant_token');
        router.push('/login');
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setMessage('');

        try {
            const invoice = await apiRequest('/merchants/invoices', 'POST', {
                amount: Number(invoiceAmount),
                currency: 'USD',
            });

            setMessage(`Invoice created! ID: ${invoice.id}`);
            setInvoiceAmount('');
            setInvoices([invoice, ...invoices]);
        } catch (err: any) {
            setMessage('Error: ' + err.message);
        } finally {
            setCreateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="animate-pulse text-emerald-500">Loading Merchant Portal...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-900/20 blur-[100px] pointer-events-none" />

            <header className="flex justify-between items-center mb-10 relative z-10 glass p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center font-bold text-lg">
                        <Store className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">{merchant?.businessName}</h1>
                        <p className="text-xs text-gray-400">Merchant Portal</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            <main className="max-w-4xl mx-auto space-y-8 relative z-10">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Stats Cards */}
                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <p className="text-gray-400 text-sm">Total Revenue</p>
                        </div>
                        <p className="text-3xl font-bold">$0.00</p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <p className="text-gray-400 text-sm">Invoices</p>
                        </div>
                        <p className="text-3xl font-bold">{invoices.length}</p>
                    </div>

                    <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <p className="text-gray-400 text-sm">Growth</p>
                        </div>
                        <p className="text-3xl font-bold">+0%</p>
                    </div>
                </div>

                {/* Create Invoice */}
                <div className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-emerald-400" />
                        Create Invoice
                    </h2>

                    <form onSubmit={handleCreateInvoice} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Amount (Cents)</label>
                            <input
                                type="number"
                                value={invoiceAmount}
                                onChange={(e) => setInvoiceAmount(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl input-field font-mono"
                                placeholder="5000"
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
                            disabled={createLoading}
                            className="w-full py-4 rounded-xl btn-primary font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                            {createLoading ? 'Creating...' : 'Create Invoice'}
                        </button>
                    </form>
                </div>

                {/* Recent Invoices */}
                <div className="glass-card p-8 rounded-2xl">
                    <h2 className="text-xl font-bold mb-6">Recent Invoices</h2>
                    <div className="space-y-4">
                        {invoices.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No invoices yet</p>
                        ) : (
                            invoices.map((invoice) => (
                                <div key={invoice.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Invoice #{invoice.id.slice(0, 8)}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(invoice.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold font-mono">
                                            ${(Number(invoice.amount) / 100).toFixed(2)}
                                        </div>
                                        <div className={`text-xs mt-1 ${invoice.status === 'PAID' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                            {invoice.status}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Wallet Info */}
                <div className="glass-card p-6 rounded-2xl">
                    <p className="text-xs text-gray-500 font-mono">
                        Merchant Wallet ID: <span className="select-all text-gray-300">{merchant?.wallet.id}</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
