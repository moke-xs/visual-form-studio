<template>
  <div class="widget-panel">
    <h3>控件面板</h3>
    
    <!-- 顶部操作栏 -->
    <div class="panel-header">
      <!-- 组件管理按钮 -->
      <el-button 
        type="primary" 
        size="small" 
        @click="showWidgetManager = true"
        :icon="Setting"
        class="manage-btn"
      >
        组件管理
      </el-button>
      
      <!-- 用户角色切换 -->
      <div class="role-selector">
        <el-select v-model="currentUserRole" @change="setUserRole" size="small">
          <el-option label="管理员" value="admin" />
          <el-option label="VIP用户" value="vip" />
          <el-option label="普通用户" value="user" />
          <el-option label="访客" value="guest" />
        </el-select>
      </div>
    </div>

    <el-scrollbar height="calc(100vh - 180px)" class="panel-scrollbar">
      <div class="scrollbar-content">
        <div v-for="category in categories" :key="category.key" class="category-section">
          <div class="category-header" @click="toggleCategory(category.key)">
            <i :class="category.collapsed ? 'mdi mdi-chevron-right' : 'mdi mdi-chevron-down'"></i>
            <i :class="category.icon"></i>
            <span>{{ category.label }}</span>
            <span class="category-count">{{ category.widgets.length }}</span>
          </div>

          <div v-show="!category.collapsed" class="category-widgets">
            <div v-for="widget in category.widgets" :key="widget.type" class="widget-item" draggable="true"
              @dragstart="onDragStart($event, widget)" @dragend="onDragEnd" @dragenter="onDragEnter"
              @dragleave="onDragLeave">
              <div class="widget-icon">
                <i :class="widget.icon"></i>
              </div>
              <div class="widget-info">
                <span class="widget-name">{{ widget.label }}</span>
                <span class="widget-type">{{ widget.type }}</span>
              </div>
              <div class="drag-handle">
                <i class="mdi mdi-drag-variant"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    
    <!-- 组件管理对话框 -->
    <el-dialog
      v-model="showWidgetManager"
      title="组件管理"
      width="90%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="widget-manager-dialog"
    >
      <WidgetManager />
      <template #footer>
        <el-button @click="showWidgetManager = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import { widgetMetas, currentUserRole, setUserRole } from './widgets'
import WidgetManager from './WidgetManager.vue'

// 组件管理对话框显示状态
const showWidgetManager = ref(false)

console.log('控件自动注册 widgetMetas:', widgetMetas.value)
console.log('控件数量:', widgetMetas.value.length)
console.log('当前用户角色:', currentUserRole.value)

// 分类配置
const categoryConfig = {
  basic: { label: 'Basic 基础组件', icon: 'mdi mdi-cube-outline' },
  form: { label: 'Form 表单组件', icon: 'mdi mdi-form-select' },
  data: { label: 'Data 数据展示', icon: 'mdi mdi-chart-line' },
  navigation: { label: 'Navigation 导航', icon: 'mdi mdi-navigation' },
  feedback: { label: 'Feedback 反馈组件', icon: 'mdi mdi-message-alert' },
  config: { label: '配置组件', icon: 'mdi mdi-cog' },
  others: { label: 'Others 其他', icon: 'mdi mdi-dots-horizontal' }
}

// 折叠状态
const collapsedCategories = ref<Set<string>>(new Set())

// 按分类分组控件
const categories = computed(() => {
  const grouped = new Map<string, any[]>()

  // 初始化所有分类
  Object.keys(categoryConfig).forEach(key => {
    grouped.set(key, [])
  })

  // 将控件分组（现在widgetMetas已经是排序好的）
  widgetMetas.value.forEach(widget => {
    const category = widget.category || 'others'
    if (!grouped.has(category)) {
      grouped.set(category, [])
    }
    grouped.get(category)!.push(widget)
  })

  // 转换为数组格式，只显示有控件的分类
  return Array.from(grouped.entries())
    .filter(([_, widgets]) => widgets.length > 0)
    .map(([key, widgets]) => ({
      key,
      label: categoryConfig[key as keyof typeof categoryConfig]?.label || key,
      icon: categoryConfig[key as keyof typeof categoryConfig]?.icon || 'mdi mdi-folder',
      widgets,
      collapsed: collapsedCategories.value.has(key)
    }))
})

function toggleCategory(categoryKey: string) {
  if (collapsedCategories.value.has(categoryKey)) {
    collapsedCategories.value.delete(categoryKey)
  } else {
    collapsedCategories.value.add(categoryKey)
  }
}

