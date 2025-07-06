<template>
  <div class="designer-container">
    <!-- 顶部操作栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-content">
        <div class="toolbar-title">
          <i class="mdi mdi-microsoft-windows"></i>
          <span>善见教育 - 表单与查询管理中心</span>
        </div>
        <div class="toolbar-actions">
          <!-- 设备尺寸切换 -->
          <div class="device-size-group">
            <el-button-group>
              <el-button 
                @click="setDeviceSize('desktop')" 
                :class="['glass-button', { active: deviceSize === 'desktop' }]"
                title="桌面视图 (1200px+)"
              >
                <i class="mdi mdi-monitor"></i>
              </el-button>
              <el-button 
                @click="setDeviceSize('tablet')" 
                :class="['glass-button', { active: deviceSize === 'tablet' }]"
                title="平板视图 (768px)"
              >
                <i class="mdi mdi-tablet"></i>
              </el-button>
              <el-button 
                @click="setDeviceSize('mobile')" 
                :class="['glass-button', { active: deviceSize === 'mobile' }]"
                title="手机视图 (375px)"
              >
                <i class="mdi mdi-cellphone"></i>
              </el-button>
            </el-button-group>
          </div>
          
          <!-- 分隔线 -->
          <div class="toolbar-divider"></div>
          
          <el-button @click="clearAll" type="danger" class="glass-button danger">
            <i class="mdi mdi-delete-outline"></i>
            清空
          </el-button>
          <el-button @click="saveForm" type="success" class="glass-button success" :loading="saving">
            <i class="mdi mdi-content-save"></i>
            保存表单
          </el-button>
          <el-button @click="exitEdit" type="warning" class="glass-button warning">
            <i class="mdi mdi-close"></i>
            退出编辑
          </el-button>
          <el-dropdown @command="handleCommand" trigger="click" class="glass-dropdown">
            <el-button type="primary" class="glass-button primary">
              <i class="mdi mdi-cog-outline"></i>
              操作
              <i class="mdi mdi-chevron-down"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="glass-dropdown-menu">
                <el-dropdown-item command="preview">
            <i class="mdi mdi-eye-outline"></i>
                  预览表单
                </el-dropdown-item>
                <el-dropdown-item command="reload">
            <i class="mdi mdi-refresh"></i>
                  重新加载
                </el-dropdown-item>
                <el-dropdown-item command="export" divided>
            <i class="mdi mdi-download-outline"></i>
            导出JSON
                </el-dropdown-item>
                <el-dropdown-item command="import">
            <i class="mdi mdi-upload-outline"></i>
            导入JSON
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
    
    <!-- 三栏主布局 -->
    <div class="designer-layout">
      <!-- 左侧控件面板 -->
      <WidgetPanel class="designer-panel" />
      <!-- 中间画布 -->
      <Canvas class="designer-canvas" :device-size="deviceSize" />
      <!-- 右侧属性面板 -->
      <PropertyPanel class="designer-property" />
    </div>
    
    <!-- 预览弹窗 -->
    <el-dialog v-model="previewVisible" title="表单预览" width="600px" class="glass-dialog">
      <div class="preview-content">
        <div v-for="widget in widgetList" :key="widget.id" class="preview-widget">
          <component :is="getWidgetComponent(widget.type)" :widget="widget" :selected="false" />
        </div>
      </div>
    </el-dialog>
    
    <!-- 导入JSON弹窗 -->
    <el-dialog v-model="importDialogVisible" title="导入JSON" width="500px" class="glass-dialog">
      <div class="import-content">
        <el-input
          v-model="importJsonText"
          type="textarea"
          :rows="10"
          placeholder="请粘贴导出的JSON"
          class="glass-textarea"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importDialogVisible = false" class="glass-button">取消</el-button>
          <el-button type="primary" @click="importJson" class="glass-button primary">导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 引入各个子组件
import WidgetPanel from './WidgetPanel.vue'
import Canvas from './Canvas.vue'
import PropertyPanel from './PropertyPanel.vue'
import { widgets } from './widgets'
import { useDesignerStore } from '../store'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

// 获取 Pinia store
const store = useDesignerStore()
const widgetList = store.widgetList

