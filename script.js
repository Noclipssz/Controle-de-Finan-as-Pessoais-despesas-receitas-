// Verificação de autenticação e inicialização
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Redirecionar para login se não estiver autenticado
if (!currentUser) {
    window.location.href = 'login.html';
}

// Variáveis globais
let transactions = JSON.parse(localStorage.getItem(`transactions_${currentUser.id}`)) || [];
let categories = JSON.parse(localStorage.getItem(`categories_${currentUser.id}`)) || getDefaultCategories();
let goals = JSON.parse(localStorage.getItem(`goals_${currentUser.id}`)) || [];
let charts = {};

// Elementos DOM
const elements = {
    // Navegação
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.content-section'),
    
    // Botões principais
    themeToggle: document.getElementById('theme-toggle'),
    logoutBtn: document.getElementById('logout-btn'),
    addTransactionBtns: [
        document.getElementById('add-transaction-btn'),
        document.getElementById('add-transaction-btn-2')
    ],
    addCategoryBtn: document.getElementById('add-category-btn'),
    addGoalBtn: document.getElementById('add-goal-btn'),
    
    // Modais
    transactionModal: document.getElementById('transaction-modal'),
    categoryModal: document.getElementById('category-modal'),
    goalModal: document.getElementById('goal-modal'),
    
    // Formulários
    transactionForm: document.getElementById('transaction-form'),
    categoryForm: document.getElementById('category-form'),
    goalForm: document.getElementById('goal-form'),
    
    // Displays
    userName: document.getElementById('user-name'),
    totalIncome: document.getElementById('total-income'),
    totalExpense: document.getElementById('total-expense'),
    currentBalance: document.getElementById('current-balance'),
    
    // Listas e grids
    recentTransactionsList: document.getElementById('recent-transactions-list'),
    transactionsTableBody: document.getElementById('transactions-table-body'),
    categoriesGrid: document.getElementById('categories-grid'),
    goalsGrid: document.getElementById('goals-grid'),
    
    // Filtros
    filterCategory: document.getElementById('filter-category'),
    filterType: document.getElementById('filter-type'),
    filterMonth: document.getElementById('filter-month'),
    
    // Campos de formulário
    transactionDescription: document.getElementById('transaction-description'),
    transactionAmount: document.getElementById('transaction-amount'),
    transactionType: document.getElementById('transaction-type'),
    transactionCategory: document.getElementById('transaction-category'),
    transactionDate: document.getElementById('transaction-date'),
    
    categoryName: document.getElementById('category-name'),
    categoryIcon: document.getElementById('category-icon'),
    categoryColor: document.getElementById('category-color'),
    
    goalName: document.getElementById('goal-name'),
    goalTarget: document.getElementById('goal-target'),
    goalDeadline: document.getElementById('goal-deadline'),
    goalDescription: document.getElementById('goal-description')
};

// Categorias padrão
function getDefaultCategories() {
    return [
        { id: 1, name: 'Alimentação', icon: 'fas fa-utensils', color: '#ef4444' },
        { id: 2, name: 'Transporte', icon: 'fas fa-car', color: '#3b82f6' },
        { id: 3, name: 'Casa', icon: 'fas fa-home', color: '#10b981' },
        { id: 4, name: 'Entretenimento', icon: 'fas fa-gamepad', color: '#8b5cf6' },
        { id: 5, name: 'Saúde', icon: 'fas fa-heart', color: '#f59e0b' },
        { id: 6, name: 'Educação', icon: 'fas fa-graduation-cap', color: '#06b6d4' },
        { id: 7, name: 'Trabalho', icon: 'fas fa-briefcase', color: '#64748b' },
        { id: 8, name: 'Compras', icon: 'fas fa-shopping-cart', color: '#ec4899' }
    ];
}

// Funções de armazenamento
function saveData() {
    localStorage.setItem(`transactions_${currentUser.id}`, JSON.stringify(transactions));
    localStorage.setItem(`categories_${currentUser.id}`, JSON.stringify(categories));
    localStorage.setItem(`goals_${currentUser.id}`, JSON.stringify(goals));
}

