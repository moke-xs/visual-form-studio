<template>
  <div class="brand-logo" :class="{ 'logo-mini': mini, 'logo-dark': dark }">
    <div class="logo-container" @click="handleClick">
      <div class="logo-icon">
        <div class="icon-layers">
          <div class="layer layer-1"></div>
          <div class="layer layer-2"></div>
          <div class="layer layer-3"></div>
        </div>
      </div>
      <div class="logo-text" v-if="!mini">
        <h1 class="brand-name">善见教育 - 表单与查询管理中心</h1>
        <p class="brand-tagline" v-if="showTagline">可视化表单设计平台</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  mini?: boolean
  dark?: boolean
  showTagline?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mini: false,
  dark: false,
  showTagline: false,
  clickable: true
})

const router = useRouter()

const handleClick = () => {
  if (props.clickable) {
    router.push('/forms')
  }
}
</script>

<style scoped>
.brand-logo {
  display: flex;
  align-items: center;
  user-select: none;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo-container:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* LOGO图标设计 */
.logo-icon {
  width: 40px;
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-layers {
  position: relative;
  width: 32px;
  height: 32px;
}

.layer {
  position: absolute;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.9;
  transition: all 0.3s ease;
}

.layer-1 {
  width: 32px;
  height: 8px;
  top: 0;
  left: 0;
}

.layer-2 {
  width: 24px;
  height: 8px;
  top: 12px;
  left: 4px;
  opacity: 0.7;
}

.layer-3 {
  width: 16px;
  height: 8px;
  top: 24px;
  left: 8px;
  opacity: 0.5;
}

.logo-container:hover .layer-1 {
  transform: translateX(-2px);
}

.logo-container:hover .layer-2 {
  transform: translateX(2px);
}

.logo-container:hover .layer-3 {
  transform: translateX(-1px);
}

/* 品牌文字 */
.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.brand-tagline {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* Mini版本 */
.logo-mini .logo-container {
  padding: 6px 8px;
  gap: 0;
}

.logo-mini .logo-icon {
  width: 32px;
  height: 32px;
}

.logo-mini .icon-layers {
  width: 24px;
  height: 24px;
}

.logo-mini .layer-1 {
  width: 24px;
  height: 6px;
}

.logo-mini .layer-2 {
  width: 18px;
  height: 6px;
  top: 9px;
  left: 3px;
}

.logo-mini .layer-3 {
  width: 12px;
  height: 6px;
  top: 18px;
  left: 6px;
}

/* 深色主题 */
.logo-dark .logo-container {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.logo-dark .logo-container:hover {
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.logo-dark .brand-name {
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-dark .brand-tagline {
  color: rgba(0, 0, 0, 0.6);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .brand-name {
    font-size: 20px;
  }
  
  .brand-tagline {
    font-size: 11px;
  }
  
  .logo-container {
    gap: 10px;
    padding: 6px 12px;
  }
}

@media (max-width: 480px) {
  .brand-name {
    font-size: 18px;
  }
  
  .logo-container {
    gap: 8px;
    padding: 4px 8px;
  }
}
</style> 