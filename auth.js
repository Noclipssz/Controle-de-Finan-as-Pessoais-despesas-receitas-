// Elementos DOM
const elements = {
    // Formulários
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginFormElement: document.getElementById('login-form-element'),
    registerFormElement: document.getElementById('register-form-element'),
    
    // Botões de navegação
    showRegisterBtn: document.getElementById('show-register'),
    showLoginBtn: document.getElementById('show-login'),
    demoBtn: document.getElementById('demo-btn'),
    
    // Campos de login
    loginUsername: document.getElementById('login-username'),
    loginPassword: document.getElementById('login-password'),
    loginBtn: document.getElementById('login-btn'),
    rememberMe: document.getElementById('remember-me'),
    
    // Campos de registro
    registerUsername: document.getElementById('register-username'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerConfirm: document.getElementById('register-confirm'),
    registerBtn: document.getElementById('register-btn'),
    acceptTerms: document.getElementById('accept-terms'),
    
    // Mensagens
    loginMessage: document.getElementById('login-message'),
    registerMessage: document.getElementById('register-message'),
    
    // Feedback
    usernameFeedback: document.getElementById('username-feedback'),
    confirmFeedback: document.getElementById('confirm-feedback'),
    passwordStrength: document.getElementById('password-strength'),
    
    // Toggles de senha
    toggleLoginPassword: document.getElementById('toggle-login-password'),
    toggleRegisterPassword: document.getElementById('toggle-register-password')
};

// Estado da aplicação
let isLoading = false;
let passwordVisible = {
    login: false,
    register: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkExistingAuth();
    setupEventListeners();
    setupValidation();
    loadRememberedUser();
});

// Verificar se já está autenticado
function checkExistingAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        window.location.href = 'index.html';
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Navegação entre formulários
    elements.showRegisterBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterForm();
    });
    
    elements.showLoginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Submissão de formulários
    elements.loginFormElement?.addEventListener('submit', handleLogin);
    elements.registerFormElement?.addEventListener('submit', handleRegister);
    
    // Conta demo
    elements.demoBtn?.addEventListener('click', handleDemo);
    
    // Toggles de senha
    elements.toggleLoginPassword?.addEventListener('click', () => togglePassword('login'));
    elements.toggleRegisterPassword?.addEventListener('click', () => togglePassword('register'));
    
    // Enter para submeter
    elements.loginPassword?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
    
    elements.registerConfirm?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleRegister(e);
        }
    });
}

// Configurar validação em tempo real
function setupValidation() {
    // Validação de username
    elements.registerUsername?.addEventListener('input', validateUsername);
    elements.registerUsername?.addEventListener('blur', validateUsername);
    
    // Validação de senha
    elements.registerPassword?.addEventListener('input', validatePassword);
    
    // Validação de confirmação de senha
    elements.registerConfirm?.addEventListener('input', validatePasswordConfirm);
    elements.registerConfirm?.addEventListener('blur', validatePasswordConfirm);
}

// Navegação entre formulários
function showRegisterForm() {
    elements.loginForm?.classList.remove('active');
    elements.registerForm?.classList.add('active');
    clearMessages();
    elements.registerUsername?.focus();
}

function showLoginForm() {
    elements.registerForm?.classList.remove('active');
    elements.loginForm?.classList.add('active');
    clearMessages();
    elements.loginUsername?.focus();
}

// Toggle de visibilidade da senha
function togglePassword(type) {
    const input = type === 'login' ? elements.loginPassword : elements.registerPassword;
    const toggle = type === 'login' ? elements.toggleLoginPassword : elements.toggleRegisterPassword;
    
    if (!input || !toggle) return;
    
    passwordVisible[type] = !passwordVisible[type];
    
    input.type = passwordVisible[type] ? 'text' : 'password';
    toggle.querySelector('i').className = passwordVisible[type] ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// Validações
function validateUsername() {
    const username = elements.registerUsername?.value.trim();
    const feedback = elements.usernameFeedback;
    
    if (!username) {
        setInputState(elements.registerUsername, 'normal');
        setFeedback(feedback, '', '');
        return false;
    }
    
    if (username.length < 3) {
        setInputState(elements.registerUsername, 'error');
        setFeedback(feedback, 'Nome de usuário deve ter pelo menos 3 caracteres', 'error');
        return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setInputState(elements.registerUsername, 'error');
        setFeedback(feedback, 'Use apenas letras, números e underscore', 'error');
        return false;
    }
    
    // Verificar se já existe
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        setInputState(elements.registerUsername, 'error');
        setFeedback(feedback, 'Este nome de usuário já está em uso', 'error');
        return false;
    }
    
    setInputState(elements.registerUsername, 'success');
    setFeedback(feedback, 'Nome de usuário disponível', 'success');
    return true;
}

function validatePassword() {
    const password = elements.registerPassword?.value;
    const strengthElement = elements.passwordStrength;
    
    if (!password) {
        updatePasswordStrength('', 'Digite uma senha');
        return false;
    }
    
    const strength = calculatePasswordStrength(password);
    updatePasswordStrength(strength.level, strength.text);
    
    // Validar confirmação se já foi preenchida
    if (elements.registerConfirm?.value) {
        validatePasswordConfirm();
    }
    
    return strength.level !== 'weak';
}