// Inicialização
function init() {
    setupEventListeners();
    setupNavigation();
    setupTheme();
    loadUserInfo();
    loadCategories();
    updateDashboard();
    renderTransactions();
    renderCategories();
    renderGoals();
    setDefaultDate();
    // Inicializar gráficos apenas quando a seção de relatórios for ativada
}

// Adicionar um listener para o evento DOMContentLoaded para garantir que o DOM esteja pronto
document.addEventListener('DOMContentLoaded', init);eners
function setupEventListeners() {
    // Navegação
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });
    
    // Tema
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Logout
    elements.logoutBtn.addEventListener('click', logout);
    
    // Botões de adicionar
    elements.addTransactionBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => openTransactionModal());
    });
    
    if (elements.addCategoryBtn) {
        elements.addCategoryBtn.addEventListener('click', () => openCategoryModal());
    }
    
    if (elements.addGoalBtn) {
        elements.addGoalBtn.addEventListener('click', () => openGoalModal());
    }
    
    // Formulários
    if (elements.transactionForm) {
        elements.transactionForm.addEventListener('submit', handleTransactionSubmit);
    }
    
    if (elements.categoryForm) {
        elements.categoryForm.addEventListener('submit', handleCategorySubmit);
    }
    
    if (elements.goalForm) {
        elements.goalForm.addEventListener('submit', handleGoalSubmit);
    }
    
    // Filtros
    if (elements.filterCategory) {
        elements.filterCategory.addEventListener('change', applyFilters);
    }
    
    if (elements.filterType) {
        elements.filterType.addEventListener('change', applyFilters);
    }
    
    if (elements.filterMonth) {
        elements.filterMonth.addEventListener('change', applyFilters);
    }
    
    // Fechar modais
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
            closeModals();
        }
    });
    
    // Cancelar formulários
    document.getElementById('cancel-transaction')?.addEventListener('click', closeModals);
    document.getElementById('cancel-category')?.addEventListener('click', closeModals);
    document.getElementById('cancel-goal')?.addEventListener('click', closeModals);
    
    // Exportação
    document.getElementById('export-csv')?.addEventListener('click', exportToCSV);
    document.getElementById('export-pdf')?.addEventListener('click', exportToPDF);
}

// Navegação entre seções
function setupNavigation() {
    showSection('dashboard');
}

function showSection(sectionName) {
    // Atualizar navegação
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === sectionName) {
            item.classList.add('active');
        }
    });
    
    // Mostrar seção
    elements.sections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${sectionName}-section`) {
            section.classList.add('active');
        }
    });
    
    // Atualizar dados específicos da seção
    if (sectionName === 'dashboard') {
        updateDashboard();
    } else if (sectionName === 'transactions') {
        renderTransactions();
    } else if (sectionName === 'categories') {
        renderCategories();
    } else if (sectionName === 'goals') {
        renderGoals();
    } else if (sectionName === 'reports') {
        // Aguardar a transição da seção terminar antes de renderizar os gráficos
        setTimeout(() => {
            updateReports();
        }, 300); // A duração da animação é de 0.3s
    }
}

// Tema
function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Informações do usuário
function loadUserInfo() {
    if (elements.userName) {
        elements.userName.textContent = currentUser.username;
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Categorias
function loadCategories() {
    // Carregar no select de transações
    if (elements.transactionCategory) {
        elements.transactionCategory.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            elements.transactionCategory.appendChild(option);
        });
    }
    
    // Carregar no filtro
    if (elements.filterCategory) {
        elements.filterCategory.innerHTML = '<option value="">Todas as categorias</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            elements.filterCategory.appendChild(option);
        });
    }
}

function renderCategories() {
    if (!elements.categoriesGrid) return;
    
    elements.categoriesGrid.innerHTML = '';
    
    if (categories.length === 0) {
        elements.categoriesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>Nenhuma categoria</h3>
                <p>Crie sua primeira categoria para organizar suas transações</p>
                <button class="btn btn-primary" onclick="openCategoryModal()">
                    <i class="fas fa-plus"></i>
                    Criar Categoria
                </button>
            </div>
        `;
        return;
    }
    
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon" style="color: ${category.color}">
                <i class="${category.icon}"></i>
            </div>
            <h4>${category.name}</h4>
            <div class="category-actions">
                <button class="btn btn-secondary" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary" onclick="deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        elements.categoriesGrid.appendChild(categoryCard);
    });
}

