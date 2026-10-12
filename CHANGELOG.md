# 📝 Changelog

## 🌦️ 1.1.0 — 2026-10-12

### ✨ Improvements / Улучшения

- City search keeps the newest results and selected city when responses arrive out of order. / Поздний ответ больше не подменяет новый поиск и выбранный город.
- Weather requests have a ten-second timeout, clear errors and retry controls. Invalid API responses and damaged cache entries are handled safely. / Добавлены таймаут, понятные ошибки, повтор запроса и проверка данных API и кэша.
- Hourly forecasts use the selected city's local time. Missing UV readings and polar sunrise/sunset are shown as unavailable. / Почасовой прогноз учитывает время города; отсутствующий UV-индекс и полярный восход отображаются как отсутствие данных.
- Invalid or inaccessible language storage no longer breaks the dashboard. / Ошибка сохранённого языка больше не ломает приложение.
- Python helpers refresh dependencies, support paths containing spaces and stop the Vite process correctly. / Python-скрипты обновляют зависимости, работают с путями с пробелами и корректно останавливают Vite.
- Updated development dependencies, added screenshots and documented the MIT license and third-party notices. / Обновлены инструменты разработки, добавлены скриншоты, лицензия MIT и сведения о сторонних компонентах.

### ✅ Verification / Проверки

- 37 JavaScript regression tests and 4 Python launcher tests passed.
- TypeScript checks, a clean dependency install and the production build passed.
- Nine Chromium scenarios passed, covering network failures, retry, search races, stored language and mobile layout.
- Real Open-Meteo responses checked for Berlin, Sydney, Tromsø and the North Pole.
- Full `npm audit`, including development dependencies: zero known vulnerabilities at the time of release preparation.

Проверки выполнены в Linux. Настоящий Windows не проверялся. Для свежей погоды и поиска требуется интернет.

## 📦 1.0.0

Initial dashboard with current weather, hourly charts, a seven-day forecast, EN/RU language switching and optional Python launch helpers.

Первоначальная версия: текущая погода, почасовые графики, прогноз на семь дней, русский и английский интерфейс и необязательные Python-скрипты запуска.
