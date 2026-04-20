// =====================================================
// Инициализация Telegram Web App
// =====================================================
const tg = window.Telegram.WebApp;

tg.expand();
tg.ready();
tg.setHeaderColor('secondary_bg_color');

// Настраиваем главную кнопку
tg.MainButton.setText('ПОДКЛЮЧИТЬ МАГАЗИН');
tg.MainButton.show();
tg.MainButton.enable();

// Отображаем статус
const statusDiv = document.getElementById('telegramStatus');
if (statusDiv) {
    const user = tg.initDataUnsafe?.user;
    if (user) {
        statusDiv.textContent = `✅ Подключено | ${user.first_name || 'Пользователь'}`;
        statusDiv.style.color = '#34c759';
    } else {
        statusDiv.textContent = '⚠️ Режим отладки';
        statusDiv.style.color = '#ff9500';
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
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const pasteTokenBtn = document.getElementById('pasteTokenBtn');

// =====================================================
// Вспомогательные функции
// =====================================================

function showMessage(text, type = 'info') {
    messageContainer.textContent = text;
    messageContainer.className = `message-container message-${type}`;
    messageContainer.style.display = 'block';
}

function hideMessage() {
    messageContainer.style.display = 'none';
}

function setLoading(isLoading) {
    const btnText = document.querySelector('#submitBtn .btn-text');
    const btnLoader = document.querySelector('#submitBtn .btn-loader');
    const submitBtn = document.getElementById('submitBtn');
    
    isSubmitting = isLoading;
    submitBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
        tg.MainButton.showProgress();
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        tg.MainButton.hideProgress();
    }
}

// =====================================================
// Валидация
// =====================================================

function validateEmailOrPhone(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digitsOnly = value.replace(/\D/g, '');
    return emailRegex.test(value) || digitsOnly.length >= 10;
}

function validateToken(token) {
    return token && token.length > 50;
}

function validateForm() {
    const errors = [];
    
    if (!loginInput.value.trim()) {
        errors.push('Введите логин');
    } else if (!validateEmailOrPhone(loginInput.value.trim())) {
        errors.push('Неверный формат логина');
    }
    
    if (!passwordInput.value) {
        errors.push('Введите пароль');
    }
    
    if (!tokenInput.value.trim()) {
        errors.push('Введите API токен');
    } else if (!validateToken(tokenInput.value.trim())) {
        errors.push('API токен слишком короткий');
    }
    
    return errors;
}

// =====================================================
// Получение данных формы
// =====================================================

function getFormData() {
    const user = tg.initDataUnsafe?.user || {};
    
    return {
        action: 'connect_kaspi',
        login: loginInput.value.trim(),
        password: passwordInput.value,
        token: tokenInput.value.trim(),
        saveCredentials: document.getElementById('saveCredentials').checked,
        autoAcceptOrders: document.getElementById('autoAcceptOrders').checked,
        telegramUserId: user.id,
        telegramUsername: user.username,
        telegramFirstName: user.first_name,
        telegramLastName: user.last_name,
        timestamp: new Date().toISOString()
    };
}

// =====================================================
// Отправка данных
// =====================================================

function submitForm() {
    if (isSubmitting) return;
    
    hideMessage();
    
    const errors = validateForm();
    if (errors.length > 0) {
        showMessage(errors.join('\n'), 'error');
        return;
    }
    
    setLoading(true);
    
    try {
        const formData = getFormData();
        const jsonData = JSON.stringify(formData);
        
        console.log('=== ОТПРАВКА ДАННЫХ ===');
        console.log('Данные:', formData);
        console.log('JSON:', jsonData);
        
        // Пробуем ОБА способа отправки
        
        // Способ 1: sendData
        try {
            tg.sendData(jsonData);
            console.log('✅ sendData выполнен');
        } catch (e) {
            console.error('❌ Ошибка sendData:', e);
        }
        
        // Способ 2: Через MainButton (более надежный)
        tg.MainButton.setParams({ data: jsonData });
        console.log('✅ MainButton.setParams выполнен');
        
        showMessage('✅ Данные отправлены! Закрываю окно...', 'success');
        
        setTimeout(() => {
            tg.close();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Ошибка:', error);
        showMessage('❌ Ошибка: ' + error.message, 'error');
        setLoading(false);
    }
}

// =====================================================
// Обработчики событий
// =====================================================

// Отправка по кнопке формы
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
});

// Отправка по MainButton
tg.MainButton.onClick(() => {
    console.log('MainButton нажата');
    submitForm();
});

// Отправка по кнопке "Подключить" в форме
document.getElementById('submitBtn').addEventListener('click', (e) => {
    e.preventDefault();
    submitForm();
});

// Переключение видимости пароля
if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
    });
}

// Вставка из буфера
if (pasteTokenBtn) {
    pasteTokenBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            tokenInput.value = text;
            showMessage('Токен вставлен', 'success');
        } catch (err) {
            showMessage('Вставьте вручную', 'error');
        }
    });
}

// Кнопка "Назад"
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.close();
});

// =====================================================
// Инициализация
// =====================================================

console.log('=== MINI APP ЗАГРУЖЕН ===');
console.log('Telegram WebApp v' + tg.version);
console.log('InitData:', tg.initData ? 'ЕСТЬ' : 'НЕТ');
console.log('User:', tg.initDataUnsafe?.user);
console.log('===========================');