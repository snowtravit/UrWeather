# 🌦️ UrWeather

A local weather dashboard built with React, TypeScript, Vite, Tailwind CSS and Framer Motion.

[English](#english) · [Русский](#русский)

## English

### Features

- Current conditions, hourly charts and a seven-day forecast
- Select a day to see its hourly breakdown
- Animated backgrounds matching the weather
- City search and EN / RU language switching
- Ten-minute weather cache
- Error messages and retry controls, with city search available while loading
- Responsive layout for phones, tablets and computers on your local network

Weather data comes from [Open-Meteo](https://open-meteo.com), and city search uses [OpenStreetMap Nominatim](https://nominatim.org). No API keys or accounts are required. Internet access is needed to fetch fresh weather and search results.

### Requirements

- Node.js 22.12+ recommended; Node.js 20.19+ on the Node 20 release line also works
- npm, included with Node.js
- Python 3.8+ only if you use the optional helper scripts

### Getting started

The app and its `package.json` are in the nested `UrWeather/` directory:

```bash
git clone https://github.com/snowtravit/UrWeather.git
cd UrWeather/UrWeather
npm ci
npm run dev
```

Open the URL Vite prints, usually `http://localhost:5173`. To access the app from another device, use the printed network URL and connect both devices to the same network. Allow Node.js through your local firewall if needed. Vite tries the next free port when 5173 is busy.

Berlin loads by default. If the browser grants location access, the app tries to use your location. Browser geolocation usually requires HTTPS or localhost, so city search is also available on ordinary local-network HTTP addresses.

### Optional Python helpers

From the same nested `UrWeather/` directory:

```bash
python setup.py
python start.py
```

Use `python3` if that is your Python 3 command. Setup refreshes dependencies using `npm ci` and creates a local setup marker; start launches the installed Vite through Node.js and prints local and network URLs.

### Checks and production build

Run these commands from the app directory:

```bash
npm test
npm run typecheck
npm audit
python3 -m unittest test_launcher.py
npm run build
npm run preview
```

`npm test` checks request failures, timeouts, retries, overlapping searches, cache validation, language storage and forecast dates. `npm audit` checks all dependencies, including development tools. The Python tests check launcher errors and paths containing spaces. `npm run build` writes the production bundle to `dist/`; `npm run preview` serves that build for local inspection. Use `npm run test:watch` during development. GitHub Actions runs these checks on pushes and pull requests.

## Русский

### Возможности

- Текущая погода, почасовые графики и прогноз на семь дней
- Почасовая разбивка выбранного дня
- Анимированный фон под текущую погоду
- Поиск города и переключение EN / RU
- Кэш погоды на десять минут
- Сообщения об ошибках и повтор запроса; поиск доступен во время загрузки
- Адаптивный интерфейс для телефона, планшета и компьютера в локальной сети

Погода загружается из [Open-Meteo](https://open-meteo.com), поиск городов использует [OpenStreetMap Nominatim](https://nominatim.org). API ключи и регистрация не нужны. Для свежего прогноза и поиска требуется интернет.

### Требования

- Рекомендуется Node.js 22.12+; также подходит Node.js 20.19+ из ветки Node 20
- npm, который входит в Node.js
- Python 3.8+ только для необязательных скриптов запуска

### Запуск

Приложение и его `package.json` находятся во вложенной папке `UrWeather/`:

```bash
git clone https://github.com/snowtravit/UrWeather.git
cd UrWeather/UrWeather
npm ci
npm run dev
```

Откройте адрес, который напечатает Vite, обычно `http://localhost:5173`. Для другого устройства используйте сетевой адрес из терминала и подключите оба устройства к одной сети. При необходимости разрешите Node.js в брандмауэре. Если порт 5173 занят, Vite выберет следующий свободный.

По умолчанию загружается Берлин. Если браузер разрешит доступ к местоположению, приложение попробует загрузить местную погоду. Геолокация обычно доступна только через HTTPS или localhost, поэтому при доступе по обычному HTTP в локальной сети можно выбрать город через поиск.

### Необязательные Python скрипты

В той же вложенной папке `UrWeather/`:

```bash
python setup.py
python start.py
```

Если Python 3 запускается командой `python3`, используйте её. Setup обновляет зависимости через `npm ci` и создаёт локальный маркер настройки; start запускает установленный Vite через Node.js и выводит адреса для компьютера и других устройств.

### Проверки и сборка

Запускайте команды из папки приложения:

```bash
npm test
npm run typecheck
npm audit
python3 -m unittest test_launcher.py
npm run build
npm run preview
```

`npm test` проверяет ошибки и таймауты запросов, повторную загрузку, одновременный поиск, данные кэша, сохранение языка и даты прогноза. `npm audit` проверяет все зависимости, включая инструменты разработки. Тесты Python проверяют ошибки запуска и пути с пробелами. `npm run build` сохраняет сборку в `dist/`; `npm run preview` запускает локальный просмотр сборки. Для разработки есть `npm run test:watch`. GitHub Actions выполняет эти проверки при push и pull request.
