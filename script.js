/**
 * CBI Bank CORE ENGINE
 * Developed by: AG
 */

class Account {
    constructor(id, name, balance, photo) {
        this.id = id;
        this.name = name;
        this.balance = parseFloat(balance);
        this.photo = photo || `https://ui-avatars.com/api/?name=${name}&background=003366&color=fff`;
        this.logs = [];
    }
}

const Core = {
    vault: [],

    init() {
        const saved = localStorage.getItem('cbi_pro_db');
        if (saved) {
            const raw = JSON.parse(saved);
            this.vault = raw.map(a => Object.assign(new Account(), a));
        }
        this.render();
        this.setupFileHandler();
        console.log("CBI Banking System Initialized. Credit: AG");
    },

    setupFileHandler() {
        document.getElementById('photo-input').onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (ev) => document.getElementById('prev').src = ev.target.result;
            reader.readAsDataURL(e.target.files[0]);
        };
    },

    register() {
        const name = document.getElementById('new-name').value;
        const bal = document.getElementById('new-bal').value;
        const photo = document.getElementById('prev').src;

        if (!name || !bal) return Swal.fire('CBI Error', 'Incomplete Documentation', 'error');

        const id = Math.floor(Math.random() * 900000) + 100000;
        const acc = new Account(id, name, bal, photo);
        acc.logs.push(`Account created with $${bal} by AG Systems`);

        this.vault.push(acc);
        this.persist();
        
        // Reset
        document.getElementById('new-name').value = '';
        document.getElementById('new-bal').value = '';
        Swal.fire('Success', `CBI Account #${id} Registered`, 'success');
    },

    transact(type) {
        const id = parseInt(document.getElementById('target-id').value);
        const amt = parseFloat(document.getElementById('amount').value);
        const acc = this.vault.find(a => a.id === id);

        if (!acc || isNaN(amt) || amt <= 0) return Swal.fire('Error', 'Invalid Target or Amount', 'error');

        if (type === 'deposit') {
            acc.balance += amt;
            acc.logs.push(`Deposited $${amt}`);
            this.showReceipt(acc, 'Deposit', amt);
        } else {
            if (acc.balance < amt) return Swal.fire('Declined', 'Insufficient Funds', 'warning');
            acc.balance -= amt;
            acc.logs.push(`Withdrew $${amt}`);
            this.showReceipt(acc, 'Withdrawal', amt);
        }

        this.persist();
    },

    showReceipt(acc, type, amt) {
        Swal.fire({
            title: 'Transaction Receipt',
            html: `
                <div style="text-align:left; font-family:monospace;">
                    <p><strong>CBI BANK OFFICIAL</strong></p>
                    <p>Client: ${acc.name}</p>
                    <p>Type: ${type}</p>
                    <p>Amount: $${amt.toFixed(2)}</p>
                    <p>New Balance: $${acc.balance.toFixed(2)}</p>
                    <hr>
                    <p style="font-size:10px;">Processed by AG Terminal</p>
                </div>
            `,
            icon: 'success'
        });
    },

    persist() {
        localStorage.setItem('cbi_pro_db', JSON.stringify(this.vault));
        this.render();
    },

    render() {
        const tbody = document.getElementById('client-rows');
        tbody.innerHTML = this.vault.map(acc => `
            <tr class="client-row">
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${acc.photo}" class="avatar-sm">
                        <span>${acc.name}</span>
                    </div>
                </td>
                <td><code>${acc.id}</code></td>
                <td><strong>$${acc.balance.toLocaleString()}</strong></td>
                <td>
                    <button onclick="Core.delete(${acc.id})" style="color:#ef4444; background:none; font-size:16px;">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        const total = this.vault.reduce((s, a) => s + a.balance, 0);
        document.getElementById('total-assets').innerText = `$${total.toLocaleString()}`;
        document.getElementById('client-count').innerText = this.vault.length;
    },

    delete(id) {
        Swal.fire({
            title: 'Close Account?',
            text: "This record will be permanently purged.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Purge'
        }).then(res => {
            if (res.isConfirmed) {
                this.vault = this.vault.filter(a => a.id !== id);
                this.persist();
            }
        });
    }
};

const UI = {
    attemptLogin() {
        const u = document.getElementById('user').value;
        const p = document.getElementById('pass').value;
        if (u === "admin" && p === "1234") {
            document.getElementById('auth-screen').classList.add('hidden');
            document.getElementById('app-shell').classList.remove('hidden');
            Core.init();
        } else {
            Swal.fire('Denied', 'Invalid Staff Credentials', 'error');
        }
    },

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const icon = document.querySelector('.tool-btn i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    },

    filterTable() {
        const query = document.getElementById('searchBar').value.toLowerCase();
        const rows = document.querySelectorAll('.client-row');
        rows.forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(query) ? '' : 'none';
        });
    }
};
