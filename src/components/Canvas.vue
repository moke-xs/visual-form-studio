<template>
  <div class="canvas-wrapper" :class="`device-${props.deviceSize}`">
    <el-scrollbar height="100%" class="canvas-scrollbar">
      <div
        class="canvas"
        :class="`canvas-${props.deviceSize}`"
        @dragover.prevent="onCanvasDragOver"
        @dragenter.prevent="onCanvasDragEnter"
        @dragleave.prevent="onCanvasDragLeave"
        @drop="onDrop"
        @keydown="onKeyDown"
        @click="onCanvasClick"
        tabindex="0"
      >
        <!-- 空状态 -->
        <div v-if="widgetList.length === 0" class="canvas-empty">
          <div class="empty-content">
            <div class="empty-icon">
              <i class="mdi mdi-view-dashboard-outline"></i>
            </div>
            <h3 class="empty-title">开始设计你的表单</h3>
            <p class="empty-description">
              从左侧控件面板拖拽组件到此处开始设计
            </p>
            <div class="empty-tips">
              <div class="tip-item">
                <i class="mdi mdi-drag"></i>
                <span>拖拽添加组件</span>
              </div>
              <div class="tip-item">
                <i class="mdi mdi-cursor-default-click"></i>
                <span>点击选中组件</span>
              </div>
              <div class="tip-item">
                <i class="mdi mdi-cog"></i>
                <span>右侧面板配置属性</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 可排序的组件列表 -->
        <div class="sortable-wrapper">
          <!-- 拖拽插入位置指示器 -->
          <div 
            v-if="showInsertIndicator" 
            class="insert-indicator"
            :style="{ top: insertIndicatorTop + 'px' }"
          >
            <div class="insert-line"></div>
            <div class="insert-text">
              <i class="mdi mdi-plus-circle"></i>
              <span>在此位置插入组件</span>
            </div>
          </div>
          
          <div ref="sortableContainer" class="sortable-container">
            <div
              v-for="(widget, index) in widgetList"
              :key="widget.id"
              class="widget-wrapper"
              :data-widget-id="widget.id"
              :data-selected="selectedId === widget.id"
              :data-index="index"
              @dragover.prevent="onWidgetDragOver"
              @dragleave="onWidgetDragLeave"
            >
              <!-- 控件操作按钮 -->
              <div v-if="selectedId === widget.id" class="widget-actions">
                <el-button-group size="small">
                  <el-button
                    type="danger"
                    :icon="Delete"
                    @click.stop="deleteWidget(widget.id)"
                    title="删除"
                  />
                </el-button-group>
              </div>
              
              <!-- 控件组件 -->
              <component
                :is="getWidgetComponent(widget.type)"
                :widget="widget"
                :selected="selectedId === widget.id"
                @select="selectWidget"
              />
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>
  
  <script setup lang="ts">
  import { useDesignerStore } from '../store'
  import { widgets } from './widgets'
  import { Delete } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import Sortable from 'sortablejs'
  
  // Props
  const props = defineProps<{
    deviceSize: 'desktop' | 'tablet' | 'mobile'
  }>()
  
  // 获取 Pinia 状态
  const store = useDesignerStore()
  // 使用 storeToRefs 保持响应式
  const { widgetList, selectedId } = storeToRefs(store)
  
  // Sortable 相关
  const sortableContainer = ref<HTMLElement>()
  let sortableInstance: Sortable | null = null
  
  // 拖拽插入指示器
  const showInsertIndicator = ref(false)
  const insertIndicatorTop = ref(0)
  const insertIndex = ref(-1)
  const isDraggingFromPanel = ref(false)
  
  // 节流函数
  function throttle(func: Function, limit: number) {
    let inThrottle: boolean
    return function(this: any, ...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
  
  // 监听设备尺寸变化
  watch(() => props.deviceSize, (newSize) => {
    console.log('设备尺寸变化:', newSize)
  }, { immediate: true })
  
  // 拖拽到画布时，添加新控件
  function onDrop(event: DragEvent) {
    event.preventDefault()
    const type = event.dataTransfer?.getData('widget-type')
    console.log('画布接收到拖放事件，控件类型:', type)
    
    if (type) {
      // 如果显示了插入指示器，说明是精确插入
      if (showInsertIndicator.value && insertIndex.value >= 0) {
        console.log('精确插入到位置:', insertIndex.value)
        store.addWidgetAtIndex(type, insertIndex.value)
      } else {
        // 否则添加到末尾
        console.log('添加到末尾')
        store.addWidget(type)
      }
    } else {
      console.log('未获取到控件类型')
    }
    
    // 清理插入指示器
    hideInsertIndicator()
  }
  
  // 计算并显示插入位置指示器 - 修复偏移问题
  function calculateInsertPosition(event: DragEvent, targetElement: HTMLElement): number {
    if (!sortableContainer.value || !widgetList.value.length) return -1
    
    const rect = targetElement.getBoundingClientRect()
    const wrapperElement = sortableContainer.value.parentElement // sortable-wrapper
    const wrapperRect = wrapperElement?.getBoundingClientRect() || sortableContainer.value.getBoundingClientRect()
    const mouseY = event.clientY
    const centerY = rect.top + rect.height / 2
    
    // 获取当前组件的索引
    const currentIndex = parseInt(targetElement.dataset.index || '0')
    
    // 边界检查
    if (currentIndex < 0 || currentIndex >= widgetList.value.length) {
      return -1
    }
    
    // 关键修复：插入位置逻辑
    // 如果鼠标在组件上半部分，插入到当前组件之前（索引不变）
    // 如果在下半部分，插入到当前组件之后（索引+1）
    const insertIdx = mouseY < centerY ? currentIndex : currentIndex + 1
    
    // 计算指示器的位置
    let indicatorTop = 20 // 默认值
    
    try {
      if (insertIdx === 0) {
        // 插入到第一个位置 - 第一个组件之前
        const firstElement = sortableContainer.value.children[0] as HTMLElement
        if (firstElement) {
          const firstRect = firstElement.getBoundingClientRect()
          indicatorTop = Math.max(firstRect.top - wrapperRect.top - 12, 10)
        }
      } else if (insertIdx >= widgetList.value.length) {
        // 插入到最后 - 最后一个组件之后
        const lastIndex = widgetList.value.length - 1
        const lastElement = sortableContainer.value.children[lastIndex] as HTMLElement
        if (lastElement) {
          const lastRect = lastElement.getBoundingClientRect()
          indicatorTop = lastRect.bottom - wrapperRect.top + 12
        }
      } else {
        // 插入到中间位置 - 指定索引位置的组件之前
        const targetInsertElement = sortableContainer.value.children[insertIdx] as HTMLElement
        if (targetInsertElement) {
          const targetInsertRect = targetInsertElement.getBoundingClientRect()
          indicatorTop = targetInsertRect.top - wrapperRect.top - 12
        }
      }
    } catch (error) {
      console.warn('计算插入位置时出错:', error)
      return -1
    }
    
    insertIndicatorTop.value = Math.max(indicatorTop, 0)
    return Math.max(0, Math.min(insertIdx, widgetList.value.length))
  }
  
  // 处理组件拖拽悬停 - 优化版本
  function handleWidgetDragOver(event: DragEvent) {
    if (!isDraggingFromPanel.value) return
    
    event.preventDefault()
    const target = event.currentTarget as HTMLElement
    const newIndex = calculateInsertPosition(event, target)
    
    // 只有当位置真正改变时才更新
    if (newIndex !== insertIndex.value && newIndex >= 0) {
      insertIndex.value = newIndex
      showInsertIndicator.value = true
    }
  }
  
  // 使用节流优化的拖拽处理函数
  const onWidgetDragOver = throttle(handleWidgetDragOver, 16) // 约60fps
  
  // 处理组件拖拽离开 - 优化版本
  function onWidgetDragLeave(event: DragEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement
    
    // 如果离开当前组件但还在画布内，不隐藏指示器
    if (relatedTarget && (
      sortableContainer.value?.contains(relatedTarget) ||
      relatedTarget.closest('.canvas')
    )) {
      return
    }
    
    // 延迟检查，避免在组件间快速移动时闪烁
    setTimeout(() => {
      const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY)
      if (!elementUnderMouse?.closest('.canvas')) {
        hideInsertIndicator()
      }
    }, 50)
  }
  
  // 隐藏插入指示器
  function hideInsertIndicator() {
    showInsertIndicator.value = false
    insertIndex.value = -1
    isDraggingFromPanel.value = false
  }
  
  // 画布拖拽进入
  function onCanvasDragEnter(event: DragEvent) {
    event.preventDefault()
    // 检查是否是从组件面板拖拽
    const hasWidgetType = event.dataTransfer?.types.includes('widget-type') || 
                         event.dataTransfer?.types.includes('text/plain')
    if (hasWidgetType && !isDraggingFromPanel.value) {
      isDraggingFromPanel.value = true
    }
  }
  
  // 画布拖拽悬停处理
  function handleCanvasDragOver(event: DragEvent) {
    if (!isDraggingFromPanel.value) return
    
    event.preventDefault()
    const targetElement = event.target as HTMLElement
    const isOverWidget = targetElement?.closest('.widget-wrapper')
    
    // 如果不在任何组件上或者画布为空，显示插入指示器
    if (!isOverWidget) {
      const newIndex = widgetList.value.length
      if (newIndex !== insertIndex.value) {
        insertIndex.value = newIndex
        showInsertIndicator.value = true
        
        if (sortableContainer.value) {
          const wrapperElement = sortableContainer.value.parentElement
          const wrapperRect = wrapperElement?.getBoundingClientRect() || sortableContainer.value.getBoundingClientRect()
          if (widgetList.value.length > 0) {
            // 有组件时，插入到最后一个组件后面
            const lastElement = sortableContainer.value.children[widgetList.value.length - 1] as HTMLElement
            if (lastElement) {
              const lastRect = lastElement.getBoundingClientRect()
              insertIndicatorTop.value = lastRect.bottom - wrapperRect.top + 10
            }
          } else {
            // 空画布时，显示在顶部
            insertIndicatorTop.value = 20
          }
        }
      }
    }
  }
  
  // 使用节流优化的画布拖拽处理函数
  const onCanvasDragOver = throttle(handleCanvasDragOver, 16) // 约60fps
  
  // 画布拖拽离开 - 优化版本
  function onCanvasDragLeave(event: DragEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement
    const canvas = event.currentTarget as HTMLElement
    
    // 如果离开画布区域，清理状态
    if (!relatedTarget || !canvas.contains(relatedTarget)) {
      // 延迟检查，确保不是在画布内部元素间移动
      setTimeout(() => {
        const elementUnderMouse = document.elementFromPoint(event.clientX, event.clientY)
        if (!elementUnderMouse?.closest('.canvas')) {
          hideInsertIndicator()
        }
      }, 100)
    }
  }
  
  // 根据类型返回组件（type 必须和 name 一致，如 'InputWidget'）
  function getWidgetComponent(type: string) {
    return widgets[type] || null
  }
  
  // 画布点击事件 - 清除选中状态
  function onCanvasClick(event: Event) {
    console.log('点击画布，清除选中状态')
    console.log('点击目标:', event.target)
    console.log('当前路径:', event.composedPath())
    store.selectWidget('')
  }

  // 选中控件
  function selectWidget(id: string) {
    console.log('点击选中控件:', id)
    console.log('选中前 selectedId:', selectedId.value)
    store.selectWidget(id)
    console.log('选中后 selectedId:', selectedId.value)
  }
  
  // 删除控件
  async function deleteWidget(id: string) {
    console.log('deleteWidget 被调用，控件ID:', id)
    console.log('当前选中ID:', selectedId.value)
    try {
      await ElMessageBox.confirm(
        '确定要删除这个控件吗？',
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      console.log('用户确认删除，调用 store.deleteWidget')
      store.deleteWidget(id)
      console.log('删除完成，当前控件数量:', widgetList.value.length)
    } catch {
      console.log('用户取消删除')
    }
  }
  
  // 初始化 Sortable
  function initSortable() {
    if (!sortableContainer.value) return
    
          sortableInstance = new Sortable(sortableContainer.value, {
        animation: 200,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.widget-wrapper', // 整个组件都可以拖拽
        filter: '.widget-actions', // 排除操作按钮区域
        forceFallback: false,
        fallbackTolerance: 3,
      
      onStart: (evt) => {
        console.log('开始拖拽:', evt.oldIndex)
        // 选中被拖拽的组件
        const draggedWidget = widgetList.value[evt.oldIndex!]
        if (draggedWidget && selectedId.value !== draggedWidget.id) {
          store.selectWidget(draggedWidget.id)
        }
      },
      
      onEnd: (evt) => {
        console.log('拖拽结束:', evt.oldIndex, '->', evt.newIndex)
        
        // 如果位置发生了变化，更新数据
        if (evt.oldIndex !== evt.newIndex && evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          store.moveWidget(evt.oldIndex, evt.newIndex)
        }
      }
    })
  }
  
  // 销毁 Sortable
  function destroySortable() {
    if (sortableInstance) {
      sortableInstance.destroy()
      sortableInstance = null
    }
  }
  
  // 键盘事件处理
  function onKeyDown(event: KeyboardEvent) {
    if (!selectedId.value) return
    
    // 检查当前焦点是否在输入元素上
    const activeElement = document.activeElement
    const isInputElement = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      (activeElement as HTMLElement).isContentEditable ||
      activeElement.closest('.el-input') ||
      activeElement.closest('.el-textarea') ||
      activeElement.closest('.el-select') ||
      activeElement.closest('[contenteditable]')
    )
    
    // 如果用户正在输入，不处理删除快捷键
    if (isInputElement) {
      return
    }
    
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        event.preventDefault()
        deleteWidget(selectedId.value)
        break
    }
  }
  
  // 生命周期
  onMounted(() => {
    initSortable()
  })
  
  onUnmounted(() => {
    destroySortable()
  })
  </script>
  
  
  <style scoped>