// 获取路由信息
const route = useRoute()
const router = useRouter()

// 设备尺寸状态
const deviceSize = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

// 保存状态
const saving = ref(false)

// 页面初始化时加载表单配置
onMounted(async () => {
  await loadFormConfig()
  
  // 监听组件列表变化，自动保存（防抖）
  // let saveTimeout: number | null = null
  // watch(() => store.widgetList.length, () => {
  //   if (saveTimeout) {
  //     clearTimeout(saveTimeout)
  //   }
  //   saveTimeout = setTimeout(() => {
  //     // 只有当有组件时才自动保存
  //     if (store.widgetList.length > 0) {
  //       console.log('检测到组件变化，自动保存...')
  //       saveForm()
  //     }
  //   }, 2000) // 2秒后自动保存
  // })
})

  // ---------------- 顶部操作栏功能 ----------------
  // 设备尺寸切换
  function setDeviceSize(size: 'desktop' | 'tablet' | 'mobile') {
    console.log('切换设备尺寸:', size)
    deviceSize.value = size
    console.log('设备尺寸已更新为:', deviceSize.value)
  }
  
  // 清空画布
  function clearAll() {
    store.widgetList.splice(0, store.widgetList.length)
    store.selectedId = null
    ElMessage.success('已清空画布')
  }
  
  // 退出编辑
  async function exitEdit() {
    try {
      await ElMessageBox.confirm(
        '是否保存当前设计到服务器？', 
        '退出确认', 
        {
          type: 'warning',
          confirmButtonText: '保存并退出',
          cancelButtonText: '直接退出',
          distinguishCancelAndClose: true,
          closeOnClickModal: false
        }
      )
      
      // 用户选择保存并退出
      await saveForm()
      router.push('/forms')
      
    } catch (error) {
      if (error === 'cancel') {
        // 用户选择直接退出，不保存
        router.push('/forms')
      }
      // 其他情况（用户点击关闭按钮）不做任何操作
    }
  }
// 预览弹窗控制
const previewVisible = ref(false)
function preview() {
  previewVisible.value = true
}

// 处理下拉菜单命令
function handleCommand(command: string) {
  switch (command) {
    case 'preview':
      preview()
      break
    case 'reload':
      loadFormConfig()
      break
    case 'export':
      exportJson()
      break
    case 'import':
      importDialogVisible.value = true
      break
  }
}
// 动态获取控件组件
function getWidgetComponent(type: string) {
  return widgets[type] || null
}
// 导出JSON
function exportJson() {
  const data = {
    widgetList: store.widgetList,
    selectedId: store.selectedId
  }
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'form.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已导出JSON')
}
// 导入JSON弹窗控制
const importDialogVisible = ref(false)
const importJsonText = ref('')
function importJson() {
  try {
    const data = JSON.parse(importJsonText.value)
    if (Array.isArray(data.widgetList)) {
      store.widgetList.splice(0, store.widgetList.length, ...data.widgetList)
      store.selectedId = data.selectedId || null
      ElMessage.success('导入成功')
      importDialogVisible.value = false
    } else {
      throw new Error('格式不正确')
    }
  } catch (e) {
    ElMessage.error('JSON格式错误')
  }
}

