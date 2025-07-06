import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import { useAuthStore } from './store/auth'
import 'nprogress/nprogress.css'
import '@mdi/font/css/materialdesignicons.min.css'
import './styles/global.scss'

const app = createApp(App)

// 配置 Pinia 状态管理及持久化插件
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(ElementPlus)
app.use(pinia)
app.use(router)

// 初始化认证状态
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')