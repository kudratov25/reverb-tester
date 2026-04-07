# Laravel Echo Broadcasting Tester

A minimal Vue 3 SPA for testing [Laravel Reverb](https://reverb.laravel.com/) (or any Pusher-compatible) WebSocket broadcasting in real time — subscribe to channels, fire events, and watch the log update live.

![Demo](spa/demo.jpg)

---

## Features

- **Auth token** — paste a Laravel Sanctum token and apply it instantly to all subsequent requests
- **Channel types** — subscribe to `public`, `private`, and `presence` channels
- **Live event log** — incoming events appear in real time with timestamp, channel, event name, and full JSON payload
- **WebSocket status badge** — shows `connected`, `connecting`, or `disconnected` at a glance
- **One-click unsubscribe** — remove any active subscription via chip buttons

## Tech Stack

| Layer | Library |
|---|---|
| Framework | [Vue 3](https://vuejs.org/) (Composition API) |
| Build tool | [Vite](https://vite.dev/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| Routing | [Vue Router 4](https://router.vuejs.org/) |
| WebSockets | [Laravel Echo](https://github.com/laravel/echo) + [Pusher JS](https://github.com/pusher/pusher-js) |
| HTTP | [Axios](https://axios-http.com/) |

## Getting Started

### Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- A running [Laravel Reverb](https://reverb.laravel.com/) server (or any Pusher-compatible broker)

### Install & Run

```bash
cd spa
npm install
cp .env.example .env        # fill in your Reverb credentials
npm run dev
```

### Environment Variables

Create `spa/.env` based on the values from your Laravel `.env`:

```env
VITE_REVERB_APP_KEY=your-app-key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
```

## Usage

1. **Paste your Sanctum token** in the _Auth Token_ field and click **Apply** (required for private/presence channels)
2. **Select a channel type** (`Public` / `Private` / `Presence`)
3. **Enter the channel name** and the **event name** (e.g. `.NotificationCreated`)
4. Click **Subscribe** — the subscription chip appears below the form
5. Trigger the event from your Laravel app and watch it appear in the **Event Log**
6. Click **×** on a chip to unsubscribe

## Project Structure

```
spa/
├── src/
│   ├── views/
│   │   ├── BroadcastingView.vue   # main tester UI
│   │   ├── HomeView.vue
│   │   └── AboutView.vue
│   ├── stores/                    # Pinia stores
│   ├── router/                    # Vue Router config
│   ├── echo.js                    # Laravel Echo instance + token helper
│   └── main.js
├── public/
├── index.html
└── vite.config.js
```

## License

MIT
