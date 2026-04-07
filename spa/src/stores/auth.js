import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { setEchoToken } from '@/echo'

axios.defaults.baseURL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') ?? null)
  const user = ref(null)

  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    setEchoToken(token.value)
  }

  async function login(credentials) {
    const { data } = await axios.post('/login', credentials)
    setToken(data.token)
    user.value = data.user
  }

  async function logout() {
    await axios.post('/logout').catch(() => {})
    setToken(null)
    user.value = null
  }

  function setToken(value) {
    token.value = value
    if (value) {
      localStorage.setItem('token', value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${value}`
    } else {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    }
    setEchoToken(value)
  }

  return { token, user, login, logout, setToken }
})
