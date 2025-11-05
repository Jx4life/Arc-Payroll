import React, { useState, useEffect } from 'react';
import { Wallet, Users, DollarSign, CheckCircle, AlertCircle, Plus, Send, Building2, ArrowLeft, History, TrendingUp } from 'lucide-react';

const FACTORY_CONTRACT_ADDRESS = '0xDb55a5048B1Dc5ea9D9f66dd1e44fb8B39E12870'; // UPDATE THIS
const USDC_CONTRACT_ADDRESS = '0x3600000000000000000000000000000000000000';

const FACTORY_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "companyName", "type": "string"}],
    "name": "createPayroll",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserPayrollsInfo",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "payrollContract", "type": "address"},
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "string", "name": "companyName", "type": "string"}
        ],
        "internalType": "struct PayrollFactoryV2.PayrollInfo[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const PAYROLL_ABI = [
  {"inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "fundContract", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}], "name": "getEmployee", "outputs": [{"internalType": "uint256", "name": "salary", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "role", "type": "string"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "payAllSalaries", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}], "name": "paySalary", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "emp", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "role", "type": "string"}], "name": "setSalary", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
  {"inputs": [], "name": "viewEmployees", "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getContractBalance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getTotalSalaryExpense", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "uint256", "name": "startIndex", "type": "uint256"}, {"internalType": "uint256", "name": "count", "type": "uint256"}], "name": "getPaymentHistory", "outputs": [{"components": [{"internalType": "address", "name": "employee", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"internalType": "string", "name": "note", "type": "string"}], "internalType": "struct PayrollV2Enhanced.PaymentRecord[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function"},
  {"inputs": [], "name": "getTotalPayments", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}
];

