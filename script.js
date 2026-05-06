// --- OOP: Account Class ---
class Account {
    constructor(id, name, balance) {
        this.id = id;
        this.name = name;
        this.balance = parseFloat(balance);
    }

    deposit(amount) {
        this.balance += parseFloat(amount);
    }

    withdraw(amount) {
        if (amount <= this.balance) {
            this.balance -= parseFloat(amount);
            return true;
        }
        return false;
    }
}

// --- Bank System Controller ---
const bankApp = {
    accounts: [],

    // Initialization: Load from "File Management" (LocalStorage)
    init() {
        const savedData = localStorage.getItem('bank_records');
        if (savedData) {
            const rawData = JSON.parse(savedData);
            // Re-instantiate objects to keep class methods
            this.accounts = rawData.map(a => new Account(a.id, a.name, a.balance));
        }
        this.render();
    },

    save() {
        localStorage.setItem('bank_records', JSON.stringify(this.accounts));
        this.render();
    },

    createAccount() {
        const name = document.getElementById('accName').value;
        const deposit = document.getElementById('initialDeposit').value;

        if (name === "" || deposit <= 0) return alert("Enter valid details");

        const id = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit ID
        const newAcc = new Account(id, name, deposit);
        
        this.accounts.push(newAcc);
        this.save();
        
        // Clear Inputs
        document.getElementById('accName').value = "";
        document.getElementById('initialDeposit').value = "";
    },

    handleTransaction(type) {
        const id = parseInt(document.getElementById('targetId').value);
        const amount = parseFloat(document.getElementById('transAmount').value);
        const account = this.accounts.find(a => a.id === id);

        if (!account || isNaN(amount) || amount <= 0) return alert("Invalid ID or Amount");

        if (type === 'deposit') {
            account.deposit(amount);
        } else {
            if (!account.withdraw(amount)) return alert("Insufficient Balance");
        }

        this.save();
    },

    deleteAccount(id) {
        this.accounts = this.accounts.filter(a => a.id !== id);
        this.save();
    },

    render() {
        const tbody = document.getElementById('recordBody');
        tbody.innerHTML = "";
        this.accounts.forEach(acc => {
            tbody.innerHTML += `
                <tr>
                    <td>${acc.id}</td>
                    <td>${acc.name}</td>
                    <td>$${acc.balance.toFixed(2)}</td>
                    <td><button class="delete-btn" onclick="bankApp.deleteAccount(${acc.id})">Close</button></td>
                </tr>
            `;
        });
    }
};

// Start the app
bankApp.init();
