# 🌦️ UrWeather v1.1.0

Поиск города, прогноз и запуск приложения стали надёжнее. / More reliable city search, forecasts and app startup.

## ✨ Что изменилось / What's changed

- 🔎 Поздние ответы поиска больше не заменяют новый город и результаты. / Late search responses no longer overwrite the current city or results.
- 🛜 Понятные ошибки сети, повтор запроса, таймаут и проверка ответов API. / Clear network errors, retry, request timeout and API response validation.
- 🕒 Прогноз показывает местное время города. / Forecasts use the selected city's local time.
- ❄️ Отсутствующий UV-индекс и полярный восход показываются как отсутствие данных. / Missing UV and polar sunrise readings are shown as unavailable.
- 💾 Повреждённый кэш и настройки языка не ломают приложение. / Damaged cache and stored language settings no longer break the app.
- 🐍 Исправлены установка зависимостей и Python-запускатор, включая пути с пробелами. / Dependency setup and Python launch helpers now handle paths with spaces correctly.
- 📸 Настоящие скриншоты приложения, 📜 MIT для оригинального кода и сохранённые лицензии сторонних компонентов. / Real app screenshots, MIT for original code and preserved third-party notices.

## ✅ Проверено / Verified

37 JavaScript-тестов, 4 Python-теста, 9 сценариев Chromium, TypeScript и production-сборка прошли. Полный npm audit: 0 известных уязвимостей при подготовке релиза. Реальные ответы погоды проверены для Berlin, Sydney, Tromsø и North Pole.

37 JavaScript tests, 4 Python tests, 9 Chromium scenarios, TypeScript checks and the production build passed. Full npm audit: zero known vulnerabilities during release preparation. Real weather responses checked for Berlin, Sydney, Tromsø and the North Pole.

## 📦 Использование / Usage

Для готовой веб-сборки распакуйте архив, откройте терминал в папке с `index.html` и выполните `python3 -m http.server 8080`. Откройте `http://localhost:8080`. Для исходников используйте инструкции в [README](https://github.com/snowtravit/UrWeather#readme).

For the prebuilt web files, unpack the archive, open a terminal in the folder containing `index.html`, run `python3 -m http.server 8080`, then open `http://localhost:8080`. Source setup is described in the [README](https://github.com/snowtravit/UrWeather#readme).

Свежая погода и поиск требуют интернета. Проверки выполнены в Linux; настоящий Windows не проверялся. / Fresh weather and search require internet access. Checks ran on Linux; a real Windows installation was not tested.