function validatePasswordConfirm() {
    const password = elements.registerPassword?.value;
    const confirm = elements.registerConfirm?.value;
    const feedback = elements.confirmFeedback;
    
    if (!confirm) {
        setInputState(elements.registerConfirm, 'normal');
        setFeedback(feedback, '', '');
        return false;
    }
    
    if (password !== confirm) {
        setInputState(elements.registerConfirm, 'error');
        setFeedback(feedback, 'As senhas não coincidem', 'error');
        return false;
    }
    
    setInputState(elements.registerConfirm, 'success');
    setFeedback(feedback, 'Senhas coincidem', 'success');
    return true;
}

function calculatePasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Comprimento
    if (password.length >= 8) score += 1;
    else feedback.push('pelo menos 8 caracteres');
    
    // Letras minúsculas
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('letras minúsculas');
    
    // Letras maiúsculas
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('letras maiúsculas');
    
    // Números
    if (/\d/.test(password)) score += 1;
    else feedback.push('números');
    
    // Caracteres especiais
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else feedback.push('caracteres especiais');
    
    const levels = {
        0: { level: 'weak', text: 'Muito fraca' },
        1: { level: 'weak', text: 'Fraca' },
        2: { level: 'fair', text: 'Razoável' },
        3: { level: 'good', text: 'Boa' },
        4: { level: 'strong', text: 'Forte' },
        5: { level: 'strong', text: 'Muito forte' }
    };
    
    return levels[score] || levels[0];
}

function updatePasswordStrength(level, text) {
    const strengthElement = elements.passwordStrength;
    if (!strengthElement) return;
    
    const fill = strengthElement.querySelector('.strength-fill');
    const textElement = strengthElement.querySelector('.strength-text');
    
    if (fill) {
        fill.className = `strength-fill ${level}`;
    }
    
    if (textElement) {
        textElement.textContent = text;
    }
}

function setInputState(input, state) {
    if (!input) return;
    
    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return;
    
    inputGroup.classList.remove('success', 'error');
    if (state !== 'normal') {
        inputGroup.classList.add(state);
    }
}

function setFeedback(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `input-feedback ${type}`;
    element.style.display = message ? 'block' : 'none';
}

