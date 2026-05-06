// --- Powerful Banking Engine ---
class BankAccount {
    constructor(id, name, balance, photo) {
        this.id = id;
        this.name = name;
        this.balance = parseFloat(balance);
        this.photo = photo;
        this.status = "Active";
        this.history = []; // Transaction Ledger
    }
}

const System = {
    vault: [],
    currentUser: null,

    init() {
        const data = localStorage.getItem('quantum_db');
        if (data) {
            const raw = JSON.parse(data);
            this.vault = raw.map(a => Object.assign(new BankAccount(), a));
        }
        this.updateStats();
        this.render();
        
        // Handle image preview
        document.getElementById('photo').addEventListener('change', function(e) {
            const reader = new FileReader();
            reader.onload = (event) => document.getElementById('preview').src = event.target.result;
            reader.readAsDataURL(e.target.files[0]);
        });
    },

    login() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if (u === "admin" && p === "1234") {
            Swal.fire('Access Granted', 'Initializing Quantum Terminal...', 'success');
            document.getElementById('auth-layer').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
        } else {
            Swal.fire('Denied', 'Invalid security credentials', 'error');
        }
    },

    async addAccount() {
        const name = document.getElementById('name').value;
        const bal = document.getElementById('init-dep').value;
        const img = document.getElementById('preview').src;

        if (!name || !bal) return Swal.fire('Error', 'Missing fields', 'warning');

        const id = Math.floor(1000 + Math.random() * 8999);
        const newAcc = new BankAccount(id, name, bal, img);
        
        this.vault.push(newAcc);
        this.persist();
        Swal.fire('Success', `Account #${id} Created`, 'success');
    },

    transact(type) {
        const id = parseInt(document.getElementById('target-id').value);
        const amt = parseFloat(document.getElementById('amount').value);
        const acc = this.vault.find(a => a.id === id);

        if (!acc || isNaN(amt)) return Swal.fire('Fail', 'Target not found', 'error');

        if (type === 'dep') {
            acc.balance += amt;
            acc.history.push(`+ $${amt} Deposit`);
        } else {
            if (acc.balance < amt) return Swal.fire('Overdraft', 'Insufficient funds', 'error');
            acc.balance -= amt;
            acc.history.push(`- $${amt} Withdrawal`);
        }

        this.persist();
        Swal.fire('Processed', 'Ledger updated successfully', 'success');
    },

    persist() {
        localStorage.setItem('quantum_db', JSON.stringify(this.vault));
        this.updateStats();
        this.render();
    },

    updateStats() {
        const total = this.vault.reduce((sum, acc) => sum + acc.balance, 0);
        document.getElementById('total-val').innerText = `$${total.toLocaleString()}`;
    },

    render() {
        const list = document.getElementById('rows');
        list.innerHTML = this.vault.map(acc => `
            <tr>
                <td>
                    <div class="client-cell">
                        <img src="${acc.photo}" class="row-img">
                        <span>${acc.name}</span>
                    </div>
                </td>
                <td>#${acc.id}</td>
                <td><strong>$${acc.balance.toFixed(2)}</strong></td>
                <td><span style="color:var(--green)">● Active</span></td>
                <td><button onclick="System.delete(${acc.id})" style="background:none; border:none; color:var(--red); cursor:pointer"><i class="fas fa-trash"></i></button></td>
            </tr>
        `).join('');
    },

    delete(id) {
        this.vault = this.vault.filter(a => a.id !== id);
        this.persist();
    }
};

System.init();
