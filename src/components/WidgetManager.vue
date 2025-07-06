<template>
  <div class="widget-manager">
    <div class="manager-header">
      <h2>组件管理</h2>
      <div class="header-actions">
        <el-select v-model="currentRole" @change="onRoleChange" style="width: 120px; margin-right: 12px;">
          <el-option label="管理员" value="admin" />
          <el-option label="VIP用户" value="vip" />
          <el-option label="普通用户" value="user" />
          <el-option label="访客" value="guest" />
        </el-select>
        <el-button @click="exportConfigs" type="primary" :icon="Download">导出配置</el-button>
        <el-button @click="importDialogVisible = true" type="success" :icon="Upload">导入配置</el-button>
        <el-button @click="regenerateConfigs" type="warning" :icon="Refresh">重新生成</el-button>
        <el-button @click="resetConfigs" type="danger" :icon="Delete">重置配置</el-button>
      </div>
    </div>

    <div class="manager-stats">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ stats.total }}</div>
              <div class="stat-label">总组件数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ stats.enabled }}</div>
              <div class="stat-label">已启用</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ stats.disabled }}</div>
              <div class="stat-label">已禁用</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div class="stat-item">
              <div class="stat-value">{{ visibleCount }}</div>
              <div class="stat-label">当前可见</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="manager-content">
      <el-table :data="tableData" stripe style="width: 100%" @sort-change="handleSortChange">
        <el-table-column prop="icon" label="图标" width="80">
          <template #default="{ row }">
            <i :class="row.icon" style="font-size: 20px; color: #667eea;"></i>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="组件名称" width="150" />
        <el-table-column prop="type" label="组件类型" width="180" />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order" label="排序" width="100" sortable="custom">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.order" 
              :min="1" 
              :max="999" 
              :step="5"
              size="small"
              @change="updateOrder(row.type, row.order)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch 
              v-model="row.enabled" 
              @change="updateEnabled(row.type, row.enabled)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="visible" label="可见权限" width="200">
          <template #default="{ row }">
            <el-select 
              v-model="row.visible" 
              multiple 
              size="small"
              @change="updateVisible(row.type, row.visible)"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="VIP用户" value="vip" />
              <el-option label="普通用户" value="user" />
              <el-option label="访客" value="guest" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200">
          <template #default="{ row }">
            <el-input 
              v-model="row.description" 
              size="small"
              @blur="updateDescription(row.type, row.description)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button @click="resetSingleConfig(row.type)" size="small" type="warning">重置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 导入配置对话框 -->
    <el-dialog v-model="importDialogVisible" title="导入配置" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        :file-list="fileList"
        accept=".json"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将JSON配置文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传JSON格式的配置文件
          </div>
        </template>
      </el-upload>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button @click="doImport" type="primary" :disabled="!selectedFile">确认导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Upload, Refresh, Delete, UploadFilled } from '@element-plus/icons-vue'
import { 
  getWidgetConfigs, 
  updateWidgetConfig, 
  resetWidgetConfigs, 
  regenerateConfigs as doRegenerateConfigs,
  exportConfigs as doExportConfigs,
  importConfigs as doImportConfigs,
  getConfigStats,
  currentUserRole,
  setUserRole,
  widgetMetas,
  type UserRole,
  type WidgetConfig
} from './widgets'

defineOptions({ name: 'WidgetManager' })

// 响应式数据
const currentRole = ref<UserRole>('admin')
const importDialogVisible = ref(false)
const selectedFile = ref<File | null>(null)
const fileList = ref([])
const uploadRef = ref()

// 表格数据
const tableData = ref<WidgetConfig[]>([])
const stats = ref({
  total: 0,
  enabled: 0,
  disabled: 0,
  byCategory: {},
  byRole: {}
})

// 计算当前角色可见的组件数量
const visibleCount = computed(() => {
  return widgetMetas.value.length
})

// 分类标签类型
const getCategoryTagType = (category: string) => {
  const types: Record<string, string> = {
    form: 'primary',
    basic: 'success',
    data: 'warning',
    navigation: 'info',
    feedback: 'danger'
  }
  return types[category] || 'default'
}

// 分类标签文本
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    form: '表单组件',
    basic: '基础组件',
    data: '数据展示',
    navigation: '导航组件',
    feedback: '反馈组件'
  }
  return labels[category] || category
}

