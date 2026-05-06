// --- Authentication Logic ---
const auth = {
    login() {
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;
        if(u === "admin" && p === "1234") {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            document.getElementById('welcomeMsg').innerText = `Admin: ${u}`;
        } else {
            alert("Invalid Credentials");
        }
    },
    logout() {
        location.reload();
    }
};

// --- Account Class with Photo ---
class Account {
    constructor(id, name, balance, photo) {
        this.id = id;
        this.name = name;
        this.balance = parseFloat(balance);
        this.photo = photo || "https://via.placeholder.com/50";
    }
    deposit(amt) { this.balance += amt; }
    withdraw(amt) {
        if(amt <= this.balance) { this.balance -= amt; return true; }
        return false;
    }
}

const bankApp = {
    accounts: [],

    init() {
        const data = localStorage.getItem('real_bank_db');
        if(data) {
            const raw = JSON.parse(data);
            this.accounts = raw.map(a => new Account(a.id, a.name, a.balance, a.photo));
        }
        this.render();
    },

    async createAccount() {
        const name = document.getElementById('accName').value;
        const bal = document.getElementById('initialDeposit').value;
        const file = document.getElementById('profileInput').files[0];
        
        let photoData = "https://via.placeholder.com/50";

        if(file) {
            // Convert image to Base64 String for "File Storage"
            photoData = await this.convertImage(file);
        }

        if(!name || !bal) return alert("Fill all fields");

        const id = Math.floor(10000 + Math.random() * 90000);
        this.accounts.push(new Account(id, name, bal, photoData));
        this.save();
    },

    convertImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
    },

    handleTransaction(type) {
        const id = parseInt(document.getElementById('targetId').value);
        const amt = parseFloat(document.getElementById('transAmount').value);
        const acc = this.accounts.find(a => a.id === id);

        if(!acc || isNaN(amt)) return alert("Invalid Account/Amount");

        if(type === 'deposit') acc.deposit(amt);
        else if(!acc.withdraw(amt)) return alert("Insufficient funds");

        this.save();
    },

    save() {
        localStorage.setItem('real_bank_db', JSON.stringify(this.accounts));
        this.render();
    },

    render() {
        const tbody = document.getElementById('recordBody');
        tbody.innerHTML = this.accounts.map(acc => `
            <tr>
                <td><img src="${acc.photo}" class="row-pic"></td>
                <td>${acc.id}</td>
                <td>${acc.name}</td>
                <td>$${acc.balance.toFixed(2)}</td>
                <td><button onclick="bankApp.delete(${acc.id})" style="background:red; padding:2px 5px;">X</button></td>
            </tr>
        `).join('');
    },

    delete(id) {
        this.accounts = this.accounts.filter(a => a.id !== id);
        this.save();
    }
};

bankApp.init();
