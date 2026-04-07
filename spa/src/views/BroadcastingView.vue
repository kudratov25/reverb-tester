<template>
  <div class="tester">
    <h2>Broadcasting Tester</h2>

    <!-- Token -->
    <section>
      <h3>Auth Token</h3>
      <div class="row">
        <input v-model="token" type="text" placeholder="Paste Sanctum token..." />
        <button @click="applyToken" :class="tokenApplied ? 'btn-success' : 'btn'">
          {{ tokenApplied ? 'Applied' : 'Apply' }}
        </button>
      </div>
    </section>

    <!-- Subscribe -->
    <section>
      <h3>Subscribe to Channel</h3>
      <div class="row">
        <select v-model="channelType">
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="presence">Presence</option>
        </select>
        <input v-model="channelName" placeholder="channel-name" />
        <input v-model="eventName" placeholder=".EventName or listen" />
        <button @click="subscribe" class="btn">Subscribe</button>
      </div>
      <div class="chips">
        <span v-for="sub in subscriptions" :key="sub.id" class="chip">
          {{ sub.label }}
          <button @click="unsubscribe(sub)">×</button>
        </span>
      </div>
    </section>

    <!-- Log -->
    <section>
      <div class="log-header">
        <h3>Event Log</h3>
        <div class="log-actions">
          <span class="status" :class="wsStatus">{{ wsStatus }}</span>
          <button @click="logs = []" class="btn-sm">Clear</button>
        </div>
      </div>
      <div class="log" ref="logEl">
        <div v-if="logs.length === 0" class="empty">No events yet...</div>
        <div v-for="(log, i) in logs" :key="i" class="log-entry" :class="log.type">
          <span class="ts">{{ log.time }}</span>
          <span class="tag">{{ log.channel }}</span>
          <span class="event">{{ log.event }}</span>
          <pre>{{ JSON.stringify(log.data, null, 2) }}</pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import echo, { setEchoToken } from '@/echo'

const token = ref(localStorage.getItem('token') ?? '')
const tokenApplied = ref(!!token.value)
const channelType = ref('public')
const channelName = ref('')
const eventName = ref('')
const subscriptions = ref([])
const logs = ref([])
const wsStatus = ref('disconnected')
const logEl = ref(null)
let subId = 0

function applyToken() {
  const t = token.value.trim()
  setEchoToken(t)
  if (t) localStorage.setItem('token', t)
  else localStorage.removeItem('token')
  tokenApplied.value = !!t
  addLog('system', 'auth', 'token-set', { token: t ? '***' : '(cleared)' })
}

function subscribe() {
  const name = channelName.value.trim()
  const event = eventName.value.trim() || '.EventReceived'
  if (!name) return

  const label = `${channelType.value}:${name} → ${event}`

  // Include event name in the auth request payload for private/presence channels
  const authParams = { event }
  echo.options.auth ??= {}
  echo.options.auth.params = authParams
  const authConfig = echo.connector?.pusher?.config?.auth
  if (authConfig) authConfig.params = authParams

  let channel

  if (channelType.value === 'private') channel = echo.private(name)
  else if (channelType.value === 'presence') channel = echo.join(name)
  else channel = echo.channel(name)

  channel.listen(event, (data) => addLog('event', label, event, data))
  channel.error?.((err) => addLog('error', label, 'error', err))

  subscriptions.value.push({ id: ++subId, label, name, type: channelType.value, channel })
  addLog('system', label, 'subscribed', {})
  channelName.value = ''
  eventName.value = ''
}

function unsubscribe(sub) {
  echo.leaveChannel(
    sub.type === 'private' ? 'private-' + sub.name
    : sub.type === 'presence' ? 'presence-' + sub.name
    : sub.name
  )
  subscriptions.value = subscriptions.value.filter(s => s.id !== sub.id)
  addLog('system', sub.label, 'unsubscribed', {})
}

function addLog(type, channel, event, data) {
  logs.value.unshift({
    type,
    channel,
    event,
    data,
    time: new Date().toLocaleTimeString(),
  })
  nextTick(() => {
    if (logEl.value) logEl.value.scrollTop = 0
  })
}

function checkWsStatus() {
  const state = echo.connector?.pusher?.connection?.state
  wsStatus.value = state ?? 'unknown'
}

let statusInterval
onMounted(() => {
  if (token.value) applyToken()
  statusInterval = setInterval(checkWsStatus, 1000)
  checkWsStatus()
})
onBeforeUnmount(() => clearInterval(statusInterval))
</script>

<style scoped>
.tester {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px;
  font-family: monospace;
  color: #e2e8f0;
}
h2 { font-size: 1.4rem; margin-bottom: 20px; color: #f8fafc; }
h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-bottom: 10px; }
section { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin-bottom: 16px; }

.row { display: flex; gap: 8px; flex-wrap: wrap; }
input, select {
  flex: 1; min-width: 160px;
  background: #0f172a; border: 1px solid #334155; border-radius: 6px;
  color: #e2e8f0; padding: 7px 10px; font-family: monospace; font-size: 0.85rem;
}
input:focus, select:focus { outline: none; border-color: #6366f1; }

.btn, .btn-success, .btn-sm {
  padding: 7px 16px; border-radius: 6px; border: none; cursor: pointer;
  font-family: monospace; font-size: 0.85rem; white-space: nowrap;
}
.btn { background: #6366f1; color: #fff; }
.btn:hover { background: #4f46e5; }
.btn-success { background: #22c55e; color: #fff; }
.btn-sm { background: #334155; color: #94a3b8; padding: 4px 10px; }
.btn-sm:hover { background: #475569; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.chip {
  background: #0f172a; border: 1px solid #6366f1; border-radius: 20px;
  padding: 3px 10px; font-size: 0.78rem; color: #a5b4fc;
  display: flex; align-items: center; gap: 6px;
}
.chip button { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem; padding: 0; line-height: 1; }
.chip button:hover { color: #f87171; }

.log-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.log-header h3 { margin: 0; }
.log-actions { display: flex; align-items: center; gap: 10px; }

.status {
  font-size: 0.75rem; padding: 2px 8px; border-radius: 20px; text-transform: capitalize;
  background: #1e293b; border: 1px solid #475569; color: #94a3b8;
}
.status.connected { border-color: #22c55e; color: #22c55e; }
.status.connecting { border-color: #f59e0b; color: #f59e0b; }
.status.disconnected, .status.failed { border-color: #f87171; color: #f87171; }

.log {
  background: #0f172a; border-radius: 6px; padding: 10px;
  max-height: 400px; overflow-y: auto;
  display: flex; flex-direction: column; gap: 6px;
}
.empty { color: #475569; text-align: center; padding: 20px 0; font-size: 0.85rem; }
.log-entry {
  border-left: 3px solid #334155; padding: 6px 10px; border-radius: 0 4px 4px 0;
  background: #1e293b; font-size: 0.8rem;
}
.log-entry.event { border-color: #6366f1; }
.log-entry.error { border-color: #f87171; }
.log-entry.system { border-color: #22c55e; }
.ts { color: #475569; margin-right: 8px; }
.tag { color: #94a3b8; margin-right: 8px; }
.event { color: #a5b4fc; font-weight: bold; }
pre { margin: 4px 0 0; color: #e2e8f0; white-space: pre-wrap; word-break: break-all; }
</style>
