// =====================================================
// Инициализация Telegram Web App
// =====================================================
const tg = window.Telegram.WebApp;

// Разворачиваем на весь экран
tg.expand();

// Сообщаем Telegram, что приложение готово
tg.ready();

// Устанавливаем цвет верхней панели
tg.setHeaderColor('secondary_bg_color');

// Включаем кнопку "Назад" и настраиваем её
tg.BackButton.show();
tg.BackButton.onClick(() => {
    if (window.formModified) {
        tg.showConfirm('У вас есть несохраненные изменения. Точно выйти?', (confirmed) => {
            if (confirmed) {
                tg.close();
            }
        });
    } else {
        tg.close();
    }
});

// Устанавливаем главную кнопку Telegram (альтернативный способ)
tg.MainButton.setText('ПОДКЛЮЧИТЬ');
tg.MainButton.show();
tg.MainButton.onClick(() => {
    submitForm();
});

// Отображаем статус подключения
const statusDiv = document.getElementById('telegramStatus');
if (statusDiv) {
    const initData = tg.initData || '';
    const user = tg.initDataUnsafe?.user;
    
    if (user) {
        statusDiv.textContent = `✅ Подключено к Telegram | Пользователь: ${user.first_name || 'Гость'}`;
        statusDiv.style.color = '#34c759';
    } else {
        statusDiv.textContent = '⚠️ Режим отладки (не в Telegram)';
        statusDiv.style.color = '#ff9500';
    }
}

// =====================================================
// Глобальные переменные
// =====================================================
window.formModified = false;
let isSubmitting = false;

// Получаем элементы формы
const form = document.getElementById('kaspiAuthForm');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const tokenInput = document.getElementById('token');
const submitBtn = document.getElementById('submitBtn');
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
    
    if (type === 'success') {
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
}

function hideMessage() {
    messageContainer.style.display = 'none';
}

function setLoading(isLoading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
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
    const phoneRegex = /^\+?7?\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
    const digitsOnly = value.replace(/\D/g, '');
    return emailRegex.test(value) || phoneRegex.test(value) || digitsOnly.length >= 10;
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
    } else if (passwordInput.value.length < 6) {
        errors.push('Пароль должен содержать минимум 6 символов');
    }
    
    if (!tokenInput.value.trim()) {
        errors.push('Введите API токен');
    } else if (!validateToken(tokenInput.value.trim())) {
        errors.push('API токен слишком короткий');
    }
    
    return errors;
}

// =====================================================
// Отправка формы
// =====================================================

function submitForm() {
    if (isSubmitting) {
        return;
    }
    
    hideMessage();
    
    // Валидация
    const errors = validateForm();
    if (errors.length > 0) {
        showMessage(errors.join('\n'), 'error');
        return;
    }
    
    setLoading(true);
    
    try {
        // Получаем данные пользователя Telegram
        const user = tg.initDataUnsafe?.user || {};
        
        // Формируем данные для отправки
        const formData = {
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
        
        console.log('Отправка данных в Telegram:', formData);
        
        // Показываем сообщение о процессе
        showMessage('Отправка данных в бота...', 'info');
        
        // Отправляем данные в бота
        tg.sendData(JSON.stringify(formData));
        
        // Показываем успех
        showMessage('✅ Данные отправлены! Окно закроется автоматически.', 'success');
        
        // Закрываем Mini App через 1 секунду
        setTimeout(() => {
            tg.close();
        }, 1000);
        
        window.formModified = false;
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showMessage('❌ Ошибка отправки: ' + error.message, 'error');
        setLoading(false);
    }
}

// =====================================================
// Обработчики событий
// =====================================================

// Отправка формы
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm();
});

// Переключение видимости пароля
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    
    // Меняем иконку
    const svg = togglePasswordBtn.querySelector('svg');
    if (type === 'text') {
        svg.innerHTML = `
            <path d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <line x1="1" y1="1" x2="19" y2="19" stroke="currentColor" stroke-width="1.5"/>
        `;
    } else {
        svg.innerHTML = `
            <path d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z" stroke="currentColor" stroke-width="1.5"/>
            <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
        `;
    }
});

// Вставка из буфера обмена
pasteTokenBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        tokenInput.value = text;
        window.formModified = true;
        showMessage('Токен вставлен из буфера', 'success');
    } catch (err) {
        showMessage('Не удалось вставить из буфера. Вставьте вручную.', 'error');
    }
});

// Отслеживание изменений формы
form.addEventListener('input', () => {
    window.formModified = true;
});

form.addEventListener('change', () => {
    window.formModified = true;
});

// =====================================================
// Инициализация
// =====================================================

console.log('Kaspi Mini App загружен');
console.log('Telegram Web App версия:', tg.version);
console.log('Init data:', tg.initData);

// Проверяем, что мы в Telegram
if (!tg.initData) {
    console.warn('Не в Telegram окружении!');
    showMessage('⚠️ Приложение запущено вне Telegram. Данные не будут отправлены.', 'error');
}