<template>
  <div class="property-panel">
    <h3>属性面板</h3>
    
    <el-scrollbar height="calc(100vh - 120px)" class="panel-scrollbar">
      <div class="scrollbar-content">
        <div v-if="!selectedWidget" class="empty-state">
          <i class="mdi mdi-cursor-default-click-outline"></i>
          <p>请选择画布上的控件</p>
        </div>
        <div v-else class="property-form">
          <!-- 通用属性 -->
          <div class="property-item">
            <div class="property-label">控件ID</div>
            <div class="property-content">
              <el-input v-model="selectedWidget.id" disabled />
            </div>
          </div>
          
          <div class="property-item">
            <div class="property-label">控件类型</div>
            <div class="property-content">
              <el-input v-model="selectedWidget.type" disabled />
            </div>
          </div>
        
          <!-- 根据 schema 自动渲染属性 -->
          <property-form-item
            v-for="schema in currentPropertySchema"
            :key="schema.key"
            :schema="schema"
            :model-value="selectedWidget[schema.key]"
            @update:model-value="updateProperty(schema.key, $event)"
          />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useDesignerStore } from '../store'
import { computed } from 'vue'
import PropertyFormItem from './PropertyFormItem.vue'
import { widgetMetas } from './widgets'

const store = useDesignerStore()
const selectedWidget = computed(() => store.selectedWidget)

// 获取当前选中控件的属性配置 schema
const currentPropertySchema = computed(() => {
  if (!selectedWidget.value) return []
  
  const meta = widgetMetas.value.find(meta => meta.type === selectedWidget.value.type)
  return meta?.propertySchema || []
})

// 更新属性值
function updateProperty(key: string, value: any) {
  if (selectedWidget.value) {
    selectedWidget.value[key] = value
  }
}
</script>

<style scoped>
.property-panel {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.12);
  border: 2px solid rgba(102, 126, 234, 0.1);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.property-panel h3 {
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.property-panel h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.panel-scrollbar {
  flex: 1;
}

.scrollbar-content {
  padding-right: 4px;
  padding-bottom: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.08);
  border: 2px solid rgba(102, 126, 234, 0.1);
  text-align: center;
  margin-bottom: 20px;
  animation: emptyPulse 2s ease-in-out infinite;
}

@keyframes emptyPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-state p {
  margin: 0;
  color: #5a6c7d;
  font-size: 16px;
  font-weight: 500;
}

.property-form {
  background: transparent;
  padding: 0;
  margin: 0;
}

/* 属性项样式 */
.property-item {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.property-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
}

.property-label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

.property-content {
  line-height: 1.4;
}

/* 统一的输入框样式 */
.property-content :deep(.el-input__wrapper),
.property-content :deep(.el-textarea__inner),
.property-content :deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(102, 126, 234, 0.15);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
}

.property-content :deep(.el-input__wrapper:hover),
.property-content :deep(.el-textarea__inner:hover),
.property-content :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.property-content :deep(.el-input__wrapper.is-focus),
.property-content :deep(.el-textarea__inner:focus),
.property-content :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.property-content :deep(.el-input__inner),
.property-content :deep(.el-textarea__inner) {
  color: #2c3e50;
  font-weight: 500;
}

.property-content :deep(.el-input__inner::placeholder),
.property-content :deep(.el-textarea__inner::placeholder) {
  color: #a0aec0;
  font-weight: 400;
}

/* 禁用状态样式 */
.property-content :deep(.el-input.is-disabled .el-input__wrapper) {
  background: rgba(240, 240, 240, 0.8);
  border-color: rgba(102, 126, 234, 0.05);
  color: #a0aec0;
}

.property-form :deep(.el-slider__runway) {
  background: rgba(102, 126, 234, 0.2);
}

.property-form :deep(.el-slider__bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.property-form :deep(.el-slider__button) {
  border: 2px solid #667eea;
  background: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .property-panel {
    padding: 16px 16px 0 16px;
    height: 100vh;
  }
  
  .property-form {
    padding: 16px;
  }
  
  .property-form :deep(.el-form-item) {
    padding: 12px;
  }
  
  .scrollbar-content {
    padding-right: 4px;
  }
  
  .empty-state {
    padding: 40px 16px;
  }
  
  .empty-state i {
    font-size: 36px;
  }
}
</style>

<style>
/* Element Plus Scrollbar 自定义样式 - PropertyPanel */
.property-panel .el-scrollbar__bar.is-vertical > div {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.property-panel .el-scrollbar__bar.is-vertical > div:hover {
  opacity: 0.8;
  transform: scaleX(1.2);
}

.property-panel .el-scrollbar__bar.is-vertical {
  width: 5px;
  right: 2px;
}

.property-panel .el-scrollbar__thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.property-panel .el-scrollbar__track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(5px);
}

/* 滚动条悬停效果 */
.property-panel .el-scrollbar:hover .el-scrollbar__bar {
  opacity: 1;
}

.property-panel .el-scrollbar__bar {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}
</style>