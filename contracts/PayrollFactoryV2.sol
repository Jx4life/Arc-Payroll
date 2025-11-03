// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Enhanced Payroll contract with funding, history, names, and roles
contract PayrollV2Enhanced {
    address public owner;
    IERC20 public usdc;

    struct Employee {
        uint256 salary;
        bool exists;
        string name;
        string role;
    }

    struct PaymentRecord {
        address employee;
        uint256 amount;
        uint256 timestamp;
        string note;
    }

    mapping(address => Employee) private employees;
    address[] private employeeList;
    PaymentRecord[] public paymentHistory;
    mapping(address => uint256[]) private employeePayments;

    event SalarySet(address indexed employee, uint256 amount, string name, string role);
    event SalaryPaid(address indexed employee, uint256 amount, uint256 timestamp, string note);
    event ContractFunded(address indexed funder, uint256 amount, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);
    event EmployeeRemoved(address indexed employee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _owner, address _usdc) {
        owner = _owner;
        usdc = IERC20(_usdc);
    }

    // --- Funding Functions ---

    function fundContract(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit ContractFunded(msg.sender, amount, block.timestamp);
    }

    function withdrawFunds(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient balance");
        require(usdc.transfer(owner, amount), "Transfer failed");
        emit FundsWithdrawn(owner, amount, block.timestamp);
    }

    // --- Employee Management ---

    function setSalary(address emp, uint256 amount, string memory name, string memory role) external onlyOwner {
        if (!employees[emp].exists) {
            employees[emp] = Employee({
                salary: amount,
                exists: true,
                name: name,
                role: role
            });
            employeeList.push(emp);
        } else {
            employees[emp].salary = amount;
            employees[emp].name = name;
            employees[emp].role = role;
        }
        emit SalarySet(emp, amount, name, role);
    }

    function getEmployee(address emp) external view returns (uint256 salary, string memory name, string memory role) {
        require(employees[emp].exists, "Employee not found");
        Employee memory employee = employees[emp];
        return (employee.salary, employee.name, employee.role);
    }

    function getSalary(address emp) external view returns (uint256) {
        require(employees[emp].exists, "Employee not found");
        return employees[emp].salary;
    }

    function viewEmployees() external view returns (address[] memory) {
        return employeeList;
    }

    function removeEmployee(address emp) external onlyOwner {
        require(employees[emp].exists, "Employee not found");
        employees[emp].exists = false;
        employees[emp].salary = 0;
        
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employeeList[i] == emp) {
                employeeList[i] = employeeList[employeeList.length - 1];
                employeeList.pop();
                break;
            }
        }
        emit EmployeeRemoved(emp);
    }

    // --- Payroll Functions ---

    function paySalary(address emp) public onlyOwner {
        require(employees[emp].exists, "Employee not found");
        uint256 amount = employees[emp].salary;
        require(amount > 0, "Salary is 0");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC");
        require(usdc.transfer(emp, amount), "Transfer failed");
        
        _recordPayment(emp, amount, "Regular salary payment");
    }

    function paySalaryWithNote(address emp, string memory note) external onlyOwner {
        require(employees[emp].exists, "Employee not found");
        uint256 amount = employees[emp].salary;
        require(amount > 0, "Salary is 0");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC");
        require(usdc.transfer(emp, amount), "Transfer failed");
        
        _recordPayment(emp, amount, note);
    }

    function payBonus(address emp, uint256 amount, string memory note) external onlyOwner {
        require(employees[emp].exists, "Employee not found");
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC");
        require(usdc.transfer(emp, amount), "Transfer failed");
        
        _recordPayment(emp, amount, note);
    }

    function payAllSalaries() external onlyOwner {
        for (uint256 i = 0; i < employeeList.length; i++) {
            address emp = employeeList[i];
            if (employees[emp].exists && employees[emp].salary > 0) {
                uint256 amount = employees[emp].salary;
                if (usdc.balanceOf(address(this)) >= amount) {
                    require(usdc.transfer(emp, amount), "Transfer failed");
                    _recordPayment(emp, amount, "Bulk payment");
                }
            }
        }
    }

    // --- Payment History ---

    function _recordPayment(address emp, uint256 amount, string memory note) internal {
        PaymentRecord memory record = PaymentRecord({
            employee: emp,
            amount: amount,
            timestamp: block.timestamp,
            note: note
        });
        
        uint256 recordIndex = paymentHistory.length;
        paymentHistory.push(record);
        employeePayments[emp].push(recordIndex);
        
        emit SalaryPaid(emp, amount, block.timestamp, note);
    }

    function getPaymentHistory(uint256 startIndex, uint256 count) 
        external 
        view 
        returns (PaymentRecord[] memory) 
    {
        if (startIndex >= paymentHistory.length) {
            return new PaymentRecord[](0);
        }
        
        uint256 endIndex = startIndex + count;
        if (endIndex > paymentHistory.length) {
            endIndex = paymentHistory.length;
        }
        
        uint256 resultCount = endIndex - startIndex;
        PaymentRecord[] memory result = new PaymentRecord[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = paymentHistory[startIndex + i];
        }
        
        return result;
    }

    function getEmployeePaymentHistory(address emp, uint256 startIndex, uint256 count)
        external
        view
        returns (PaymentRecord[] memory)
    {
        uint256[] memory indices = employeePayments[emp];
        if (startIndex >= indices.length) {
            return new PaymentRecord[](0);
        }
        
        uint256 endIndex = startIndex + count;
        if (endIndex > indices.length) {
            endIndex = indices.length;
        }
        
        uint256 resultCount = endIndex - startIndex;
        PaymentRecord[] memory result = new PaymentRecord[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = paymentHistory[indices[startIndex + i]];
        }
        
        return result;
    }

    function getTotalPayments() external view returns (uint256) {
        return paymentHistory.length;
    }

    function getEmployeePaymentCount(address emp) external view returns (uint256) {
        return employeePayments[emp].length;
    }

    // --- View Functions ---

    function getContractBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    function getTotalSalaryExpense() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].exists) {
                total += employees[employeeList[i]].salary;
            }
        }
        return total;
    }
}