function onDragStart(event: DragEvent, widget: any) {
  console.log('开始拖拽控件:', widget.type, widget.label)
  event.dataTransfer?.setData('widget-type', widget.type)
  console.log('拖拽数据已设置:', widget.type)

  // 添加拖拽样式
  const target = event.target as HTMLElement
  target.classList.add('dragging')

  // 设置拖拽图像
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    // 创建自定义拖拽图像
    const dragImage = createDragImage(widget)
    event.dataTransfer.setDragImage(dragImage, 20, 20)
  }
}

function onDragEnd(event: DragEvent) {
  const target = event.target as HTMLElement
  target.classList.remove('dragging')
}

function onDragEnter(event: DragEvent) {
  event.preventDefault()
}

function onDragLeave(event: DragEvent) {
  event.preventDefault()
}

// 创建自定义拖拽图像
function createDragImage(widget: any) {
  const dragImage = document.createElement('div')
  dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    left: -1000px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `
  dragImage.innerHTML = `
    <i class="${widget.icon}" style="font-size: 18px;"></i>
    <span>${widget.label}</span>
  `
  document.body.appendChild(dragImage)

  // 清理函数
  setTimeout(() => {
    document.body.removeChild(dragImage)
  }, 100)

  return dragImage
}
</script>

<style scoped>
.widget-panel {
  padding: 20px 20px 0 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.panel-scrollbar {
  flex: 1;
  margin-top: 10px;
}

.scrollbar-content {
  padding-right: 8px;
  padding-bottom: 20px;
}

.widget-panel h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.manage-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.manage-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.role-selector {
  flex-shrink: 0;
}

.role-selector :deep(.el-select) {
  width: 100px;
}

.role-selector :deep(.el-input__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.role-selector :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.category-section {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.category-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.category-header:hover::before {
  left: 100%;
}

.category-header:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.category-header i:first-child {
  margin-right: 8px;
  font-size: 16px;
  transition: transform 0.3s ease;
}

.category-header i:nth-child(2) {
  margin-right: 12px;
  font-size: 18px;
  opacity: 0.9;
}

.category-count {
  margin-left: auto;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.category-widgets {
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
}

.widget-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: grab;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.widget-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s;
}

.widget-item:hover::before {
  left: 100%;
}

.widget-item:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
}

.widget-item:active,
.widget-item.dragging {
  cursor: grabbing;
  transform: scale(0.98);
  opacity: 0.8;
}

.widget-item.dragging {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.widget-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.widget-item.dragging .widget-icon {
  background: rgba(255, 255, 255, 0.2);
}

.widget-icon i {
  font-size: 20px;
  color: white;
}

.widget-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.widget-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  transition: color 0.3s ease;
}

.widget-item.dragging .widget-name {
  color: white;
}

.widget-type {
  font-size: 11px;
  color: #7f8c8d;
  opacity: 0.8;
  font-family: 'Courier New', monospace;
  transition: color 0.3s ease;
}

.widget-item.dragging .widget-type {
  color: rgba(255, 255, 255, 0.8);
}

.drag-handle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bdc3c7;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.widget-item:hover .drag-handle {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.widget-item.dragging .drag-handle {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.drag-handle i {
  font-size: 16px;
}

/* 拖拽时的全局效果 */
.widget-item.dragging {
  animation: dragPulse 0.6s ease-in-out infinite alternate;
}

@keyframes dragPulse {
  0% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  }

  100% {
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.6);
  }
}

/* 分类折叠动画 */
.category-widgets {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .widget-panel {
    padding: 16px 16px 0 16px;
    height: 100vh;
  }

  .widget-item {
    padding: 10px 12px;
  }

  .widget-icon {
    width: 36px;
    height: 36px;
  }

  .widget-icon i {
    font-size: 18px;
  }

  .scrollbar-content {
    padding-right: 4px;
  }
}
</style>

<style>
/* Element Plus Scrollbar 自定义样式 */
.widget-panel .el-scrollbar__bar.is-vertical>div {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.widget-panel .el-scrollbar__bar.is-vertical>div:hover {
  opacity: 0.8;
  transform: scaleX(1.2);
}

.widget-panel .el-scrollbar__bar.is-vertical {
  width: 5px;
  right: 2px;
}

.widget-panel .el-scrollbar__thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.widget-panel .el-scrollbar__track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(5px);
}

/* 滚动条悬停效果 */
.widget-panel .el-scrollbar:hover .el-scrollbar__bar {
  opacity: 1;
}

.widget-panel .el-scrollbar__bar {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}

/* 组件管理对话框样式 */
.widget-manager-dialog .el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.widget-manager-dialog .el-dialog__header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
  margin: 0;
}

.widget-manager-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
}

.widget-manager-dialog .el-dialog__headerbtn {
  top: 15px;
  right: 20px;
}

.widget-manager-dialog .el-dialog__headerbtn .el-dialog__close {
  color: white;
  font-size: 18px;
}

.widget-manager-dialog .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow: auto;
}

.widget-manager-dialog .el-dialog__footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}
</style>