.canvas-wrapper {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.canvas-scrollbar {
  border-radius: 12px;
}

.canvas {
  min-height: calc(100vh - 140px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 24px;
  position: relative;
  outline: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.canvas::before {
  opacity: 0;
  animation: fadeInDown 0.5s ease forwards;
  animation-delay: 0.2s;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.canvas-wrapper.device-desktop .canvas::before {
  animation: fadeInRight 0.5s ease forwards;
  animation-delay: 0.2s;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 设备尺寸样式 */
.canvas-wrapper.device-desktop {
  .canvas {
    max-width: none;
    margin: 0;
    position: relative;
  }
  
  .canvas::before {
    content: '桌面模式 - 全屏';
    position: absolute;
    top: -35px;
    right: 20px;
    background: rgba(102, 126, 234, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    z-index: 10;
    transform: translateY(0);
  }
}

.canvas-wrapper.device-tablet {
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.08);
  padding: 20px;
  
  .canvas {
    max-width: 768px !important;
    width: 768px;
    margin: 0 auto;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    position: relative;
  }
  
  .canvas::before {
    content: '平板模式 - 768px';
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(102, 126, 234, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    z-index: 10;
  }
}

.canvas-wrapper.device-mobile {
  display: flex;
  justify-content: center;
  background: rgba(0, 0, 0, 0.08);
  padding: 20px;
  
  .canvas {
    max-width: 375px !important;
    width: 375px;
    margin: 0 auto;
    box-shadow: 0 12px 50px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    position: relative;
  }
  
  .canvas::before {
    content: '手机模式 - 375px';
    position: absolute;
    top: -35px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(102, 126, 234, 0.9);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    backdrop-filter: blur(10px);
    z-index: 10;
  }
}

/* 空状态样式 */
.canvas-empty {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.canvas-empty:hover {
  border-color: rgba(102, 126, 234, 0.4);
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.01);
}

.empty-content {
  text-align: center;
  max-width: 480px;
  padding: 40px;
  animation: fadeInUp 0.8s ease forwards;
}

.empty-icon {
  margin-bottom: 24px;
  position: relative;
}

.empty-icon i {
  font-size: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
  animation: pulse 2s ease-in-out infinite;
}

.empty-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-description {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.empty-tips {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.tip-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 120px;
}

.tip-item:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.tip-item i {
  font-size: 24px;
  color: #667eea;
  transition: all 0.3s ease;
}

.tip-item:hover i {
  transform: scale(1.2);
  color: #764ba2;
}

.tip-item span {
  font-size: 12px;
  color: #5a6c7d;
  font-weight: 500;
  text-align: center;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

/* 响应式适配 */
.canvas-wrapper.device-mobile .empty-content {
  max-width: 280px;
  padding: 24px;
}

.canvas-wrapper.device-mobile .empty-icon i {
  font-size: 80px;
}

.canvas-wrapper.device-mobile .empty-title {
  font-size: 20px;
}

.canvas-wrapper.device-mobile .empty-description {
  font-size: 14px;
}

.canvas-wrapper.device-mobile .empty-tips {
  flex-direction: column;
  gap: 12px;
}

.canvas-wrapper.device-mobile .tip-item {
  flex-direction: row;
  min-width: auto;
  padding: 12px 16px;
  gap: 12px;
}

.canvas-wrapper.device-mobile .tip-item i {
  font-size: 20px;
}

.canvas-wrapper.device-tablet .empty-content {
  max-width: 400px;
  padding: 32px;
}

.canvas-wrapper.device-tablet .empty-icon i {
  font-size: 100px;
}

.canvas-wrapper.device-tablet .empty-title {
  font-size: 24px;
}


  .sortable-wrapper {
  position: relative;
  min-height: 50px;
}

  .sortable-container {
  min-height: 50px;
  position: relative;
  padding-top: 20px; /* 为删除按钮留出空间 */
}

/* 插入位置指示器 */
.insert-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1001;
  pointer-events: none;
  animation: indicatorFadeIn 0.2s ease forwards;
}

.insert-line {
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin: 0 20px;
  box-shadow: 0 3px 12px rgba(102, 126, 234, 0.6), 0 1px 4px rgba(102, 126, 234, 0.4);
  position: relative;
  animation: linePulse 1.5s ease-in-out infinite;
}

.insert-line::before,
.insert-line::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.4);
}

.insert-line::before {
  left: -4px;
}

.insert-line::after {
  right: -4px;
}

.insert-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  color: #667eea;
  font-size: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.insert-text i {
  font-size: 14px;
  color: #667eea;
}

@keyframes indicatorFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes linePulse {
  0%, 100% {
    opacity: 1;
    transform: scaleY(1);
  }
  50% {
    opacity: 0.8;
    transform: scaleY(1.1);
  }
}

/* 组件过渡动画 */
.widget-wrapper {
  animation: widgetFadeIn 0.4s ease forwards;
}

@keyframes widgetFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 组件间距优化 */
.widget-wrapper:last-child {
  margin-bottom: 0;
}

/* 组件容器样式优化 */
.widget-wrapper {
  position: relative;
  cursor: move;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.08);
  border: 2px solid rgba(102, 126, 234, 0.1);
  overflow: visible;
  padding: 20px;
  isolation: isolate;
}

/* 选中状态样式 */
.widget-wrapper[data-selected="true"] {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  transform: translateY(-4px);
}

.widget-wrapper[data-selected="true"]::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  z-index: -1;
  animation: selectedGlow 2s ease-in-out infinite;
}

/* 悬停效果 */
.widget-wrapper:hover:not([data-selected="true"]) {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(102, 126, 234, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(102, 126, 234, 0.12);
}

/* 选中发光动画 */
@keyframes selectedGlow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}
  
/* Sortable.js 拖拽样式优化 */
.sortable-ghost {
  opacity: 0.5;
  background: rgba(102, 126, 234, 0.08);
  border: 3px dashed rgba(102, 126, 234, 0.4);
  border-radius: 16px;
  transform: scale(0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

.sortable-chosen {
  cursor: grabbing !important;
  background: rgba(255, 255, 255, 1) !important;
  box-shadow: 0 12px 48px rgba(102, 126, 234, 0.35) !important;
  transform: scale(1.03) rotate(1deg) !important;
  z-index: 1000;
  border-color: rgba(102, 126, 234, 0.6) !important;
  backdrop-filter: blur(20px);
}

.sortable-drag {
  opacity: 0.95;
  transform: rotate(2deg) scale(1.05) !important;
  box-shadow: 0 16px 56px rgba(102, 126, 234, 0.4) !important;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(102, 126, 234, 0.08) 100%) !important;
  backdrop-filter: blur(25px);
  border-color: rgba(102, 126, 234, 0.5) !important;
}
/* 操作按钮样式优化 */
.widget-actions {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 102;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.15);
  border: 2px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: actionsFadeIn 0.3s ease forwards;
}

.widget-actions:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 12px 36px rgba(102, 126, 234, 0.25);
  transform: translateY(-4px) scale(1.05);
  border-color: rgba(102, 126, 234, 0.4);
}

.widget-actions :deep(.el-button) {
  border: none;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  border-radius: 8px;
  padding: 6px 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  min-height: 32px;
  width: 32px;
}

.widget-actions :deep(.el-button:hover) {
  background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 82, 82, 0.4);
}

.widget-actions :deep(.el-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 82, 82, 0.3);
}

@keyframes actionsFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
  
  /* 拖拽时隐藏操作按钮 */
.sortable-chosen .widget-actions,
.sortable-drag .widget-actions {
  opacity: 0;
  pointer-events: none;
}

</style>

<style>
/* Element Plus Scrollbar 自定义样式 - Canvas */
.canvas-scrollbar .el-scrollbar__bar.is-vertical > div {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 6px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.canvas-scrollbar .el-scrollbar__bar.is-vertical > div:hover {
  opacity: 0.8;
  transform: scaleX(1.2);
}

.canvas-scrollbar .el-scrollbar__bar.is-vertical {
  width: 5px;
  right: 2px;
}

.canvas-scrollbar .el-scrollbar__thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 6px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.canvas-scrollbar .el-scrollbar__track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  backdrop-filter: blur(5px);
}

/* 滚动条悬停效果 */
.canvas-scrollbar:hover .el-scrollbar__bar {
  opacity: 1;
}

.canvas-scrollbar .el-scrollbar__bar {
  opacity: 0.3;
  transition: opacity 0.3s ease;
}
</style>