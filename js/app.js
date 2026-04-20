// =====================================================
// Инициализация Telegram Web App
// =====================================================
const tg = window.Telegram.WebApp;

tg.expand();
tg.ready();

// Отображаем статус
const statusDiv = document.getElementById('telegramStatus');
if (statusDiv) {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        statusDiv.innerHTML = `✅ Подключено | ${user.first_name || ''}`;
        statusDiv.style.color = '#34c759';
    }
}

// =====================================================
// Глобальные переменные
// =====================================================
let isSubmitting = false;

const form = document.getElementById('kaspiAuthForm');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const tokenInput = document.getElementById('token');
const messageContainer = document.getElementById('messageContainer');

// =====================================================
// Вспомогательные функции
// =====================================================

function showMessage(text, type = 'info') {
    messageContainer.innerHTML = text;
    messageContainer.className = `message-container message-${type}`;
    messageContainer.style.display = 'block';
}

function setLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    isSubmitting = isLoading;
    submitBtn.disabled = isLoading;
    
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline-flex' : 'none';
}

// =====================================================
// Валидация
// =====================================================

function validateForm() {
    const errors = [];
    
    if (!loginInput.value.trim()) errors.push('Введите логин');
    if (!passwordInput.value) errors.push('Введите пароль');
    if (!tokenInput.value.trim()) errors.push('Введите API токен');
    
    return errors;
}

// =====================================================
// Отправка данных
// =====================================================

function submitForm() {
    if (isSubmitting) return;
    
    const errors = validateForm();
    if (errors.length > 0) {
        showMessage(errors.join('\n'), 'error');
        return;
    }
    
    setLoading(true);
    
    const user = tg.initDataUnsafe?.user || {};
    
    const formData = {
        action: 'connect_kaspi',
        login: loginInput.value.trim(),
        password: passwordInput.value,
        token: tokenInput.value.trim(),
        saveCredentials: document.getElementById('saveCredentials')?.checked || true,
        autoAcceptOrders: document.getElementById('autoAcceptOrders')?.checked || true,
        telegramUserId: user.id,
        telegramUsername: user.username || ''
    };
    
    console.log('Отправка данных через sendData:', formData);
    
    // Теперь sendData ДОЛЖЕН работать!
    tg.sendData(JSON.stringify(formData));
    
    showMessage('✅ Данные отправлены!', 'success');
    
    // Закрываем Mini App
    setTimeout(() => tg.close(), 1000);
}

// =====================================================
// Обработчики
// =====================================================

form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
});

// Кнопка Назад
tg.BackButton.show();
tg.BackButton.onClick(() => tg.close());

console.log('=== MINI APP ЗАГРУЖЕН (ReplyKeyboard версия) ===');