// 加载表单配置
async function loadFormConfig() {
  try {
    const formId = route.params.id
    
    if (!formId) {
      console.log('没有表单ID，跳过配置加载')
      return
    }
    
    console.log('加载表单配置，ID:', formId)
    
    // 调用API获取表单详情
    const { formsAPI } = await import('../api/forms')
    const response = await formsAPI.getFormDetail(parseInt(formId as string))
    const formData = response.data || response
    
    console.log('表单数据:', formData)
    
    // 检查是否有配置数据
    let configData = null
    
    // 解析 configJson 字符串
    if (formData.configJson) {
      try {
        configData = JSON.parse(formData.configJson)
        console.log('解析后的配置数据:', configData)
      } catch (error) {
        console.error('解析 configJson 失败:', error)
        configData = null
      }
    }
    
    // 检查是否有组件数据
    if (configData && configData.widgetList && Array.isArray(configData.widgetList) && configData.widgetList.length > 0) {
      const widgetList = configData.widgetList
      console.log('找到表单配置，组件数量:', widgetList.length)
      
      // 清空当前画布
      store.widgetList.splice(0, store.widgetList.length)
      
      // 加载组件到画布
      widgetList.forEach((widget: any) => {
        store.widgetList.push({
          id: widget.id,
          type: widget.type,
          ...widget // 保留所有属性
        })
      })
      
      // 设置选中的组件
      if (configData.selectedId) {
        store.selectedId = configData.selectedId
      }
      
      console.log('表单配置加载完成，当前组件数量:', store.widgetList.length)
      ElMessage.success('表单配置加载成功')
    } else {
      console.log('表单没有配置数据或配置为空，这是新创建的表单')
      // 新创建的表单，清空画布并显示提示
      store.widgetList.splice(0, store.widgetList.length)
      store.selectedId = null
      
      // 显示欢迎提示
      ElMessage.info('欢迎使用表单设计器！请从左侧拖拽组件开始设计您的表单')
    }
    
  } catch (error: any) {
    console.error('加载表单配置失败:', error)
    
    // 如果是新创建的表单，可能是配置为空导致的错误，不显示错误提示
    if (error.response?.status === 404 || error.message?.includes('not found')) {
      console.log('可能是新创建的表单，配置为空')
      store.widgetList.splice(0, store.widgetList.length)
      store.selectedId = null
      ElMessage.info('欢迎使用表单设计器！请从左侧拖拽组件开始设计您的表单')
    } else {
      ElMessage.error('加载表单配置失败')
    }
  }
}

