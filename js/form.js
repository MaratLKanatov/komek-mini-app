document.addEventListener('DOMContentLoaded', function() {
    // Элементы формы
    const form = document.getElementById('kaspiAuthForm');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const tokenInput = document.getElementById('token');
    const submitBtn = document.getElementById('submitBtn');
    const testConnectionBtn = document.getElementById('testConnectionBtn');
    const messageContainer = document.getElementById('messageContainer');
    
    // Элементы для прокси
    const proxyToggle = document.getElementById('proxyToggle');
    const proxyContent = document.getElementById('proxyContent');
    const proxyUrl = document.getElementById('proxyUrl');
    const proxyLogin = document.getElementById('proxyLogin');
    const proxyPassword = document.getElementById('proxyPassword');
    
    // Элементы для справки
    const helpToggle = document.getElementById('helpToggle');
    const helpContent = document.getElementById('helpContent');
    const showTokenHelp = document.getElementById('showTokenHelp');
    
    // Чекбоксы
    const saveCredentials = document.getElementById('saveCredentials');
    const autoAcceptOrders = document.getElementById('autoAcceptOrders');
    
    // Флаг изменения формы
    window.formModified = false;
    
    // ==================== Переключение прокси ====================
    proxyToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        proxyContent.style.display = proxyContent.style.display === 'none' ? 'block' : 'none';
    });
    
    // ==================== Переключение справки ====================
    helpToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        helpContent.style.display = helpContent.style.display === 'none' ? 'block' : 'none';
    });
    
    // ==================== Показать/скрыть пароль ====================
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            
            // Меняем иконку
            const svg = this.querySelector('svg');
            if (type === 'text') {
                svg.innerHTML = '<path d="M1 10C1 10 4 4 10 4C16 4 19 10 19 10C19 10 16 16 10 16C4 16 1 10 1 10Z" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="1" y1="1" x2="19" y2="19" stroke="currentColor" stroke-width="1.5"/>';
            } else {
                svg.innerHTML = '<path d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>';
            }
        });
    });
    
    // ==================== Вставка из буфера ====================
    document.querySelector('.paste-button').addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            tokenInput.value = text;
            validateToken(tokenInput.value);
            window.formModified = true;
        } catch (err) {
            showMessage('Не удалось вставить из буфера. Вставьте вручную.', 'error');
        }
    });
    
    // ==================== Справка по токену ====================
    showTokenHelp.addEventListener('click', function(e) {
        e.preventDefault();
        helpToggle.classList.add('active');
        helpContent.style.display = 'block';
        helpContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    // ==================== Валидация ====================
    function validateEmailOrPhone(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?7?\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        return emailRegex.test(value) || phoneRegex.test(value.replace(/\s/g, ''));
    }
    
    function validateToken(token) {
        // Токен Kaspi обычно начинается с eyJ и имеет длину > 50
        return token && token.length > 50 && token.startsWith('eyJ');
    }
    
    function validateProxyUrl(url) {
        if (!url) return true; // Прокси опционален
        const proxyRegex = /^(http|https|socks4|socks5):\/\/[^\s/$.?#].[^\s]*$/i;
        return proxyRegex.test(url);
    }
    
    // Валидация при вводе
    loginInput.addEventListener('input', function() {
        const isValid = validateEmailOrPhone(this.value);
        updateInputStatus(this, isValid);
        window.formModified = true;
    });
    
    tokenInput.addEventListener('input', function() {
        const isValid = validateToken(this.value);
        updateInputStatus(this, isValid);
        window.formModified = true;
    });
    
    proxyUrl.addEventListener('input', function() {
        const isValid = validateProxyUrl(this.value);
        updateInputStatus(this, isValid);
        window.formModified = true;
    });
    
    function updateInputStatus(input, isValid) {
        const wrapper = input.closest('.input-wrapper');
        wrapper.classList.remove('valid', 'invalid');
        wrapper.classList.add(isValid ? 'valid' : 'invalid');
    }
    
    // ==================== Отображение сообщений ====================
    function showMessage(text, type = 'info') {
        messageContainer.textContent = text;
        messageContainer.className = `message-container message-${type}`;
        messageContainer.style.display = 'block';
        
        // Автоскрытие для успешных сообщений
        if (type === 'success') {
            setTimeout(() => {
                messageContainer.style.display = 'none';
            }, 5000);
        }
    }
    
    function hideMessage() {
        messageContainer.style.display = 'none';
    }
    
    // ==================== Состояние загрузки ====================
    function setLoading(isLoading) {
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        submitBtn.disabled = isLoading;
        testConnectionBtn.disabled = isLoading;
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline-flex';
            document.body.classList.add('loading');
        } else {
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
            document.body.classList.remove('loading');
        }
    }
    
    // ==================== Проверка подключения ====================
    async function testConnection() {
        const formData = getFormData();
        
        showMessage('Проверяем подключение к Kaspi API...', 'info');
        
        try {
            // Здесь должен быть реальный запрос к вашему бэкенду
            const response = await mockTestConnection(formData);
            
            if (response.success) {
                showMessage(`✅ Подключение успешно! Магазин: ${response.shopName}`, 'success');
                return true;
            } else {
                showMessage(`❌ Ошибка подключения: ${response.error}`, 'error');
                return false;
            }
        } catch (error) {
            showMessage(`❌ Ошибка сети: ${error.message}`, 'error');
            return false;
        }
    }
    
    // Мок для тестирования (заменить на реальный запрос)
    function mockTestConnection(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (data.token && data.token.length > 50) {
                    resolve({
                        success: true,
                        shopName: 'ИП "Тестовый магазин"'
                    });
                } else {
                    resolve({
                        success: false,
                        error: 'Неверный API токен'
                    });
                }
            }, 1500);
        });
    }
    
    // ==================== Получение данных формы ====================
    function getFormData() {
        return {
            login: loginInput.value.trim(),
            password: passwordInput.value,
            token: tokenInput.value.trim(),
            saveCredentials: saveCredentials.checked,
            autoAcceptOrders: autoAcceptOrders.checked,
            proxy: proxyUrl.value ? {
                url: proxyUrl.value.trim(),
                login: proxyLogin.value.trim(),
                password: proxyPassword.value
            } : null,
            telegramUserId: window.telegramUser?.id,
            telegramUsername: window.telegramUser?.username
        };
    }
    
    // ==================== Валидация всей формы ====================
    function validateForm() {
        const errors = [];
        
        if (!validateEmailOrPhone(loginInput.value)) {
            errors.push('Введите корректный email или номер телефона');
        }
        
        if (!passwordInput.value || passwordInput.value.length < 6) {
            errors.push('Пароль должен содержать минимум 6 символов');
        }
        
        if (!validateToken(tokenInput.value)) {
            errors.push('Введите корректный API токен (должен начинаться с eyJ)');
        }
        
        if (proxyUrl.value && !validateProxyUrl(proxyUrl.value)) {
            errors.push('Неверный формат прокси URL');
        }
        
        return errors;
    }
    
    // ==================== Отправка формы ====================
    async function submitForm() {
        hideMessage();
        
        const errors = validateForm();
        if (errors.length > 0) {
            showMessage(errors.join('\n'), 'error');
            return;
        }
        
        setLoading(true);
        
        try {
            // Сначала проверяем подключение
            const isConnected = await testConnection();
            
            if (!isConnected) {
                setLoading(false);
                return;
            }
            
            // Отправляем данные в бота
            const formData = getFormData();
            
            // Используем Telegram Helper для отправки
            await window.TelegramHelper.sendDataToBot({
                action: 'connect_kaspi',
                ...formData
            });
            
            showMessage('✅ Магазин успешно подключен!', 'success');
            window.formModified = false;
            
        } catch (error) {
            showMessage(`❌ Ошибка: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }
    
    // ==================== Обработчики событий ====================
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitForm();
    });
    
    testConnectionBtn.addEventListener('click', function() {
        testConnection();
    });
    
    // Отслеживание изменений формы
    form.addEventListener('change', function() {
        window.formModified = true;
    });
    
    form.addEventListener('input', function() {
        window.formModified = true;
    });
    
    // ==================== Инициализация ====================
    function init() {
        // Устанавливаем тему из Telegram
        const theme = window.TelegramHelper?.tg?.themeParams || {};
        if (theme.bg_color) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
        }
        if (theme.text_color) {
            document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color);
        }
        if (theme.hint_color) {
            document.documentElement.style.setProperty('--tg-theme-hint-color', theme.hint_color);
        }
        if (theme.link_color) {
            document.documentElement.style.setProperty('--tg-theme-link-color', theme.link_color);
        }
        if (theme.button_color) {
            document.documentElement.style.setProperty('--tg-theme-button-color', theme.button_color);
        }
        if (theme.secondary_bg_color) {
            document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
        }
        
        // Если есть сохраненные данные в localStorage (опционально)
        const savedLogin = localStorage.getItem('kaspi_login');
        if (savedLogin) {
            loginInput.value = savedLogin;
            saveCredentials.checked = true;
        }
    }
    
    init();
});