// Transações
function setDefaultDate() {
    if (elements.transactionDate) {
        elements.transactionDate.value = new Date().toISOString().split('T')[0];
    }
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        description: elements.transactionDescription.value.trim(),
        amount: parseFloat(elements.transactionAmount.value),
        type: elements.transactionType.value,
        categoryId: parseInt(elements.transactionCategory.value),
        date: elements.transactionDate.value
    };
    
    if (!formData.description || !formData.amount || formData.amount <= 0) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
    saveData();
    
    updateDashboard();
    renderTransactions();
    closeModals();
    
    // Reset form
    elements.transactionForm.reset();
    setDefaultDate();
    
    showNotification('Transação adicionada com sucesso!', 'success');
}

function renderTransactions() {
    renderRecentTransactions();
    renderTransactionsTable();
}

function renderRecentTransactions() {
    if (!elements.recentTransactionsList) return;
    
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    if (recentTransactions.length === 0) {
        elements.recentTransactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exchange-alt"></i>
                <h3>Nenhuma transação</h3>
                <p>Adicione sua primeira transação para começar</p>
            </div>
        `;
        return;
    }
    
    elements.recentTransactionsList.innerHTML = recentTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        
        return `
            <div class="transaction-item">
                <div class="transaction-icon" style="color: ${category?.color || '#64748b'}">
                    <i class="${category?.icon || 'fas fa-circle'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${category?.name || 'Sem categoria'} • ${date}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'income' ? '+' : '-'}R$ ${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

function renderTransactionsTable() {
    if (!elements.transactionsTableBody) return;
    
    let filteredTransactions = [...transactions];
    
    // Aplicar filtros
    const categoryFilter = elements.filterCategory?.value;
    const typeFilter = elements.filterType?.value;
    const monthFilter = elements.filterMonth?.value;
    
    if (categoryFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.categoryId == categoryFilter);
    }
    
    if (typeFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (monthFilter) {
        const [year, month] = monthFilter.split('-');
        filteredTransactions = filteredTransactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getFullYear() == year && 
                   (transactionDate.getMonth() + 1) == month;
        });
    }
    
    // Ordenar por data (mais recente primeiro)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        elements.transactionsTableBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhuma transação encontrada</h3>
                <p>Tente ajustar os filtros ou adicionar novas transações</p>
            </div>
        `;
        return;
    }
    
    elements.transactionsTableBody.innerHTML = filteredTransactions.map(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        
        return `
            <div class="transaction-row">
                <div>${date}</div>
                <div>${transaction.description}</div>
                <div>
                    <span class="badge" style="background-color: ${category?.color || '#64748b'}20; color: ${category?.color || '#64748b'}">
                        <i class="${category?.icon || 'fas fa-circle'}"></i>
                        ${category?.name || 'Sem categoria'}
                    </span>
                </div>
                <div>
                    <span class="badge ${transaction.type === 'income' ? 'badge-success' : 'badge-danger'}">
                        ${transaction.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    R$ ${transaction.amount.toFixed(2)}
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="editTransaction(${transaction.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="deleteTransaction(${transaction.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function applyFilters() {
    renderTransactionsTable();
}

function deleteTransaction(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        updateDashboard();
        renderTransactions();
        showNotification('Transação excluída com sucesso!', 'success');
    }
}

// Dashboard
function updateDashboard() {
    calculateBalances();
    updateCharts();
}

function calculateBalances() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Atualizar displays
    if (elements.totalIncome) {
        elements.totalIncome.textContent = `R$ ${totalIncome.toFixed(2)}`;
    }
    
    if (elements.totalExpense) {
        elements.totalExpense.textContent = `R$ ${totalExpense.toFixed(2)}`;
    }
    
    if (elements.currentBalance) {
        elements.currentBalance.textContent = `R$ ${balance.toFixed(2)}`;
        elements.currentBalance.className = `amount ${balance >= 0 ? 'positive' : 'negative'}`;
    }
}

function updateCharts() {
    updateBalanceChart();
    updateCategoryChart();
}

function updateBalanceChart() {
    const ctx = document.getElementById('balance-chart');
    if (!ctx) return;
    
    if (charts.balance) {
        charts.balance.destroy();
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    if (income === 0 && expense === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    charts.balance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Receitas', 'Despesas'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    if (charts.category) {
        charts.category.destroy();
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
    });
    
    if (monthlyExpenses.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    const categoryTotals = {};
    monthlyExpenses.forEach(transaction => {
        const category = categories.find(c => c.id === transaction.categoryId);
        const categoryName = category?.name || 'Sem categoria';
        categoryTotals[categoryName] = (categoryTotals[categoryName] || 0) + transaction.amount;
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = labels.map(label => {
        const category = categories.find(c => c.name === label);
        return category?.color || '#64748b';
    });
    
    charts.category = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Modais
function openTransactionModal(transactionId = null) {
    if (elements.transactionModal) {
        elements.transactionModal.classList.add('active');
        
        if (transactionId) {
            // Editar transação existente
            const transaction = transactions.find(t => t.id === transactionId);
            if (transaction) {
                elements.transactionDescription.value = transaction.description;
                elements.transactionAmount.value = transaction.amount;
                elements.transactionType.value = transaction.type;
                elements.transactionCategory.value = transaction.categoryId;
                elements.transactionDate.value = transaction.date;
                
                document.getElementById('transaction-modal-title').textContent = 'Editar Transação';
            }
        } else {
            // Nova transação
            elements.transactionForm.reset();
            setDefaultDate();
            document.getElementById('transaction-modal-title').textContent = 'Nova Transação';
        }
    }
}

function openCategoryModal() {
    if (elements.categoryModal) {
        elements.categoryModal.classList.add('active');
        elements.categoryForm.reset();
    }
}

function openGoalModal() {
    if (elements.goalModal) {
        elements.goalModal.classList.add('active');
        elements.goalForm.reset();
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Categorias
function handleCategorySubmit(e) {
    e.preventDefault();
    
    const category = {
        id: Date.now(),
        name: elements.categoryName.value.trim(),
        icon: elements.categoryIcon.value,
        color: elements.categoryColor.value
    };
    
    if (!category.name) {
        alert('Por favor, preencha o nome da categoria.');
        return;
    }
    
    categories.push(category);
    saveData();
    loadCategories();
    renderCategories();
    closeModals();
    
    showNotification('Categoria criada com sucesso!', 'success');
}

function deleteCategory(id) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        categories = categories.filter(c => c.id !== id);
        saveData();
        loadCategories();
        renderCategories();
        showNotification('Categoria excluída com sucesso!', 'success');
    }
}

// Metas
function handleGoalSubmit(e) {
    e.preventDefault();
    
    const goal = {
        id: Date.now(),
        name: elements.goalName.value.trim(),
        target: parseFloat(elements.goalTarget.value),
        deadline: elements.goalDeadline.value,
        description: elements.goalDescription.value.trim(),
        current: 0,
        createdAt: new Date().toISOString()
    };
    
    if (!goal.name || !goal.target || goal.target <= 0) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    goals.push(goal);
    saveData();
    renderGoals();
    closeModals();
    
    showNotification('Meta criada com sucesso!', 'success');
}

function renderGoals() {
    if (!elements.goalsGrid) return;
    
    elements.goalsGrid.innerHTML = '';
    
    if (goals.length === 0) {
        elements.goalsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <h3>Nenhuma meta</h3>
                <p>Defina suas metas financeiras para manter o foco</p>
                <button class="btn btn-primary" onclick="openGoalModal()">
                    <i class="fas fa-plus"></i>
                    Criar Meta
                </button>
            </div>
        `;
        return;
    }
    
    goals.forEach(goal => {
        const progress = (goal.current / goal.target) * 100;
        const deadline = new Date(goal.deadline).toLocaleDateString('pt-BR');
        const isOverdue = new Date(goal.deadline) < new Date();
        
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.innerHTML = `
            <div class="goal-header">
                <h4>${goal.name}</h4>
                <span class="goal-deadline ${isOverdue ? 'overdue' : ''}">${deadline}</span>
            </div>
            <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
            </div>
            <div class="goal-stats">
                <span>R$ ${goal.current.toFixed(2)} / R$ ${goal.target.toFixed(2)}</span>
                <span>${progress.toFixed(1)}%</span>
            </div>
            ${goal.description ? `<p class="goal-description">${goal.description}</p>` : ''}
            <div class="goal-actions">
                <button class="btn btn-secondary" onclick="updateGoalProgress(${goal.id})">
                    <i class="fas fa-plus"></i>
                    Adicionar Progresso
                </button>
                <button class="btn btn-secondary" onclick="deleteGoal(${goal.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        elements.goalsGrid.appendChild(goalCard);
    });
}

function updateGoalProgress(id) {
    const amount = prompt('Quanto você quer adicionar ao progresso desta meta?');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            goal.current += parseFloat(amount);
            saveData();
            renderGoals();
            showNotification('Progresso atualizado!', 'success');
        }
    }
}

function deleteGoal(id) {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
        goals = goals.filter(g => g.id !== id);
        saveData();
        renderGoals();
        showNotification('Meta excluída com sucesso!', 'success');
    }
}

// Relatórios
function updateReports() {
    updateMonthlyEvolutionChart();
    updateAnnualComparisonChart();
}

function updateMonthlyEvolutionChart() {
    const ctx = document.getElementById("monthly-evolution-chart");
    if (!ctx) return;

    if (charts.monthlyEvolution) {
        charts.monthlyEvolution.destroy();
    }

    const monthlyData = {};
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            monthlyData[monthYear].income += t.amount;
        } else {
            monthlyData[monthYear].expense += t.amount;
        }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const incomes = sortedMonths.map(month => monthlyData[month].income);
    const expenses = sortedMonths.map(month => monthlyData[month].expense);

    // Definir tamanho do canvas antes de criar o gráfico
    const container = ctx.parentElement;
    ctx.width = container.clientWidth - 48; // Subtraindo padding
    ctx.height = 300;

    charts.monthlyEvolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomes,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'Despesas',
                    data: expenses,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateAnnualComparisonChart() {
    const ctx = document.getElementById("annual-comparison-chart");
    if (!ctx) return;

    if (charts.annualComparison) {
        charts.annualComparison.destroy();
    }

    const annualData = {};
    transactions.forEach(t => {
        const year = new Date(t.date).getFullYear();
        if (!annualData[year]) {
            annualData[year] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            annualData[year].income += t.amount;
        } else {
            annualData[year].expense += t.amount;
        }
    });

    const sortedYears = Object.keys(annualData).sort();
    const incomes = sortedYears.map(year => annualData[year].income);
    const expenses = sortedYears.map(year => annualData[year].expense);

    // Definir tamanho do canvas antes de criar o gráfico
    const container = ctx.parentElement;
    ctx.width = container.clientWidth - 48; // Subtraindo padding
    ctx.height = 300;

    charts.annualComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedYears,
            datasets: [
                {
                    label: 'Receitas',
                    data: incomes,
                    backgroundColor: '#10b981'
                },
                {
                    label: 'Despesas',
                    data: expenses,
                    backgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    beginAtZero: true
                }
            }
        }
    });
}

// Exportação
function exportToCSV() {
    const csvContent = [
        ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'],
        ...transactions.map(t => {
            const category = categories.find(c => c.id === t.categoryId);
            return [
                t.date,
                t.description,
                category?.name || 'Sem categoria',
                t.type === 'income' ? 'Receita' : 'Despesa',
                t.amount.toFixed(2)
            ];
        })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Dados exportados para CSV!', 'success');
}

function exportToPDF() {
    showNotification('Funcionalidade de PDF em desenvolvimento!', 'info');
}

// Notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease-in-out;
    `;
    
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Funções globais para eventos inline
window.editTransaction = function(id) {
    openTransactionModal(id);
};

window.deleteTransaction = deleteTransaction;
window.editCategory = function(id) {
    // Implementar edição de categoria
    console.log('Editar categoria:', id);
};
window.deleteCategory = deleteCategory;
window.updateGoalProgress = updateGoalProgress;
window.deleteGoal = deleteGoal;
window.openCategoryModal = openCategoryModal;
window.openGoalModal = openGoalModal;

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', init);