// 保存表单配置
async function saveForm() {
  try {
    saving.value = true
    
    // 检查是否有表单ID（从路由参数获取）
    const formId = route.params.id
    
    if (!formId) {
      ElMessage.error('无法获取表单ID，请从表单列表进入设计器')
      return
    }
    
    // 从本地存储获取designer-store数据
    const localStoreData = localStorage.getItem('designer-store')
    console.log('本地存储的designer-store数据:', localStoreData)
    
    // 先获取当前表单的完整信息
    const { formsAPI } = await import('../api/forms')
    const currentFormResponse = await formsAPI.getFormDetail(parseInt(formId as string))
    const currentForm = currentFormResponse.data || currentFormResponse
    
    console.log('当前表单信息:', currentForm)
    
    // 准备更新数据，保持原有字段不变，只更新配置
    const updateData = {
      name: currentForm.name || '',
      description: currentForm.description || '',
      category: currentForm.category || '',
      startDate: currentForm.startDate,
      endDate: currentForm.endDate,
      formKey: currentForm.formKey || `form_${Date.now()}`, // 确保FormKey有值
      customCss: currentForm.customCss || '',
      configJson: localStoreData, // 直接使用本地存储的JSON字符串
      settingsJson: currentForm.settingsJson || '{}',
      fields: (currentForm as any).fields || []
    }
    
    console.log('准备更新的表单数据:', updateData)
    
    // 调用表单更新API
    await formsAPI.updateForm(parseInt(formId as string), updateData)
    console.log('表单配置更新成功')
    
    // 根据是否有组件显示不同的成功消息
    if (store.widgetList.length > 0) {
      ElMessage.success('表单配置保存成功！')
    } else {
      ElMessage.success('空白表单配置已保存')
    }
    
  } catch (error: any) {
    console.error('保存表单配置失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.designer-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

// 顶部操作栏样式
.designer-toolbar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  
  .toolbar-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    
    .toolbar-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;
      font-size: 20px;
      font-weight: 700;
      
      i {
        font-size: 28px;
        background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      span {
        background: linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  }
  
  .device-size-group {
    .el-button-group {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }
  }
  
  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 4px;
  }
}

// 玻璃按钮样式
.toolbar-actions :deep(.glass-button) {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 6px;
  
  i {
    font-size: 16px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }
  
  &.danger:hover {
    background: rgba(245, 108, 108, 0.3);
    border-color: rgba(245, 108, 108, 0.5);
  }
  
  &.success:hover {
    background: rgba(103, 194, 58, 0.3);
    border-color: rgba(103, 194, 58, 0.5);
  }
  
  &.warning:hover {
    background: rgba(230, 162, 60, 0.3);
    border-color: rgba(230, 162, 60, 0.5);
  }
  
  &.info:hover {
    background: rgba(144, 202, 249, 0.3);
    border-color: rgba(144, 202, 249, 0.5);
  }
}

// 设备尺寸按钮特殊样式
.device-size-group :deep(.glass-button) {
  padding: 10px 14px;
  border-radius: 0;
  position: relative;
  
  &:first-child {
    border-radius: 8px 0 0 8px;
  }
  
  &:last-child {
    border-radius: 0 8px 8px 0;
  }
  
  i {
    font-size: 20px;
    transition: all 0.3s ease;
  }
  
  &.active {
    background: rgba(255, 255, 255, 0.4) !important;
    border-color: rgba(255, 255, 255, 0.6) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3) !important;
    
    i {
      transform: scale(1.1);
      color: white;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }
  
  &:hover:not(.active) {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
    
    i {
      transform: scale(1.05);
    }
  }
}

// 下拉菜单样式
.toolbar-actions :deep(.glass-dropdown) {
  .glass-button {
    display: flex;
    align-items: center;
    gap: 8px;
    
    i:last-child {
      font-size: 14px;
      transition: transform 0.3s ease;
    }
  }
  
  &.is-open .glass-button i:last-child {
    transform: rotate(180deg);
  }
}

:deep(.glass-dropdown-menu) {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
  padding: 8px 0 !important;
  min-width: 180px !important;
  
  .el-dropdown-menu__item {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 12px 20px !important;
    color: #333 !important;
    font-weight: 500 !important;
    transition: all 0.3s ease !important;
    border-radius: 0 !important;
    
    i {
      font-size: 16px !important;
      color: #667eea !important;
    }
    
    &:hover {
      background: rgba(102, 126, 234, 0.1) !important;
      color: #667eea !important;
      transform: translateX(4px) !important;
    }
    
    &.is-divided {
      border-top: 1px solid rgba(102, 126, 234, 0.1) !important;
      margin-top: 4px !important;
      padding-top: 16px !important;
    }
  }
}

// 三栏主布局样式
.designer-layout {
  display: flex;
  height: calc(100vh - 72px);
  gap: 16px;
  padding: 16px;
}

.designer-panel {
  width: 280px;
  border-radius: 12px;
  overflow: hidden;
}

.designer-canvas {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
}

.designer-property {
  width: 320px;
  border-radius: 12px;
  overflow: hidden;
}

// 弹窗样式
:deep(.el-dialog) {
  border-radius: 16px !important;
  padding: 0px !important;
}
:deep(.glass-dialog) {
  .el-dialog {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 30px !important;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  
  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 24px;
    margin: 0;
    border-radius: 16px 16px 0 0;
    
    .el-dialog__title {
      color: white;
      font-weight: 600;
    }
    
    .el-dialog__headerbtn {
      top: 10px;
      right: 10px;
      
      .el-dialog__close {
        color: white;
        font-size: 18px;
        
        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }
  
  .el-dialog__body {
    padding: 24px;
  }
  
  .el-dialog__footer {
    padding: 0 24px 24px;
  }
}

.preview-content {
  .preview-widget {
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    border: 1px solid rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(102, 126, 234, 0.3);
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
    }
  }
}

.import-content {
  :deep(.glass-textarea .el-textarea__inner) {
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(102, 126, 234, 0.2);
    border-radius: 8px;
    
    &:hover {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
    }
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  
  :deep(.glass-button) {
    background: rgba(102, 126, 234, 0.1);
    border: 1px solid rgba(102, 126, 234, 0.3);
    color: #667eea;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(102, 126, 234, 0.2);
      border-color: #667eea;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
    }
    
    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: transparent;
      color: white;
      
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .designer-panel {
    width: 260px;
  }
  
  .designer-property {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .designer-layout {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  
  .designer-panel,
  .designer-property {
    width: 100%;
    height: 200px;
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 16px;
    
    .toolbar-actions {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
}
</style>
  