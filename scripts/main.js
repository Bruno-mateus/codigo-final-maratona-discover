const Modal = {
    open() {
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove("active");
    }
};
const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("devFinances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("devFincances:transactions", JSON.stringify(transactions));

    }
};
const Transaction = {
    all: Storage.get(), //atalho para a const transactions q vai estar no local storage
    add(transaction) {
        Transaction.all.push(transaction);
        app.reload(Transaction.all)
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        app.reload();
    },
    incomes() {

        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount >= 0) {
                income += transaction.amount;
            }
        })

        return utils.formatCurrency(income);

    },
    expenses() {
        let expense = 0;
        Transaction.all.forEach(function(transaction) {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return utils.formatCurrency(expense);
    },
    total(value) {
        let expenses = Transaction.expenses();
        let income = Transaction.incomes();
        expenses = expenses.replace(/\D/g, '');
        income = income.replace(/\D/g, '');
        value = Number(income) + Number(expenses - expenses * 2);
       let total = document.querySelector(".total");
        value<0?total.style.backgroundColor="var(--red)":''
        value>0?total.style.backgroundColor="var(--green)":''
        value===0?total.style.backgroundColor="var(--baby-blue)":''
        return utils.formatCurrency(value);
    }
};

const app = {
    init() {

        Transaction.all.forEach((transaction, index) => { DOM.addTransaction(transaction, index) });
        DOM.updateBalance();
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        app.init()

    }
};
const utils = {
    formatAmount(value) {
        value = document.querySelector('input#amount').value
        value = Number(value.replace(/\,\./g, '')) * 100
        return value
    },
    formatDate(date) {
        const splitedDate = date.split('-');
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: 'currency',
            currency: 'BRL'
        })
        return signal + value;

    }
};
const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues() {
        return {

            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error('Por favor, preencha todos os campos')
        }
    },
    formatData() {
        let { description, amount, date } = Form.getValues();
        amount = utils.formatAmount(amount);
        date = utils.formatDate(date);
        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";

    },
    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    submit(event) {
        event.preventDefault()
        try {
            Form.validateFields();
            const transaction = Form.formatData();
            Form.saveTransaction(transaction);
            Form.clearFields();
            Modal.close();
        } catch (error) {
            document.querySelector('#date').style.border = "1px red solid"
            document.querySelector('#amount').style.border = "1px red solid"
            document.querySelector('#description').style.border = "1px red solid"
            document.querySelector('#description').focus();

            alert(error.message)
        }

    },
};

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    innerHTMLtransaction(transaction, index) {
        const CssClass = transaction.amount < 0 ? 'expense' : 'income';
        const amount = utils.formatCurrency(transaction.amount);
        const html = `
    <td class="description">${transaction.description}</td>
    <td class="${CssClass}">${amount}</td>
    <td class="date">${transaction.date}</td>
    <td><img onclick="Transaction.remove(${index}) "src="./assets/minus.svg" alt="Imagem de remoção"class="imgRemove"></td>`

        return html
    },
    updateBalance() {
        document.querySelector('#expenseCard').innerHTML = `${Transaction.expenses()}`
        document.querySelector('#incomeCard').innerHTML = `${Transaction.incomes()}`
        document.querySelector('#totalCard').innerHTML = `${Transaction.total()}`

    },
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLtransaction(transaction);
        DOM.transactionsContainer.appendChild(tr);
        tr.dataset.index = index;
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
};
app.init();