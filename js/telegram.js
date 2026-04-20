// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Разворачиваем на весь экран
tg.expand();

// Настраиваем тему
tg.ready();

// Устанавливаем цвет верхней панели
tg.setHeaderColor('secondary_bg_color');

// Включаем кнопку "Назад" в хедере
tg.BackButton.show();

// Обработчик кнопки "Назад"
tg.BackButton.onClick(() => {
    // Можно показать подтверждение, если форма была изменена
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

// Получаем данные пользователя Telegram
const initData = tg.initData || '';
const initDataUnsafe = tg.initDataUnsafe || {};

// Сохраняем ID чата для связи с ботом
window.telegramUser = {
    id: initDataUnsafe.user?.id,
    username: initDataUnsafe.user?.username,
    firstName: initDataUnsafe.user?.first_name,
    lastName: initDataUnsafe.user?.last_name
};

// Функция для отправки данных в бота
function sendDataToBot(data) {
    return new Promise((resolve, reject) => {
        try {
            // Отправляем данные через Telegram Web App
            tg.sendData(JSON.stringify(data));
            
            // Показываем уведомление об успехе
            tg.showPopup({
                title: 'Успешно!',
                message: 'Данные отправлены в бота. Окно закроется автоматически.',
                buttons: [{ type: 'ok' }]
            }, (buttonId) => {
                // Закрываем Mini App
                tg.close();
            });
            
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Функция для отображения алерта
function showAlert(message, type = 'info') {
    if (type === 'error') {
        tg.showAlert(message);
    } else {
        tg.showPopup({
            title: type === 'success' ? 'Успешно' : 'Информация',
            message: message,
            buttons: [{ type: 'ok' }]
        });
    }
}

// Экспортируем функции
window.TelegramHelper = {
    tg,
    initData,
    initDataUnsafe,
    sendDataToBot,
    showAlert
};