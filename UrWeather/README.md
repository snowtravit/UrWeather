# UrWeather app

[Full project documentation / Документация проекта](../README.md)

## English

This directory contains the React app, `package.json` and optional Python helpers.

Requires Node.js 22.12+ recommended, or Node.js 20.19+ on the Node 20 release line. From this directory:

```bash
npm ci
npm run dev
```

Open the local or network URL printed by Vite. Fresh weather and city search require internet access; no API keys are needed. Berlin is the default city, with optional browser geolocation and manual search.

For the optional helpers, install Python 3.8+ and run `python setup.py`, then `python start.py` from this directory. Use `python3` if needed.

```bash
npm test             # Regression tests
npm run test:watch   # Watch tests during development
npm run build        # Production build in dist/
npm run preview      # Serve the production build locally
```

## Русский

В этой папке находятся React приложение, `package.json` и необязательные Python скрипты.

Рекомендуется Node.js 22.12+; также подходит Node.js 20.19+ из ветки Node 20. Запускайте из этой папки:

```bash
npm ci
npm run dev
```

Откройте локальный или сетевой адрес из терминала Vite. Для свежего прогноза и поиска городов требуется интернет, API ключи не нужны. По умолчанию выбран Берлин; доступны геолокация браузера и ручной поиск.

Для необязательных скриптов нужен Python 3.8+. Выполните `python setup.py`, затем `python start.py` из этой папки. При необходимости используйте `python3`.

```bash
npm test             # Регрессионные тесты
npm run test:watch   # Тесты в режиме наблюдения
npm run build        # Сборка в dist/
npm run preview      # Локальный просмотр сборки
```
