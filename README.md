# 🏦 Arc Payroll Platform

A fully decentralized payroll management system built on Arc Testnet, enabling businesses to manage employee salaries and process USDC payments on-chain with a multi-tenant architecture.

![Arc Payroll Platform](https://img.shields.io/badge/Built%20on-Arc%20Testnet-blue)
![Solidity](https://img.shields.io/badge/Solidity-0.8.30-orange)
![React](https://img.shields.io/badge/React-19.1.1-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Live Demo

**Live Application:** [arc-payroll-platform.vercel.app]

**Smart Contracts:**
- **Factory Contract:** [0xDb55a5048B1Dc5ea9D9f66dd1e44fb8B39E12870]
- **Network:** Arc Testnet (Chain ID: 5042002)
- **USDC Token:** `0x3600000000000000000000000000000000000000`
- **Explorer:** https://testnet.arcscan.app

---

## ✨ Current Features

### 🏭 Multi-Tenant Architecture
- **Factory Pattern**: Users deploy their own independent payroll contracts
- **Complete Isolation**: Each business owns and controls their contract
- **Unlimited Scalability**: No limits on users, contracts, or employees
- **Gas Efficient**: Only pay for your own contract operations

### 👥 Employee Management
- Add employees with **name, role, wallet address, and monthly salary**
- Update employee information anytime
- Remove employees from payroll
- View all employees in organized dashboard
- Employee profiles with role badges

### 💰 Payment Processing
- **Fund Contract**: Deposit USDC with approval flow
- **Pay Individual**: Process single employee payments with notes
- **Pay All**: Bulk payment processing for entire team
- **Bonus Payments**: One-time payments outside regular salary
- Real-time contract balance tracking
- Monthly expense calculation

### 📊 Dashboard & Analytics
- **Wallet Integration**: MetaMask support with balance display
- **Contract Statistics**: Balance, monthly expenses, total payments
- **Payment History**: Complete on-chain transaction records
- **Employee Cards**: Visual display with names, roles, and salaries
- **Disconnect Functionality**: Secure wallet disconnection

### 🔐 Security Features
- Owner-only access control for sensitive operations
- On-chain data storage and verification
- Transparent and auditable transactions
- No intermediaries or custodians
- Event-driven architecture for tracking

---

## 🚀 Upcoming Features (V3 Roadmap)

### 📅 Payment Scheduling System
- **Recurring Payments**: Daily, weekly, bi-weekly, monthly, and custom intervals
- **Schedule Management**: Pause, resume, and modify payment schedules
- **Automatic Execution**: Process due payments automatically
- **Next Payment Tracker**: View upcoming payment dates
- **Due Payment Detection**: Identify employees ready for payment

### 📈 Enhanced Payment Tracking
- **Employee-Specific History**: Filter payments by individual employee
- **Payment Analytics**: Trends, summaries, and frequency tracking
- **Advanced Reporting**: Monthly reports and expense breakdowns
- **Payment Categories**: Salary, bonus, reimbursement tags
- **Export Functionality**: Download payment records

### 📂 Data Management
- **CSV Export**: Download complete employee records
- **Bulk Import**: Upload employee data via CSV
- **Report Generation**: Automated payroll reports
- **Search & Filters**: Quick employee and payment lookup
- **Backup & Restore**: Export/import contract state

### 🎯 Additional Improvements
- Multi-currency support for other stablecoins
- Mobile-optimized responsive design
- Email/notification integration (off-chain)
- Multi-signature support for payments
- Role-based access control (admin, accountant, viewer)

---

## 🛠️ Tech Stack

**Frontend:**
- React 19.1.1
- Vite 7.1.7
- Tailwind CSS 3.4.1
- Web3.js 4.3.0
- Lucide React (Icons)

**Smart Contracts:**
- Solidity ^0.8.30
- OpenZeppelin Contracts
- Arc Testnet

**Deployment:**
- Vercel (Frontend)
- Remix IDE (Smart Contracts)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet

### Clone Repository
```bash
git clone https://github.com/Jx4life/arc-payroll-platform.git
cd arc-payroll-platform
```

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

---

## 🔧 Smart Contract Deployment

### Using Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file: `contracts/PayrollFactoryV2.sol`
3. Copy contract code from `contracts/` folder
4. Compile with Solidity 0.8.30
5. Deploy to Arc Testnet:
   - Environment: Injected Provider (MetaMask)
   - Constructor parameter: `0x3600000000000000000000000000000000000000`
6. Copy deployed factory address

### Update Frontend Configuration

Edit `src/App.jsx`:
```javascript
const FACTORY_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_FACTORY_ADDRESS';
```

---

## 🧪 Testing Guide

### 1. Setup Arc Testnet in MetaMask

**Network Configuration:**
- **Network Name:** Arc Testnet
- **RPC URL:** `https://rpc.testnet.arc.network`
- **Chain ID:** `5042002`
- **Currency Symbol:** USDC
- **Block Explorer:** `https://testnet.arcscan.app`

### 2. Get Test USDC

Visit [Circle Faucet](https://faucet.circle.com) and request testnet USDC for Arc Testnet.

### 3. Test Workflow

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask
2. **Create Payroll**: Enter company name and deploy your contract
3. **Add Employees**: Fill in name, role, address, and salary
4. **Fund Contract**: Deposit USDC for employee payments
5. **Process Payments**: Pay individual employees or all at once
6. **View History**: Check payment records and transaction details

---

## 📁 Project Structure
```
arc-payroll-platform/
├── contracts/
│   └── PayrollFactoryV2.sol      # Smart contracts
├── src/
│   ├── App.jsx                    # Main React component
│   └── index.css                  # Tailwind styles
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 🏗️ Architecture

### Factory Pattern
```
PayrollFactoryV2
    │
    ├─► Creates PayrollV2Enhanced (User 1)
    │       ├─► Employee 1
    │       ├─► Employee 2
    │       └─► Employee 3
    │
    ├─► Creates PayrollV2Enhanced (User 2)
    │       ├─► Employee 1
    │       └─► Employee 2
    │
    └─► Creates PayrollV2Enhanced (User 3)
            └─► Employee 1
```

### Key Smart Contract Functions

**Factory Contract:**
- `createPayroll(string companyName)` - Deploy new payroll contract
- `getUserPayrollsInfo(address user)` - Get user's payroll contracts
- `getTotalPayrolls()` - Get total contracts deployed

**Payroll Contract:**
- `fundContract(uint256 amount)` - Deposit USDC
- `setSalary(address, uint256, string, string)` - Add/update employee
- `paySalary(address)` - Pay single employee
- `payAllSalaries()` - Pay all employees
- `getPaymentHistory()` - View transaction history
- `getEmployee(address)` - Get employee details

---

## 💡 Why Arc Testnet?

Arc's unique stablecoin-native architecture provides:

- **USDC as Gas**: Simplified UX - no need for ETH + USDC
- **Stable Payments**: Employees receive stable, predictable value
- **Low Transaction Fees**: Cost-effective for regular payroll operations
- **Fast Finality**: Quick payment confirmation
- **Enterprise Ready**: Built for real-world business applications

---

## 🎯 Use Cases

- **Startups & SMEs**: Manage employee payroll without banks
- **DAOs**: Pay contributors with transparency
- **Remote Teams**: Global payroll without borders
- **Freelance Platforms**: Automated contractor payments
- **Web3 Companies**: Native crypto salary distribution

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built for [Hackathon Name]
- Thanks to the Arc team for their innovative blockchain
- OpenZeppelin for secure contract libraries
- The Web3 community for inspiration and support

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Jx4life/arc-payroll-platform/issues)
- **Twitter**: [@YourTwitter] (optional)
- **Discord**: [Your Discord] (optional)

---

## 🌟 Star This Repo!

If you find this project useful, please consider giving it a star ⭐

---

**Built with ❤️ on Arc Testnet**

#Blockchain #Web3 #Payroll #Arc #USDC #DeFi #Solidity #React