const USDC_ABI = [
  {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
  {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"}
];

const ARC_TESTNET_CONFIG = {
  chainId: '0x4CEF52',
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.app']
};

export default function PayrollPlatform() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState('0');
  const [userPayrolls, setUserPayrolls] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [contractBalance, setContractBalance] = useState('0');
  const [totalExpense, setTotalExpense] = useState('0');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companyName, setCompanyName] = useState('');
  const [newEmployee, setNewEmployee] = useState({ address: '', salary: '', name: '', role: '' });
  const [fundAmount, setFundAmount] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (account && web3) {
      loadUserPayrolls();
      loadAccountBalance();
    }
  }, [account, web3]);

  useEffect(() => {
    if (selectedPayroll && web3) loadPayrollData();
  }, [selectedPayroll, web3]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const formatUnits = (value, decimals) => {
    const str = value.toString().padStart(decimals + 1, '0');
    const intPart = str.slice(0, -decimals) || '0';
    const decPart = str.slice(-decimals);
    return parseFloat(`${intPart}.${decPart}`).toFixed(2);
  };

  const parseUnits = (value, decimals) => {
    const [intPart, decPart = ''] = value.split('.');
    const paddedDec = decPart.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(intPart + paddedDec);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showMessage('error', 'Please install MetaMask');
        return;
      }
      const Web3 = (await import('https://cdn.jsdelivr.net/npm/web3@4.3.0/+esm')).default;
      const web3Instance = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3Instance.eth.getAccounts();
      const chainId = await web3Instance.eth.getChainId();
      if (chainId !== BigInt(5042002)) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_TESTNET_CONFIG.chainId }] });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [ARC_TESTNET_CONFIG] });
          }
        }
      }
      setWeb3(web3Instance);
      setAccount(accounts[0]);
      showMessage('success', 'Wallet connected!');
    } catch (error) {
      showMessage('error', 'Failed to connect');
    }
  };

  const disconnectWallet = () => {
    setWeb3(null);
    setAccount('');
    setAccountBalance('0');
    setUserPayrolls([]);
    setSelectedPayroll(null);
    setEmployees([]);
    showMessage('success', 'Disconnected');
  };

  const loadAccountBalance = async () => {
    try {
      const usdc = new web3.eth.Contract(USDC_ABI, USDC_CONTRACT_ADDRESS);
      const balance = await usdc.methods.balanceOf(account).call();
      setAccountBalance(formatUnits(balance.toString(), 6));
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const loadUserPayrolls = async () => {
    try {
      setLoading(true);
      const factory = new web3.eth.Contract(FACTORY_ABI, FACTORY_CONTRACT_ADDRESS);
      const payrollsInfo = await factory.methods.getUserPayrollsInfo(account).call();
      setUserPayrolls(payrollsInfo);
      setLoading(false);
    } catch (error) {
      setUserPayrolls([]);
      setLoading(false);
    }
  };

  const createNewPayroll = async () => {
    if (!companyName.trim()) {
      showMessage('error', 'Enter company name');
      return;
    }
    try {
      setLoading(true);
      const factory = new web3.eth.Contract(FACTORY_ABI, FACTORY_CONTRACT_ADDRESS);
      await factory.methods.createPayroll(companyName).send({ from: account });
      showMessage('success', 'Payroll created!');
      setCompanyName('');
      await loadUserPayrolls();
    } catch (error) {
      showMessage('error', 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const [employeeAddresses, balance, expense, totalPayments] = await Promise.all([
        payroll.methods.viewEmployees().call(),
        payroll.methods.getContractBalance().call(),
        payroll.methods.getTotalSalaryExpense().call(),
        payroll.methods.getTotalPayments().call()
      ]);
      const employeeData = await Promise.all(
        employeeAddresses.map(async (addr) => {
          try {
            const empData = await payroll.methods.getEmployee(addr).call();
            return { address: addr, salary: formatUnits(empData[0].toString(), 6), name: empData[1], role: empData[2] };
          } catch (err) {
            return { address: addr, salary: '0', name: '', role: '' };
          }
        })
      );
      setEmployees(employeeData);
      setContractBalance(formatUnits(balance.toString(), 6));
      setTotalExpense(formatUnits(expense.toString(), 6));
      if (totalPayments > 0) {
        const count = Math.min(Number(totalPayments), 50);
        const history = await payroll.methods.getPaymentHistory(0, count).call();
        setPaymentHistory(history.reverse());
      } else {
        setPaymentHistory([]);
      }
      setLoading(false);
    } catch (error) {
      showMessage('error', 'Failed to load data');
      setLoading(false);
    }
  };

  const fundContract = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      showMessage('error', 'Enter valid amount');
      return;
    }
    try {
      setLoading(true);
      const usdc = new web3.eth.Contract(USDC_ABI, USDC_CONTRACT_ADDRESS);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const amount = parseUnits(fundAmount, 6).toString();
      await usdc.methods.approve(selectedPayroll.payrollContract, amount).send({ from: account });
      await payroll.methods.fundContract(amount).send({ from: account });
      showMessage('success', 'Contract funded!');
      setFundAmount('');
      await loadPayrollData();
      await loadAccountBalance();
    } catch (error) {
      showMessage('error', 'Failed to fund');
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateEmployee = async () => {
    if (!newEmployee.address || !newEmployee.salary || !newEmployee.name || !newEmployee.role) {
      showMessage('error', 'Fill all fields');
      return;
    }
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      const salaryInUsdc = parseUnits(newEmployee.salary, 6).toString();
      await payroll.methods.setSalary(newEmployee.address, salaryInUsdc, newEmployee.name, newEmployee.role).send({ from: account });
      showMessage('success', 'Employee added!');
      setNewEmployee({ address: '', salary: '', name: '', role: '' });
      await loadPayrollData();
    } catch (error) {
      showMessage('error', 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  const paySingleEmployee = async (employeeAddress) => {
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.paySalary(employeeAddress).send({ from: account });
      showMessage('success', 'Salary paid!');
      await loadPayrollData();
      await loadAccountBalance();
    } catch (error) {
      showMessage('error', 'Failed to pay');
    } finally {
      setLoading(false);
    }
  };

  const payAllEmployees = async () => {
    try {
      setLoading(true);
      const payroll = new web3.eth.Contract(PAYROLL_ABI, selectedPayroll.payrollContract);
      await payroll.methods.payAllSalaries().send({ from: account });
      showMessage('success', 'All paid!');
      await loadPayrollData();
      await loadAccountBalance();
    } catch (error) {
      showMessage('error', 'Failed to pay all');
    } finally {
      setLoading(false);
    }
  };
return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-lg"><DollarSign className="text-white" size={32} /></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Arc Payroll</h1>
                <p className="text-gray-600">Decentralized payroll</p>
              </div>
            </div>
            {!account ? (
              <button onClick={connectWallet} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
                <Wallet size={20} />Connect
              </button>
            ) : (
              <div className="text-right"><div className="flex items-center gap-4">
                <div><div className="text-sm text-gray-600">Balance</div><div className="font-semibold text-green-600">{accountBalance} USDC</div></div>
                <div className="border-l border-gray-300 pl-4"><div className="text-sm text-gray-600">Connected</div><div className="font-mono text-sm text-gray-800">{account.slice(0,6)}...{account.slice(-4)}</div></div>
                <button onClick={disconnectWallet} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm">Disconnect</button>
              </div></div>
            )}
          </div>
        </div>
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>
            {message.type==='success'?<CheckCircle size={20}/>:<AlertCircle size={20}/>}{message.text}
          </div>
        )}
        {account && !selectedPayroll && (
          <>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Building2 size={24}/>Create Payroll</h2>
              <div className="flex gap-4">
                <input type="text" placeholder="Company Name" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <button onClick={createNewPayroll} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                  <Plus size={20}/>{loading?'Creating...':'Create'}
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Payrolls ({userPayrolls.length})</h2>
              {loading && userPayrolls.length===0?(<div className="text-center py-8 text-gray-600">Loading...</div>):userPayrolls.length===0?(<div className="text-center py-8 text-gray-600">No payrolls yet</div>):(
                <div className="space-y-3">{userPayrolls.map((p,i)=>(
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={()=>setSelectedPayroll(p)}>
                    <div>
                      <div className="font-semibold text-gray-800">{p.companyName}</div>
                      <div className="font-mono text-sm text-gray-600">{p.payrollContract.slice(0,10)}...{p.payrollContract.slice(-8)}</div>
                      <div className="text-xs text-gray-500">Created: {new Date(Number(p.createdAt)*1000).toLocaleDateString()}</div>
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">Manage</button>
                  </div>
                ))}</div>
              )}
            </div>
          </>
        )}
        {account && selectedPayroll && (
          <>
            <button onClick={()=>setSelectedPayroll(null)} className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700"><ArrowLeft size={20}/>Back</button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-lg p-6"><div className="text-sm text-gray-600 mb-2">Balance</div><div className="text-3xl font-bold text-indigo-600">{contractBalance} USDC</div></div>
              <div className="bg-white rounded-lg shadow-lg p-6"><div className="text-sm text-gray-600 mb-2">Monthly</div><div className="text-3xl font-bold text-orange-600">{totalExpense} USDC</div></div>
              <div className="bg-white rounded-lg shadow-lg p-6"><div className="text-sm text-gray-600 mb-2">Payments</div><div className="text-3xl font-bold text-green-600">{paymentHistory.length}</div></div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={24}/>Fund Contract</h2>
              <div className="flex gap-4">
                <input type="number" placeholder="Amount" value={fundAmount} onChange={(e)=>setFundAmount(e.target.value)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <button onClick={fundContract} disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50">{loading?'Processing...':'Fund'}</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2"><Plus size={24}/>Add Employee</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Name" value={newEmployee.name} onChange={(e)=>setNewEmployee({...newEmployee,name:e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <input type="text" placeholder="Role" value={newEmployee.role} onChange={(e)=>setNewEmployee({...newEmployee,role:e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="flex gap-4">
                <input type="text" placeholder="Address" value={newEmployee.address} onChange={(e)=>setNewEmployee({...newEmployee,address:e.target.value})} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <input type="number" placeholder="Salary" value={newEmployee.salary} onChange={(e)=>setNewEmployee({...newEmployee,salary:e.target.value})} className="w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                <button onClick={addOrUpdateEmployee} disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">{loading?'Processing...':'Add'}</button>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><Users size={24}/>Employees ({employees.length})</h2>
                {employees.length>0&&(<button onClick={payAllEmployees} disabled={loading} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"><Send size={20}/>Pay All</button>)}
              </div>
              {employees.length===0?(<div className="text-center py-8 text-gray-600">No employees</div>):(
                <div className="space-y-3">{employees.map((e,i)=>(
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold text-gray-800">{e.name||'Unknown'}</div>
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">{e.role||'No role'}</span>
                      </div>
                      <div className="font-mono text-sm text-gray-600">{e.address}</div>
                      <div className="text-lg font-semibold text-indigo-600 mt-1">{e.salary} USDC</div>
                    </div>
                    <button onClick={()=>paySingleEmployee(e.address)} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"><Send size={16}/>Pay</button>
                  </div>
                ))}</div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><History size={24}/>History</h2>
                <button onClick={()=>setShowHistory(!showHistory)} className="text-indigo-600 hover:text-indigo-700">{showHistory?'Hide':'Show'}</button>
              </div>
              {showHistory&&(paymentHistory.length===0?(<div className="text-center py-8 text-gray-600">No history</div>):(
                <div className="space-y-2">{paymentHistory.map((p,i)=>(
                  <div key={i} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div><div className="font-mono text-sm text-gray-800">{p.employee}</div><div className="text-xs text-gray-600">{p.note}</div></div>
                      <div className="text-right"><div className="font-semibold text-green-600">{formatUnits(p.amount.toString(),6)} USDC</div><div className="text-xs text-gray-500">{new Date(Number(p.timestamp)*1000).toLocaleString()}</div></div>
                    </div>
                  </div>
                ))}</div>
              ))}
            </div>
          </>
        )}
        {!account&&(<div className="bg-white rounded-lg shadow-lg p-12 text-center"><Wallet size={64} className="mx-auto text-gray-400 mb-4"/><h2 className="text-2xl font-semibold text-gray-800 mb-2">Connect Wallet</h2><p className="text-gray-600">Connect to manage payrolls</p></div>)}
      </div>
    </div>
  );
}
