/**
 * ACCOUNT CLASS: Blueprint for every customer
 */
class Account {
    constructor(id, name, balance, photo) {
        this.id = id;
        this.name = name;
        this.balance = parseFloat(balance);
        this.photo = photo || `https://ui-avatars.com/api/?name=${name}`;
    }
}

/**
 * CORE MODULE: Controls all banking logic
 */
const Core = {
    accounts: [],

    init() {
        const saved = localStorage.getItem('quantum_vault_db');
        if (saved) {
            const raw = JSON.parse(saved);
            this.accounts = raw.map(a => new Account(a.id, a.name, a.balance, a.photo));
        }
        this.render();
        this.setupImageListener();
    },

    setupImageListener() {
        document.getElementById('photo-input').onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (event) => document.getElementById('prev').src = event.target.result;
            reader.readAsDataURL(e.target.files[0]);
        };
    },

    register() {
        const name = document.getElementById('new-name').value;
        const bal = document.getElementById('new-bal').value;
        const photo = document.getElementById('prev').src;

        if (!name || !bal) return Swal.fire('Error', 'Full profile required', 'warning');

        const id = Math.floor(100000 + Math.random() * 900000);
        this.accounts.push(new Account(id, name, bal, photo));
        this.sync();
        
        // Reset fields
        document.getElementById('new-name').value = '';
        document.getElementById('new-bal').value = '';
        Swal.fire('Identity Confirmed', `Account #${id} created`, 'success');
    },

    transact(type) {
        const id = parseInt(document.getElementById('target-id').value);
        const amount = parseFloat(document.getElementById('amount').value);
        const acc = this.accounts.find(a => a.id === id);

        if (!acc || isNaN(amount) || amount <= 0) return Swal.fire('Terminal Error', 'Invalid ID or Amount', 'error');

        if (type === 'deposit') {
            acc.balance += amount;
        } else {
            if (acc.balance < amount) return Swal.fire('Declined', 'Insufficient Liquidity', 'error');
            acc.balance -= amount;
        }

        this.sync();
        Swal.fire('Transaction Complete', 'Ledger Updated', 'success');
    },

    sync() {
        localStorage.setItem('quantum_vault_db', JSON.stringify(this.accounts));
        this.render();
    },

    render() {
        const tbody = document.getElementById('client-rows');
        const totalDisp = document.getElementById('total-assets');
        const countDisp = document.getElementById('client-count');

        tbody.innerHTML = this.accounts.map(acc => `
            <tr>
                <td>
                    <div class="row-user">
                        <img src="${acc.photo}" class="avatar-sm">
                        <span>${acc.name}</span>
                    </div>
                </td>
                <td>#${acc.id}</td>
                <td style="color:var(--success); font-weight:bold">$${acc.balance.toLocaleString()}</td>
                <td>
                    <button onclick="Core.delete(${acc.id})" style="color:var(--danger); background:none">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        const total = this.accounts.reduce((sum, a) => sum + a.balance, 0);
        totalDisp.innerText = `$${total.toLocaleString()}`;
        countDisp.innerText = this.accounts.length;
    },

    delete(id) {
        this.accounts = this.accounts.filter(a => a.id !== id);
        this.sync();
    }
};

/**
 * UI CONTROLLER: Handles visual states
 */
const UI = {
    attemptLogin() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;

        if (u === "admin" && p === "1234") {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-shell').classList.remove('hidden');
            Core.init();
        } else {
            Swal.fire('Access Denied', 'Invalid Authentication', 'error');
        }
    }
};
