# UrWeather

[English](#english) · [Русский](#русский)

---

## English

A weather dashboard that runs on your local machine and is accessible from any device on your network — phone, tablet, Smart TV.

No API keys. No accounts. No setup headache.

### What you get

- Current conditions, 24-hour chart, 7-day forecast
- Click any day to see its hourly breakdown
- Animated backgrounds (rain, snow, sun, fog, storm) matching the actual weather
- EN / RU language toggle
- Works on any device in your Wi-Fi network

### Requirements

- Python 3.8+
- Node.js 18+

### Getting started

**1. Run setup (one time only)**

```
python setup.py
```

**2. Start the server**

```
python start.py
```

You'll see:

```
  ╔══════════════════════════════════════════╗
  ║      UrWeather is running!               ║
  ╚══════════════════════════════════════════╝

  This device:
    http://localhost:5173

  Phone / tablet / TV:
    http://192.168.1.42:5173
```

### No API keys needed

- **[Open-Meteo](https://open-meteo.com)** — weather data (free, no registration)
- **[OpenStreetMap Nominatim](https://nominatim.org)** — city search (free, no registration)

### Troubleshooting

**Node.js not found** — Download the LTS version from [nodejs.org](https://nodejs.org) and restart your terminal.

**Can't open from my phone** — Make sure both devices are on the same Wi-Fi. On Windows, allow Node.js through the firewall when prompted.

**Port 5173 is busy** — Vite will automatically try the next available port.

---

## Русский

Погодный дашборд, который запускается на вашем компьютере и доступен с любого устройства в сети — телефон, планшет, Smart TV.

Без API ключей. Без регистрации. Установка одной командой.

### Что умеет

- Текущая погода, почасовой график на 24 часа, прогноз на 7 дней
- Клик по дню — почасовая разбивка для выбранного дня
- Анимированный фон (дождь, снег, солнце, туман, гроза) под реальную погоду
- Переключатель языка EN / RU
- Работает на любом устройстве в вашей Wi-Fi сети

### Что нужно

- Python 3.8+
- Node.js 18+

### Запуск

**1. Установка (один раз)**

```
python setup.py
```

**2. Запуск сервера**

```
python start.py
```

В терминале появится:

```
  ╔══════════════════════════════════════════╗
  ║      UrWeather is running!               ║
  ╚══════════════════════════════════════════╝

  This device:
    http://localhost:5173

  Phone / tablet / TV:
    http://192.168.1.42:5173
```

### API ключи не нужны

- **[Open-Meteo](https://open-meteo.com)** — погодные данные (бесплатно, без регистрации)
- **[OpenStreetMap Nominatim](https://nominatim.org)** — поиск городов (бесплатно, без регистрации)

### Проблемы

**Node.js не найден** — скачайте LTS версию с [nodejs.org](https://nodejs.org) и перезапустите терминал.

**Не открывается с телефона** — оба устройства должны быть в одной Wi-Fi сети. На Windows разрешите Node.js в брандмауэре при запросе.

**Порт 5173 занят** — Vite автоматически возьмёт следующий свободный порт.