// Factory contract to deploy enhanced payroll contracts
contract PayrollFactoryV2 {
    address public immutable usdcAddress;
    
    struct PayrollInfo {
        address payrollContract;
        address owner;
        uint256 createdAt;
        string companyName;
    }
    
    mapping(address => address[]) public userPayrolls;
    PayrollInfo[] public allPayrolls;
    mapping(address => uint256) public payrollIndex;
    
    event PayrollCreated(address indexed owner, address indexed payrollContract, string companyName, uint256 timestamp);

    constructor(address _usdcAddress) {
        usdcAddress = _usdcAddress;
    }

    function createPayroll(string memory companyName) external returns (address) {
        PayrollV2Enhanced newPayroll = new PayrollV2Enhanced(msg.sender, usdcAddress);
        address payrollAddress = address(newPayroll);
        
        PayrollInfo memory info = PayrollInfo({
            payrollContract: payrollAddress,
            owner: msg.sender,
            createdAt: block.timestamp,
            companyName: companyName
        });
        
        uint256 index = allPayrolls.length;
        allPayrolls.push(info);
        payrollIndex[payrollAddress] = index;
        userPayrolls[msg.sender].push(payrollAddress);
        
        emit PayrollCreated(msg.sender, payrollAddress, companyName, block.timestamp);
        
        return payrollAddress;
    }

    function getUserPayrolls(address user) external view returns (address[] memory) {
        return userPayrolls[user];
    }

    function getUserPayrollsInfo(address user) external view returns (PayrollInfo[] memory) {
        address[] memory userAddresses = userPayrolls[user];
        PayrollInfo[] memory infos = new PayrollInfo[](userAddresses.length);
        
        for (uint256 i = 0; i < userAddresses.length; i++) {
            uint256 idx = payrollIndex[userAddresses[i]];
            infos[i] = allPayrolls[idx];
        }
        
        return infos;
    }

    function getTotalPayrolls() external view returns (uint256) {
        return allPayrolls.length;
    }

    function getPayrollInfo(address payrollContract) external view returns (PayrollInfo memory) {
        uint256 index = payrollIndex[payrollContract];
        return allPayrolls[index];
    }

    function isValidPayroll(address payrollContract) external view returns (bool) {
        if (allPayrolls.length == 0) return false;
        uint256 index = payrollIndex[payrollContract];
        return allPayrolls[index].payrollContract == payrollContract;
    }
}