// Autenticação
async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    const username = elements.loginUsername?.value.trim();
    const password = elements.loginPassword?.value;
    const remember = elements.rememberMe?.checked;
    
    if (!username || !password) {
        showMessage(elements.loginMessage, 'Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    setLoading(true, 'login');
    
    try {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password
        );
        
        if (user) {
            // Login bem-sucedido
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            } else {
                localStorage.removeItem('rememberedUser');
            }
            
            showMessage(elements.loginMessage, 'Login realizado com sucesso! Redirecionando...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage(elements.loginMessage, 'Nome de usuário ou senha incorretos.', 'error');
        }
    } catch (error) {
        showMessage(elements.loginMessage, 'Erro interno. Tente novamente.', 'error');
    } finally {
        setLoading(false, 'login');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    const username = elements.registerUsername?.value.trim();
    const email = elements.registerEmail?.value.trim();
    const password = elements.registerPassword?.value;
    const confirm = elements.registerConfirm?.value;
    const acceptedTerms = elements.acceptTerms?.checked;
    
    // Validações
    if (!username || !password || !confirm) {
        showMessage(elements.registerMessage, 'Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (!acceptedTerms) {
        showMessage(elements.registerMessage, 'Você deve aceitar os termos de uso.', 'error');
        return;
    }
    
    if (!validateUsername() || !validatePassword() || !validatePasswordConfirm()) {
        showMessage(elements.registerMessage, 'Por favor, corrija os erros antes de continuar.', 'error');
        return;
    }
    
    setLoading(true, 'register');
    
    try {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Verificar novamente se o usuário já existe
        if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            showMessage(elements.registerMessage, 'Este nome de usuário já está em uso.', 'error');
            return;
        }
        
        // Criar novo usuário
        const newUser = {
            id: Date.now(),
            username,
            email: email || null,
            password,
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        showMessage(elements.registerMessage, 'Conta criada com sucesso! Redirecionando para o login...', 'success');
        
        setTimeout(() => {
            showLoginForm();
            elements.loginUsername.value = username;
            elements.loginPassword.value = '';
            elements.loginUsername.focus();
            showMessage(elements.loginMessage, 'Conta criada! Agora você pode fazer login.', 'success');
        }, 2000);
        
    } catch (error) {
        showMessage(elements.registerMessage, 'Erro interno. Tente novamente.', 'error');
    } finally {
        setLoading(false, 'register');
    }
}

async function handleDemo() {
    if (isLoading) return;
    
    setLoading(true, 'demo');
    
    try {
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Criar usuário demo
        const demoUser = {
            id: 'demo',
            username: 'demo',
            email: 'demo@financetracker.com',
            password: 'demo123',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        
        // Criar dados demo
        createDemoData(demoUser.id);
        
        showMessage(elements.loginMessage, 'Conta demo carregada! Redirecionando...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        showMessage(elements.loginMessage, 'Erro ao carregar conta demo.', 'error');
    } finally {
        setLoading(false, 'demo');
    }
}

// Criar dados de demonstração
function createDemoData(userId) {
    const demoTransactions = [
        {
            id: 1,
            description: 'Salário',
            amount: 5000,
            type: 'income',
            categoryId: 7,
            date: '2024-01-15',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            description: 'Supermercado',
            amount: 350,
            type: 'expense',
            categoryId: 1,
            date: '2024-01-16',
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            description: 'Combustível',
            amount: 200,
            type: 'expense',
            categoryId: 2,
            date: '2024-01-17',
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            description: 'Cinema',
            amount: 80,
            type: 'expense',
            categoryId: 4,
            date: '2024-01-18',
            createdAt: new Date().toISOString()
        },
        {
            id: 5,
            description: 'Freelance',
            amount: 800,
            type: 'income',
            categoryId: 7,
            date: '2024-01-20',
            createdAt: new Date().toISOString()
        }
    ];
    
    const demoGoals = [
        {
            id: 1,
            name: 'Viagem de Férias',
            target: 3000,
            current: 1200,
            deadline: '2024-12-31',
            description: 'Economizar para viagem de fim de ano',
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Reserva de Emergência',
            target: 10000,
            current: 4500,
            deadline: '2024-06-30',
            description: 'Criar uma reserva para emergências',
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(demoTransactions));
    localStorage.setItem(`goals_${userId}`, JSON.stringify(demoGoals));
}

// Utilitários
function setLoading(loading, type) {
    isLoading = loading;
    
    let btn, btnText, btnLoader;
    
    switch (type) {
        case 'login':
            btn = elements.loginBtn;
            break;
        case 'register':
            btn = elements.registerBtn;
            break;
        case 'demo':
            btn = elements.demoBtn;
            break;
    }
    
    if (!btn) return;
    
    btnText = btn.querySelector('.btn-text');
    btnLoader = btn.querySelector('.btn-loader');
    
    if (loading) {
        btn.disabled = true;
        btn.classList.add('loading');
        if (btnText) btnText.style.opacity = '0';
        if (btnLoader) btnLoader.style.display = 'block';
    } else {
        btn.disabled = false;
        btn.classList.remove('loading');
        if (btnText) btnText.style.opacity = '1';
        if (btnLoader) btnLoader.style.display = 'none';
    }
}

function showMessage(element, message, type) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Auto-hide após 5 segundos para mensagens de erro
    if (type === 'error') {
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

function clearMessages() {
    [elements.loginMessage, elements.registerMessage].forEach(element => {
        if (element) {
            element.style.display = 'none';
            element.textContent = '';
        }
    });
}

function loadRememberedUser() {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser && elements.loginUsername) {
        elements.loginUsername.value = rememberedUser;
        elements.rememberMe.checked = true;
        elements.loginPassword?.focus();
    }
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter para submeter formulário ativo
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (elements.loginForm?.classList.contains('active')) {
            handleLogin(e);
        } else if (elements.registerForm?.classList.contains('active')) {
            handleRegister(e);
        }
    }
    
    // Escape para limpar mensagens
    if (e.key === 'Escape') {
        clearMessages();
    }
});

// Validação de email (opcional)
elements.registerEmail?.addEventListener('blur', () => {
    const email = elements.registerEmail.value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setInputState(elements.registerEmail, 'error');
    } else {
        setInputState(elements.registerEmail, 'normal');
    }
});

// Prevenção de ataques de força bruta (básico)
let loginAttempts = 0;
const maxAttempts = 5;
let lockoutTime = null;

function checkLockout() {
    if (lockoutTime && Date.now() < lockoutTime) {
        const remainingTime = Math.ceil((lockoutTime - Date.now()) / 1000);
        showMessage(elements.loginMessage, `Muitas tentativas. Tente novamente em ${remainingTime} segundos.`, 'error');
        return true;
    }
    return false;
}

// Interceptar tentativas de login para controle de tentativas
const originalHandleLogin = handleLogin;
handleLogin = async function(e) {
    if (checkLockout()) {
        e.preventDefault();
        return;
    }
    
    const result = await originalHandleLogin.call(this, e);
    
    // Se o login falhou, incrementar tentativas
    if (elements.loginMessage?.textContent.includes('incorretos')) {
        loginAttempts++;
        if (loginAttempts >= maxAttempts) {
            lockoutTime = Date.now() + (5 * 60 * 1000); // 5 minutos
            showMessage(elements.loginMessage, 'Muitas tentativas de login. Conta bloqueada por 5 minutos.', 'error');
        }
    } else if (elements.loginMessage?.textContent.includes('sucesso')) {
        // Reset tentativas em caso de sucesso
        loginAttempts = 0;
        lockoutTime = null;
    }
    
    return result;
};