// 加载数据
const loadData = () => {
  const configs = getWidgetConfigs()
  tableData.value = Object.values(configs)
  stats.value = getConfigStats()
  currentRole.value = currentUserRole.value
}

// 更新排序
const updateOrder = async (type: string, order: number) => {
  const success = updateWidgetConfig(type, { order })
  if (success) {
    ElMessage.success('排序已更新')
    loadData()
  } else {
    ElMessage.error('更新失败')
  }
}

// 更新启用状态
const updateEnabled = async (type: string, enabled: boolean) => {
  const success = updateWidgetConfig(type, { enabled })
  if (success) {
    ElMessage.success(`组件已${enabled ? '启用' : '禁用'}`)
    loadData()
  } else {
    ElMessage.error('更新失败')
  }
}

// 更新可见权限
const updateVisible = async (type: string, visible: UserRole[]) => {
  const success = updateWidgetConfig(type, { visible })
  if (success) {
    ElMessage.success('权限已更新')
    loadData()
  } else {
    ElMessage.error('更新失败')
  }
}

// 更新描述
const updateDescription = async (type: string, description: string) => {
  const success = updateWidgetConfig(type, { description })
  if (success) {
    ElMessage.success('描述已更新')
  } else {
    ElMessage.error('更新失败')
  }
}

// 角色切换
const onRoleChange = (role: UserRole) => {
  setUserRole(role)
  ElMessage.info(`已切换到${role === 'admin' ? '管理员' : role === 'vip' ? 'VIP用户' : role === 'user' ? '普通用户' : '访客'}视角`)
}

// 表格排序
const handleSortChange = ({ prop, order }: any) => {
  if (prop === 'order') {
    tableData.value.sort((a, b) => {
      return order === 'ascending' ? a.order - b.order : b.order - a.order
    })
  }
}

// 重置单个组件配置
const resetSingleConfig = async (_type: string) => {
  try {
    await ElMessageBox.confirm('确定要重置此组件的配置吗？', '确认重置', {
      type: 'warning'
    })
    
    // 这里需要实现单个组件重置的逻辑
    // 暂时使用重新生成的方式
    doRegenerateConfigs()
    loadData()
    ElMessage.success('配置已重置')
  } catch {
    // 用户取消
  }
}

// 导出配置
const exportConfigs = () => {
  doExportConfigs()
  ElMessage.success('配置已导出')
}

// 重新生成配置
const regenerateConfigs = async () => {
  try {
    await ElMessageBox.confirm('重新生成会保留您的自定义配置，确定继续吗？', '确认重新生成', {
      type: 'warning'
    })
    
    doRegenerateConfigs()
    loadData()
    ElMessage.success('配置已重新生成')
  } catch {
    // 用户取消
  }
}

// 重置配置
const resetConfigs = async () => {
  try {
    await ElMessageBox.confirm('重置会清除所有自定义配置，确定继续吗？', '确认重置', {
      type: 'error'
    })
    
    resetWidgetConfigs()
    loadData()
    ElMessage.success('配置已重置')
  } catch {
    // 用户取消
  }
}

// 文件选择
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
}

// 执行导入
const doImport = async () => {
  if (!selectedFile.value) {
    ElMessage.error('请选择文件')
    return
  }
  
  try {
    const success = await doImportConfigs(selectedFile.value)
    if (success) {
      ElMessage.success('配置导入成功')
      importDialogVisible.value = false
      loadData()
    } else {
      ElMessage.error('配置导入失败')
    }
  } catch (error) {
    ElMessage.error('导入过程中发生错误')
  }
  
  // 清理
  selectedFile.value = null
  fileList.value = []
  uploadRef.value?.clearFiles()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.widget-manager {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.manager-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manager-stats {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-top: 8px;
}

.manager-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Element Plus 表格自定义样式 */
:deep(.el-table) {
  border-radius: 12px;
}

:deep(.el-table th) {
  background: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table tr:hover > td) {
  background: #f5f7fa;
}

/* 卡片样式 */
:deep(.el-card) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 上传组件样式 */
:deep(.el-upload-dragger) {
  border-radius: 12px;
  border: 2px dashed #d3dce6;
  background: #fafbfc;
}

:deep(.el-upload-dragger:hover) {
  border-color: #667eea;
  background: #f0f2ff;
}
</style> 