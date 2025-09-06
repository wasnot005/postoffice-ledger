import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Users, ArrowLeft, Download, BarChart2, Home, FileText, User, Banknote, Landmark, Search, Trash2, Edit, X } from 'lucide-react';

// --- Supabase Setup ---
// IMPORTANT: Replace with your actual Supabase Project URL and Anon Key
const SUPABASE_URL = 'https://xodjpgwrsvqatijvphac.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZGpwZ3dyc3ZxYXRpanZwaGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNTQxMDIsImV4cCI6MjA3MjczMDEwMn0.VPYoxtUvOikAD0u7UjycqfYv8uiYZgQPVoxV-QU8sRg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Helper Functions & Constants ---
const today = () => new Date().toISOString().split('T')[0];

const formatCurrency = (amountInPaise) => {
  const amount = (amountInPaise / 100).toFixed(2);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// --- Generic UI Primitives ---
const Card = ({ children }) => <div className="bg-white rounded-xl shadow-md overflow-hidden">{children}</div>;
Card.Header = ({ children }) => <div className="p-4 border-b border-slate-200 flex items-center gap-4">{children}</div>;
Card.Title = ({ children }) => <h2 className="text-xl font-bold text-slate-800">{children}</h2>;
Card.Content = ({ children, className = '' }) => <div className={`p-4 ${className}`}>{children}</div>;
const Button = ({ children, onClick, variant = 'primary', disabled = false, className = '' }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
  };
  const disabledClasses = 'disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed';
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}>
      {children}
    </button>
  );
};
const DashboardButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center space-y-2 text-center text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200">
        <div className="text-blue-600">{React.cloneElement(icon, { size: 32, strokeWidth: 1.5 })}</div>
        <span className="font-semibold text-sm">{label}</span>
    </button>
)
const Input = ({ className = '', ...props }) => (
    <input 
        {...props} 
        className={`w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${className}`}
    />
);
const Select = ({ children, className = '', ...props }) => (
     <select 
        {...props} 
        className={`w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white ${className}`}
    >
        {children}
    </select>
);
const BackButton = ({ onClick }) => (
    <button onClick={onClick} className="text-slate-500 hover:text-slate-800 p-2 -ml-2 rounded-full">
        <ArrowLeft size={24} />
    </button>
);
const TabButton = ({ children, active, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${active ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>
        {children}
    </button>
);

// --- UI Components ---
const Header = ({ currentPage }) => {
    const titles = {
        dashboard: "Dashboard",
        collectCash: "Collect Cash",
        batchDeposit: "New Batch Deposit",
        customers: "Customers",
        customerDetail: "Customer Ledger",
        reports: "Reports",
    };
    return (
        <header className="bg-white p-4 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-center text-blue-700">Post Office Ledger</h1>
            <p className="text-center text-slate-500 text-sm mt-1">{titles[currentPage] || 'Overview'}</p>
        </header>
    )
}

const Dashboard = ({ undepositedCash, transactions, customerBalances, onNavigate }) => {
    const todayStr = today();
    const todaysCollections = transactions
        .filter(t => t.date === todayStr && t.type === 'collection')
        .reduce((sum, t) => sum + t.amount, 0);

    const todaysDeposits = transactions
        .filter(t => t.date === todayStr && t.type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);

    const pendingCustomersCount = Object.values(customerBalances).filter(bal => bal > 0).length;

    return (
        <div className="space-y-4">
            <Card>
                <Card.Title>Undeposited Cash</Card.Title>
                <Card.Content>
                    <p className="text-4xl font-bold text-green-600">{formatCurrency(undepositedCash)}</p>
                    <p className="text-sm text-slate-500">Total cash collected but not yet deposited.</p>
                </Card.Content>
            </Card>

            <Card>
                <Card.Title>Today's Activity ({todayStr})</Card.Title>
                <Card.Content className="flex justify-around">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-600">Collected</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(todaysCollections)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-slate-600">Deposited</p>
                        <p className="text-2xl font-bold text-orange-600">{formatCurrency(todaysDeposits)}</p>
                    </div>
                </Card.Content>
            </Card>
            
            <Card>
                 <div className="flex justify-between items-center p-4">
                    <div>
                        <p className="font-semibold text-slate-700">Pending Customers</p>
                        <p className="text-2xl font-bold">{pendingCustomersCount}</p>
                    </div>
                    <Button onClick={() => onNavigate('reports')} variant="secondary">View List</Button>
                 </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 pt-4">
                <DashboardButton icon={<Banknote />} label="Collect Cash" onClick={() => onNavigate('collectCash')} />
                <DashboardButton icon={<Landmark />} label="Deposit Batch" onClick={() => onNavigate('batchDeposit')} />
                <DashboardButton icon={<Users />} label="Customers" onClick={() => onNavigate('customers')} />
                <DashboardButton icon={<BarChart2 />} label="Reports" onClick={() => onNavigate('reports')} />
            </div>
        </div>
    );
};

const CollectCashForm = ({ customers, onAddCollection, onAddCustomer, onBack }) => {
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(today());
    const [note, setNote] = useState('');
    const [showNewCustomer, setShowNewCustomer] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState('');
    const [newCustomerPhone, setNewCustomerPhone] = useState('');

    const handleSave = async () => {
        if (!customerId || !amount || amount <= 0) {
            alert("Please select a customer and enter a valid amount.");
            return;
        }
        await onAddCollection({ customerId, amount, date, note });
    };
    
    const handleAddNewCustomer = async () => {
        if (!newCustomerName || !newCustomerPhone) {
            alert("Please enter a name and phone for the new customer.");
            return;
        }
        const newCustomer = await onAddCustomer(newCustomerName, newCustomerPhone);
        if (newCustomer) {
            setCustomerId(newCustomer.id);
            setShowNewCustomer(false);
            setNewCustomerName('');
            setNewCustomerPhone('');
        }
    };

    return (
        <Card>
            <Card.Header>
                <BackButton onClick={onBack} />
                <Card.Title>New Cash Collection</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
                {showNewCustomer ? (
                    <div className="p-4 bg-slate-50 rounded-lg space-y-3 border border-slate-200">
                        <h3 className="font-semibold text-slate-600">Add New Customer</h3>
                        <Input placeholder="Full Name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} />
                        <Input type="tel" placeholder="Phone Number" value={newCustomerPhone} onChange={e => setNewCustomerPhone(e.target.value)} />
                        <div className="flex gap-2">
                           <Button onClick={handleAddNewCustomer} className="flex-1">Save Customer</Button>
                           <Button onClick={() => setShowNewCustomer(false)} variant="secondary" className="flex-1">Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                         <Select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                            <option value="">-- Select Customer --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                        </Select>
                        <Button onClick={() => setShowNewCustomer(true)}><Plus size={16}/></Button>
                    </div>
                )}
                
                <div>
                    <label className="text-sm font-medium text-slate-600">Amount (₹)</label>
                    <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="text-2xl h-14"/>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-600">Date</label>
                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                
                <div>
                    <label className="text-sm font-medium text-slate-600">Note (Optional)</label>
                    <Input placeholder="e.g., for September premium" value={note} onChange={e => setNote(e.target.value)} />
                </div>
                
                <Button onClick={handleSave} className="w-full">Save Collection</Button>
            </Card.Content>
        </Card>
    );
};

const BatchDepositForm = ({ customers, undepositedCash, onAddBatchDeposit, onBack, customerBalances }) => {
    const [date, setDate] = useState(today());
    const [receiptNo, setReceiptNo] = useState('');
    const [lines, setLines] = useState([{ id: 1, customerId: '', amount: '', note: '' }]);

    const customersWithPendingBalance = useMemo(() => {
        return customers.filter(c => customerBalances[c.id] > 0)
            .sort((a,b) => customerBalances[b.id] - customerBalances[a.id]);
    }, [customers, customerBalances]);

    const handleLineChange = (index, field, value) => {
        const newLines = [...lines];
        const line = newLines[index];

        if (field === 'customerId') {
            line.customerId = value;
            if (value && customerBalances[value]) {
                line.amount = (customerBalances[value] / 100).toString();
            } else {
                line.amount = '';
            }
        } else if (field === 'amount') {
            const selectedCustomerId = line.customerId;
            if (selectedCustomerId && customerBalances[selectedCustomerId]) {
                const maxAmount = customerBalances[selectedCustomerId];
                const enteredAmount = parseFloat(value) * 100 || 0;
                
                if (enteredAmount > maxAmount) {
                    line.amount = (maxAmount / 100).toString();
                } else {
                    line.amount = value;
                }
            } else {
                line.amount = value;
            }
        } else {
            line[field] = value;
        }
        
        setLines(newLines);
    };

    const addLine = () => {
        setLines([...lines, { id: Date.now(), customerId: '', amount: '', note: '' }]);
    };

    const removeLine = (index) => {
        const newLines = lines.filter((_, i) => i !== index);
        setLines(newLines);
    };

    const batchTotal = useMemo(() => {
        return lines.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0) * 100;
    }, [lines]);

    const canSave = batchTotal > 0 && batchTotal <= undepositedCash;

    const handleSave = async () => {
        if (!canSave) {
            alert(`Cannot save. Batch total (${formatCurrency(batchTotal)}) exceeds undeposited cash (${formatCurrency(undepositedCash)}) or is zero.`);
            return;
        }
        await onAddBatchDeposit({ date, receiptNo, lines });
    };
    
    return (
        <Card>
            <Card.Header>
                 <BackButton onClick={onBack} />
                <Card.Title>Record Batch Deposit</Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
                    <h3 className="font-semibold text-slate-700">Batch Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600">Visit Date</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                         <div>
                            <label className="text-sm font-medium text-slate-600">Receipt No.</label>
                            <Input placeholder="Optional" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div>
                     <h3 className="font-semibold text-slate-700 mb-2">Deposit Lines</h3>
                     <div className="space-y-3">
                        {lines.map((line, index) => {
                            const availableCustomers = customersWithPendingBalance.filter(c => 
                                c.id === line.customerId || !lines.some(l => l.customerId === c.id)
                            );

                            return (
                                <div key={line.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-white rounded-lg border">
                                    <div className="col-span-12 sm:col-span-5">
                                        <Select value={line.customerId} onChange={e => handleLineChange(index, 'customerId', e.target.value)}>
                                            <option value="">-- Select Customer --</option>
                                            {availableCustomers.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({formatCurrency(customerBalances[c.id])})
                                                </option>
                                            ))}
                                        </Select>
                                    </div>
                                    <div className="col-span-6 sm:col-span-3">
                                        <Input type="number" placeholder="Amount" value={line.amount} onChange={e => handleLineChange(index, 'amount', e.target.value)} />
                                    </div>
                                    <div className="col-span-5 sm:col-span-3">
                                         <Input placeholder="Note" value={line.note} onChange={e => handleLineChange(index, 'note', e.target.value)} />
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button onClick={() => removeLine(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                     <Button onClick={addLine} variant="secondary" className="mt-3 w-full"><Plus size={16} className="mr-1"/> Add Another Customer</Button>
                </div>
                
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg mt-4 text-center">
                    <p className="font-semibold">Batch Total: <span className="text-xl">{formatCurrency(batchTotal)}</span></p>
                    <p className="text-sm">Undeposited Cash: {formatCurrency(undepositedCash)}</p>
                    {!canSave && batchTotal > 0 && <p className="text-sm text-red-600 font-semibold mt-1">Total exceeds cash in hand!</p>}
                </div>

                <Button onClick={handleSave} disabled={!canSave} className="w-full">Save Batch Deposit</Button>
            </Card.Content>
        </Card>
    );
};

const CustomersList = ({ customers, balances, onSelectCustomer, onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    ).sort((a,b) => (balances[b.id] || 0) - (balances[a.id] || 0));

    return (
        <Card>
            <Card.Header>
                 <BackButton onClick={onBack} />
                <Card.Title>All Customers</Card.Title>
            </Card.Header>
            <Card.Content>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <Input 
                        placeholder="Search by name or phone..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <ul className="divide-y divide-slate-200">
                    {filteredCustomers.map(customer => {
                        const balance = balances[customer.id] || 0;
                        return (
                            <li key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="py-3 px-2 flex justify-between items-center hover:bg-slate-50 rounded-md cursor-pointer">
                                <div>
                                    <p className="font-semibold text-slate-800">{customer.name}</p>
                                    <p className="text-sm text-slate-500">{customer.phone}</p>
                                </div>
                                <div>
                                    <p className={`font-bold text-lg ${balance > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {formatCurrency(balance)}
                                    </p>
                                    <p className={`text-xs text-right font-medium ${balance > 0 ? 'text-orange-500' : 'text-green-600'}`}>
                                        {balance > 0 ? 'Pending' : 'Settled'}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </Card.Content>
        </Card>
    );
};

const CustomerDetail = ({ customer, transactions, balance, onBack }) => {
    if (!customer) return <div>Customer not found. <BackButton onClick={onBack} /></div>;

    let runningBalance = 0;
    const transactionsWithRunningBalance = transactions
        .map(t => ({...t}))
        .sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.created_at) - new Date(b.created_at))
        .map(t => {
             runningBalance += (t.type === 'collection' ? t.amount : -t.amount);
             return { ...t, runningBalance };
        })
        .reverse();

    return (
        <Card>
            <Card.Header>
                <BackButton onClick={onBack} />
                <div>
                     <Card.Title>{customer.name}</Card.Title>
                     <p className="text-sm text-slate-500">{customer.phone}</p>
                </div>
            </Card.Header>
            <Card.Content>
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-center mb-4">
                     <p className="text-sm font-semibold">Current Balance</p>
                     <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
                </div>

                <h3 className="font-semibold text-slate-700 mb-2">Transaction History</h3>
                <div className="space-y-2">
                    {transactionsWithRunningBalance.map(t => (
                        <div key={t.id} className="p-3 bg-white rounded-lg border flex justify-between items-start">
                           <div>
                                <p className={`font-bold ${t.type === 'collection' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'collection' ? '+' : '-'} {formatCurrency(t.amount)}
                                </p>
                                <p className="text-sm font-semibold capitalize text-slate-700">{t.type}</p>
                                <p className="text-xs text-slate-500">{t.date}</p>
                                {t.note && <p className="text-xs text-slate-600 mt-1 italic">Note: {t.note}</p>}
                           </div>
                           <div className="text-right">
                                <p className="text-sm font-semibold text-slate-600">{formatCurrency(t.runningBalance)}</p>
                                <p className="text-xs text-slate-400">Balance</p>
                           </div>
                        </div>
                    ))}
                </div>
            </Card.Content>
        </Card>
    );
};

const Reports = ({ customers, transactions, customerBalances, onBack }) => {
    const [activeReport, setActiveReport] = useState('pending');

    const renderReportContent = () => {
        switch(activeReport) {
            case 'pending':
                const pendingCustomersData = customers
                    .filter(c => customerBalances[c.id] > 0)
                    .map(c => {
                        const custTransactions = transactions.filter(t => t.customer_id === c.id);
                        const totalCollected = custTransactions.filter(t => t.type === 'collection').reduce((sum, t) => sum + t.amount, 0);
                        const totalDeposited = custTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
                        return {
                            ...c,
                            totalCollected,
                            totalDeposited,
                            netBalance: customerBalances[c.id]
                        };
                    })
                    .sort((a,b) => b.netBalance - a.netBalance);

                return (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Balances (Safe Card)</h3>
                        <p className="text-sm text-slate-500 mb-4">A summary of customer accounts with a pending balance.</p>
                        {pendingCustomersData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-600">
                                        <tr>
                                            <th className="p-3 font-semibold">Customer</th>
                                            <th className="p-3 font-semibold text-right">Collected</th>
                                            <th className="p-3 font-semibold text-right">Deposited</th>
                                            <th className="p-3 font-semibold text-right">Net Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {pendingCustomersData.map(c => (
                                            <tr key={c.id}>
                                                <td className="p-3 font-medium text-slate-800">{c.name}</td>
                                                <td className="p-3 text-right text-green-600">{formatCurrency(c.totalCollected)}</td>
                                                <td className="p-3 text-right text-red-600">({formatCurrency(c.totalDeposited)})</td>
                                                <td className="p-3 text-right font-bold text-orange-500">{formatCurrency(c.netBalance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 p-4">No pending customer balances.</p>
                        )}
                    </div>
                );
            case 'cashbook':
                 const dailyEntries = transactions.filter(t => t.date === today()).sort((a,b) => new Date(b.date) - new Date(a.date));
                 return (
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Daily Cashbook ({today()})</h3>
                        <p className="text-sm text-slate-500 mb-4">All transactions for today.</p>
                        {dailyEntries.length > 0 ? (
                           <ul className="space-y-2">
                               {dailyEntries.map(t => {
                                   const customer = customers.find(c => c.id === t.customer_id);
                                   return (
                                     <li key={t.id} className="p-3 bg-white rounded-lg border flex justify-between items-center">
                                         <div>
                                            <p className={`font-bold capitalize ${t.type === 'collection' ? 'text-green-600' : 'text-red-600'}`}>{t.type}</p>
                                            <p className="text-sm font-semibold">{customer?.name || 'N/A'}</p>
                                         </div>
                                         <p className="font-semibold">{formatCurrency(t.amount)}</p>
                                     </li>
                                   )
                               })}
                           </ul>
                        ) : (
                           <p className="text-center text-slate-500 p-4">No transactions recorded today.</p>
                        )}
                     </div>
                 )
            default:
                return null;
        }
    }
    
    return (
        <Card>
            <Card.Header>
                <BackButton onClick={onBack} />
                <Card.Title>Reports & Exports</Card.Title>
            </Card.Header>
            <Card.Content>
                <div className="flex gap-2 mb-4 border-b border-slate-200">
                    <TabButton active={activeReport === 'pending'} onClick={() => setActiveReport('pending')}>Pending Deposits</TabButton>
                    <TabButton active={activeReport === 'cashbook'} onClick={() => setActiveReport('cashbook')}>Daily Cashbook</TabButton>
                </div>
                
                {renderReportContent()}
                
                <div className="mt-6 pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-2">Export Data</h3>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1" onClick={() => alert("PDF export coming soon!")}>
                            <Download size={16} className="mr-2" /> PDF
                        </Button>
                         <Button variant="secondary" className="flex-1" onClick={() => alert("CSV export coming soon!")}>
                            <Download size={16} className="mr-2" /> CSV
                        </Button>
                    </div>
                </div>
            </Card.Content>
        </Card>
    );
};

// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
        const { data: customersData, error: customersError } = await supabase.from('customers').select('*').order('name');
        if (customersError) throw customersError;
        
        const { data: transactionsData, error: transactionsError } = await supabase.from('transactions').select('*');
        if (transactionsError) throw transactionsError;

        setCustomers(customersData || []);
        setTransactions(transactionsData || []);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Could not fetch data from the server. Check your Supabase credentials and network connection.");
    } finally {
        setIsLoading(false);
    }
  };

  // Load data from Supabase on initial render
  useEffect(() => {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        alert("Please update your Supabase credentials in the code.");
        setIsLoading(false);
        return;
    }
    fetchData();
  }, []);

  // --- Derived State & Calculations (Memoized for performance) ---
  const customerBalances = useMemo(() => {
    const balances = {};
    customers.forEach(c => balances[c.id] = 0);
    transactions.forEach(t => {
      const customerId = t.customer_id; 
      if (balances[customerId] === undefined) return;
      if (t.type === 'collection') {
        balances[customerId] += t.amount;
      } else if (t.type === 'deposit') {
        balances[customerId] -= t.amount;
      }
    });
    return balances;
  }, [customers, transactions]);

  const undepositedCash = useMemo(() => {
    return transactions.reduce((total, t) => {
      if (t.type === 'collection') return total + t.amount;
      if (t.type === 'deposit') return total - t.amount;
      return total;
    }, 0);
  }, [transactions]);

  const navigateTo = (pageName, customerId = null) => {
    setSelectedCustomerId(customerId);
    setPage(pageName);
  };

  // --- Data Handling Functions ---
  const addCustomer = async (name, phone) => {
    const { data, error } = await supabase
      .from('customers')
      .insert([{ name, phone }])
      .select();
    
    if (error) {
      console.error("Error adding customer:", error);
      alert(`Error: ${error.message}`);
      return null;
    }
    
    await fetchData(); 
    return data[0];
  };

  const addCollection = async ({ customerId, amount, date, note }) => {
    const { error } = await supabase.from('transactions').insert({
      customer_id: customerId,
      type: 'collection',
      amount: parseInt(parseFloat(amount) * 100, 10),
      date,
      note,
    });

    if (error) {
        console.error("Error adding collection:", error);
        alert(`Error: ${error.message}`);
    } else {
        await fetchData();
        navigateTo('customers');
    }
  };
  
  const addBatchDeposit = async (batchData) => {
    const newDepositTransactions = batchData.lines
      .filter(line => line.customerId && line.amount > 0)
      .map(line => ({
        customer_id: line.customerId,
        type: 'deposit',
        amount: parseInt(parseFloat(line.amount) * 100, 10),
        date: batchData.date,
        note: line.note,
        receipt_no: batchData.receiptNo
    }));

    if (newDepositTransactions.length > 0) {
        const { error } = await supabase.from('transactions').insert(newDepositTransactions);
        if (error) {
            console.error("Error adding batch deposit:", error);
            alert(`Error: ${error.message}`);
        } else {
             await fetchData();
        }
    }
    
    navigateTo('dashboard');
  };

  const renderPage = () => {
    switch (page) {
      case 'collectCash':
        return <CollectCashForm customers={customers} onAddCollection={addCollection} onAddCustomer={addCustomer} onBack={() => navigateTo('dashboard')} />;
      case 'batchDeposit':
        return <BatchDepositForm customers={customers} customerBalances={customerBalances} undepositedCash={undepositedCash} onAddBatchDeposit={addBatchDeposit} onBack={() => navigateTo('dashboard')} />;
      case 'customers':
        return <CustomersList customers={customers} balances={customerBalances} onSelectCustomer={(id) => navigateTo('customerDetail', id)} onBack={() => navigateTo('dashboard')} />;
      case 'customerDetail':
        const customer = customers.find(c => c.id === selectedCustomerId);
        const customerTransactions = transactions.filter(t => t.customer_id === selectedCustomerId).sort((a,b) => new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at));
        return <CustomerDetail customer={customer} transactions={customerTransactions} balance={customerBalances[selectedCustomerId]} onBack={() => navigateTo('customers')} />;
      case 'reports':
        return <Reports customers={customers} transactions={transactions} customerBalances={customerBalances} onBack={() => navigateTo('dashboard')} />;
      default:
        return <Dashboard 
            undepositedCash={undepositedCash}
            transactions={transactions}
            customerBalances={customerBalances}
            onNavigate={navigateTo}
        />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-100"><p className="text-lg text-slate-600">Loading data from Supabase...</p></div>
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
      <div className="container mx-auto max-w-lg p-4">
        <Header currentPage={page} />
        <main className="mt-4">
            {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;


