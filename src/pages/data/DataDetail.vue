<template>
  <div class="data-detail-container">
    <!-- 顶部导航栏 -->
    <div class="detail-header glass-card">
      <div class="header-left">
        <BrandLogo mode="mini" />
        <div class="header-divider"></div>
        <el-button 
          text 
          @click="goBack"
          class="back-button"
        >
          <i class="mdi mdi-arrow-left"></i>
          返回列表
        </el-button>
        <div class="header-info">
          <h1 class="page-title">数据详情</h1>
          <p class="data-info" v-if="dataDetail">
            <span class="data-id">ID: {{ dataDetail.id }}</span>
            <span class="submit-time">提交时间：{{ formatDateTime(dataDetail.created_at) }}</span>
          </p>
        </div>
      </div>
      
      <div class="header-actions">
        <el-button @click="refreshData" :loading="loading">
          <i class="mdi mdi-refresh"></i>
          刷新
        </el-button>
        <el-button @click="exportData">
          <i class="mdi mdi-download"></i>
          导出
        </el-button>
        <el-button @click="flagData" :type="dataDetail?.status === 'flagged' ? 'warning' : 'default'">
          <i class="mdi mdi-flag"></i>
          {{ dataDetail?.status === 'flagged' ? '取消标记' : '标记' }}
        </el-button>
        <el-button @click="deleteData" type="danger">
          <i class="mdi mdi-delete"></i>
          删除
        </el-button>
      </div>
    </div>

    <!-- 新功能广告 -->
    <FeatureAd page-type="data" />

    <!-- 主要内容区域 -->
    <div class="detail-content">
      <!-- 左侧数据详情 -->
      <div class="data-info-panel glass-card">
        <div class="panel-header">
          <h3>
            <i class="mdi mdi-information-outline"></i>
            提交详情
          </h3>
          <el-tag 
            :type="getStatusType(dataDetail?.status)" 
            v-if="dataDetail"
          >
            {{ getStatusText(dataDetail.status) }}
          </el-tag>
        </div>
        
        <div class="panel-content" v-if="dataDetail">
          <!-- 基本信息 -->
          <div class="info-section">
            <h4>基本信息</h4>
            <div class="info-item">
              <label>数据ID：</label>
              <span>{{ dataDetail.id }}</span>
            </div>
            <div class="info-item">
              <label>表单名称：</label>
              <span>{{ currentForm?.name || '-' }}</span>
            </div>
            <div class="info-item">
              <label>表单ID：</label>
              <span>{{ formId }}</span>
            </div>
            <div class="info-item">
              <label>提交状态：</label>
              <el-tag 
                :type="getStatusType(dataDetail.status)"
                size="small"
              >
                {{ getStatusText(dataDetail.status) }}
              </el-tag>
            </div>
          </div>
          
          <!-- 时间信息 -->
          <div class="info-section">
            <h4>时间信息</h4>
            <div class="info-item">
              <label>提交时间：</label>
              <span>{{ formatDateTime(dataDetail.created_at) }}</span>
            </div>
            <div class="info-item" v-if="dataDetail.updated_at !== dataDetail.created_at">
              <label>更新时间：</label>
              <span>{{ formatDateTime(dataDetail.updated_at) }}</span>
            </div>
            <div class="info-item">
              <label>提交耗时：</label>
              <span>{{ dataDetail.duration || '-' }}秒</span>
            </div>
          </div>
          
          <!-- 提交信息 -->
          <div class="info-section" v-if="dataDetail.ip || dataDetail.user_agent">
            <h4>提交信息</h4>
            <div class="info-item" v-if="dataDetail.ip">
              <label>IP地址：</label>
              <span>{{ dataDetail.ip }}</span>
            </div>
            <div class="info-item" v-if="dataDetail.location">
              <label>地理位置：</label>
              <span>{{ dataDetail.location }}</span>
            </div>
            <div class="info-item" v-if="dataDetail.user_agent">
              <label>用户代理：</label>
              <span class="user-agent">{{ dataDetail.user_agent }}</span>
            </div>
            <div class="info-item" v-if="dataDetail.device">
              <label>设备信息：</label>
              <span>{{ dataDetail.device }}</span>
            </div>
          </div>
          
          <!-- 操作历史 -->
          <div class="info-section" v-if="operationHistory.length > 0">
            <h4>操作历史</h4>
            <div class="history-list">
              <div 
                v-for="history in operationHistory" 
                :key="history.id"
                class="history-item"
              >
                <div class="history-icon">
                  <i :class="getHistoryIcon(history.action)"></i>
                </div>
                <div class="history-content">
                  <div class="history-action">{{ history.action_text }}</div>
                  <div class="history-time">{{ formatDateTime(history.created_at) }}</div>
                  <div class="history-user" v-if="history.user_name">
                    操作人：{{ history.user_name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧表单数据 -->
      <div class="form-data-panel glass-card">
        <div class="panel-header">
          <h3>
            <i class="mdi mdi-form-select"></i>
            表单数据
          </h3>
          <el-button size="small" @click="toggleViewMode">
            <i :class="viewMode === 'form' ? 'mdi mdi-code-json' : 'mdi mdi-form-select'"></i>
            {{ viewMode === 'form' ? 'JSON视图' : '表单视图' }}
          </el-button>
        </div>
        
        <div class="panel-content">
          <!-- 表单视图 -->
          <div v-if="viewMode === 'form'" class="form-view">
            <div 
              v-for="field in formFields" 
              :key="field.key"
              class="field-item"
            >
              <div class="field-label">
                <label>{{ field.label }}</label>
                <span class="field-type">{{ getFieldTypeText(field.type) }}</span>
              </div>
              <div class="field-value">
                <!-- 文本类型 -->
                <div v-if="['text', 'email', 'phone'].includes(field.type)" class="text-field">
                  <span v-if="dataDetail[field.key]">{{ dataDetail[field.key] }}</span>
                  <span v-else class="empty-value">未填写</span>
                </div>
                
                <!-- 文本域类型 -->
                <div v-else-if="field.type === 'textarea'" class="textarea-field">
                  <pre v-if="dataDetail[field.key]">{{ dataDetail[field.key] }}</pre>
                  <span v-else class="empty-value">未填写</span>
                </div>
                
                <!-- 选择器类型 -->
                <div v-else-if="field.type === 'select'" class="select-field">
                  <el-tag v-if="dataDetail[field.key]" type="primary">
                    {{ dataDetail[field.key] }}
                  </el-tag>
                  <span v-else class="empty-value">未选择</span>
                </div>
                
                <!-- 单选框类型 -->
                <div v-else-if="field.type === 'radio'" class="radio-field">
                  <el-tag v-if="dataDetail[field.key]" type="success">
                    {{ dataDetail[field.key] }}
                  </el-tag>
                  <span v-else class="empty-value">未选择</span>
                </div>
                
                <!-- 复选框类型 -->
                <div v-else-if="field.type === 'checkbox'" class="checkbox-field">
                  <div v-if="dataDetail[field.key] && dataDetail[field.key].length > 0" class="checkbox-values">
                    <el-tag
                      v-for="item in dataDetail[field.key]"
                      :key="item"
                      type="info"
                      class="checkbox-tag"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                  <span v-else class="empty-value">未选择</span>
                </div>
                
                <!-- 日期类型 -->
                <div v-else-if="field.type === 'date-picker'" class="date-field">
                  <span v-if="dataDetail[field.key]">
                    <i class="mdi mdi-calendar"></i>
                    {{ formatDate(dataDetail[field.key]) }}
                  </span>
                  <span v-else class="empty-value">未选择</span>
                </div>
                
                <!-- 评分类型 -->
                <div v-else-if="field.type === 'rate'" class="rate-field">
                  <el-rate
                    v-if="dataDetail[field.key] !== undefined"
                    :model-value="dataDetail[field.key]"
                    disabled
                    show-score
                  />
                  <span v-else class="empty-value">未评分</span>
                </div>
                
                <!-- 上传文件类型 -->
                <div v-else-if="field.type === 'upload'" class="upload-field">
                  <div v-if="dataDetail[field.key] && dataDetail[field.key].length > 0" class="file-list">
                    <div 
                      v-for="file in dataDetail[field.key]" 
                      :key="file.name"
                      class="file-item"
                    >
                      <i class="mdi mdi-file-document"></i>
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                      <el-button size="small" text @click="downloadFile(file)">
                        <i class="mdi mdi-download"></i>
                      </el-button>
                    </div>
                  </div>
                  <span v-else class="empty-value">未上传文件</span>
                </div>
                
                <!-- 默认类型 -->
                <div v-else class="default-field">
                  <span v-if="dataDetail[field.key]">{{ dataDetail[field.key] }}</span>
                  <span v-else class="empty-value">无数据</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- JSON视图 -->
          <div v-else class="json-view">
            <el-input
              :value="formattedJson"
              type="textarea"
              readonly
              :rows="20"
              class="json-textarea"
            />
            <div class="json-actions">
              <el-button @click="copyJson" size="small">
                <i class="mdi mdi-content-copy"></i>
                复制JSON
              </el-button>
              <el-button @click="downloadJson" size="small">
                <i class="mdi mdi-download"></i>
                下载JSON
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormsStore } from '../../store/forms'
import { storeToRefs } from 'pinia'
import BrandLogo from '../../components/BrandLogo.vue'
import FeatureAd from '../../components/FeatureAd.vue'

const router = useRouter()
const route = useRoute()
const formsStore = useFormsStore()
const { currentForm } = storeToRefs(formsStore)

// 页面状态
const formId = computed(() => route.params.formId as string)
const dataId = computed(() => route.params.dataId as string)
const loading = ref(false)
const viewMode = ref<'form' | 'json'>('form')

// 数据详情
const dataDetail = ref<any>(null)

// 操作历史
const operationHistory = ref([
  {
    id: 1,
    action: 'submit',
    action_text: '数据提交',
    created_at: '2024-01-15 10:30:00',
    user_name: '张三'
  },
  {
    id: 2,
    action: 'view',
    action_text: '查看数据',
    created_at: '2024-01-15 14:20:00',
    user_name: '管理员'
  }
])

// 表单字段配置
const formFields = computed(() => {
  if (currentForm.value?.configJson?.components) {
    return currentForm.value.configJson.components
      .filter((comp: any) => comp.props?.field)
      .map((comp: any) => ({
        key: comp.props.field,
        label: comp.props.label || comp.props.field,
        type: comp.type
      }))
  }
  
  // 默认字段
  return [
    { key: 'name', label: '姓名', type: 'text' },
    { key: 'email', label: '邮箱', type: 'email' },
    { key: 'phone', label: '电话', type: 'text' },
    { key: 'gender', label: '性别', type: 'radio' },
    { key: 'interests', label: '兴趣', type: 'checkbox' },
    { key: 'rating', label: '评分', type: 'rate' }
  ]
})

// 格式化JSON
const formattedJson = computed(() => {
  if (!dataDetail.value) return ''
  return JSON.stringify(dataDetail.value, null, 2)
})

// 页面初始化
onMounted(async () => {
  await loadFormData()
  await loadDataDetail()
})

// 加载表单数据
const loadFormData = async () => {
  try {
    await formsStore.fetchFormDetail(Number(formId.value))
    if (!currentForm.value) {
      ElMessage.error('表单不存在')
      router.push('/forms')
    }
  } catch (error) {
    console.error('Load form error:', error)
  }
}

// 加载数据详情
const loadDataDetail = async () => {
  try {
    loading.value = true
    
    // 模拟数据
    dataDetail.value = {
      id: Number(dataId.value),
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      gender: '男',
      interests: ['读书', '旅游'],
      rating: 4,
      status: 'normal',
      created_at: '2024-01-15 10:30:00',
      updated_at: '2024-01-15 10:30:00',
      duration: 120,
      ip: '192.168.1.100',
      location: '北京市',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      device: 'Desktop - Windows'
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error('Load data error:', error)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  loadDataDetail()
  ElMessage.success('数据已刷新')
}

// 导出数据
const exportData = () => {
  const jsonStr = JSON.stringify(dataDetail.value, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `data_${dataId.value}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

// 标记数据
const flagData = async () => {
  try {
    const isCurrentlyFlagged = dataDetail.value?.status === 'flagged'
    const action = isCurrentlyFlagged ? '取消标记' : '标记'
    
    await ElMessageBox.confirm(
      `确定要${action}这条数据吗？`,
      `${action}确认`,
      { type: 'warning' }
    )
    
    // 更新状态
    if (dataDetail.value) {
      dataDetail.value.status = isCurrentlyFlagged ? 'normal' : 'flagged'
    }
    
    ElMessage.success(`${action}成功`)
  } catch (error) {
    // 用户取消
  }
}

// 删除数据
const deleteData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条数据吗？删除后无法恢复！',
      '删除确认',
      { type: 'error' }
    )
    
    ElMessage.success('删除成功')
    goBack()
  } catch (error) {
    // 用户取消
  }
}

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'form' ? 'json' : 'form'
}

// 复制JSON
const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    ElMessage.success('JSON已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = formattedJson.value
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('JSON已复制到剪贴板')
  }
}

// 下载JSON
const downloadJson = () => {
  const blob = new Blob([formattedJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `form_data_${dataId.value}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('下载成功')
}

// 下载文件
const downloadFile = (file: any) => {
  ElMessage.info('文件下载功能待实现')
  console.log('下载文件:', file)
}

// 返回
const goBack = () => {
  router.go(-1)
}

// 工具函数
const getStatusType = (status?: string) => {
  const typeMap: Record<string, string> = {
    normal: 'success',
    flagged: 'warning',
    deleted: 'danger'
  }
  return typeMap[status || 'normal'] || 'info'
}

const getStatusText = (status?: string) => {
  const textMap: Record<string, string> = {
    normal: '正常',
    flagged: '已标记',
    deleted: '已删除'
  }
  return textMap[status || 'normal'] || status
}

const getFieldTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    text: '文本',
    email: '邮箱',
    phone: '电话',
    textarea: '文本域',
    select: '选择器',
    radio: '单选',
    checkbox: '多选',
    'date-picker': '日期',
    rate: '评分',
    upload: '文件上传'
  }
  return typeMap[type] || type
}

const getHistoryIcon = (action: string) => {
  const iconMap: Record<string, string> = {
    submit: 'mdi-send',
    view: 'mdi-eye',
    flag: 'mdi-flag',
    delete: 'mdi-delete',
    export: 'mdi-download'
  }
  return iconMap[action] || 'mdi-information'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped lang="scss">
.data-detail-container {
  background: #f5f6fa;
  min-height: 100vh;
  padding: 20px;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  margin-bottom: 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .back-button {
      color: #667eea !important;
      font-size: 14px;
      
      i {
        font-size: 16px;
        margin-right: 4px;
      }
    }
    
    .header-info {
      .page-title {
        margin: 0 0 4px 0;
        font-size: 24px;
        font-weight: 700;
        color: #2c3e50;
      }
      
      .data-info {
        margin: 0;
        font-size: 14px;
        color: #7f8c8d;
        display: flex;
        align-items: center;
        gap: 12px;
        
        .data-id {
          font-weight: 500;
          color: #2c3e50;
        }
        
        .submit-time {
          font-size: 12px;
          color: #95a5a6;
        }
      }
    }
  }

  .header-divider {
    width: 2px;
    height: 40px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 1px;
    opacity: 0.3;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.detail-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 20px;
  min-height: calc(100vh - 200px);
}

.data-info-panel {
  padding: 0;
  
  .panel-header {
    padding: 20px 24px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #667eea;
      }
    }
  }
  
  .panel-content {
    padding: 24px;
  }
  
  .info-section {
    margin-bottom: 32px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }
    
    .info-item {
      display: flex;
      margin-bottom: 12px;
      
      label {
        min-width: 80px;
        color: #7f8c8d;
        font-size: 13px;
      }
      
      span {
        flex: 1;
        color: #2c3e50;
        font-size: 13px;
        
        &.user-agent {
          font-family: monospace;
          font-size: 11px;
          color: #95a5a6;
          word-break: break-all;
        }
      }
    }
  }
  
  .history-list {
    .history-item {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
      
      .history-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(102, 126, 234, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        
        i {
          color: #667eea;
          font-size: 16px;
        }
      }
      
      .history-content {
        flex: 1;
        
        .history-action {
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .history-time {
          font-size: 12px;
          color: #95a5a6;
        }
        
        .history-user {
          font-size: 12px;
          color: #7f8c8d;
        }
      }
    }
  }
}

.form-data-panel {
  padding: 0;
  
  .panel-header {
    padding: 20px 24px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        color: #667eea;
      }
    }
  }
  
  .panel-content {
    padding: 24px;
  }
  
  .form-view {
    .field-item {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);
      
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      
      .field-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        
        label {
          font-size: 16px;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .field-type {
          font-size: 12px;
          color: #95a5a6;
          background: rgba(102, 126, 234, 0.1);
          padding: 2px 8px;
          border-radius: 12px;
        }
      }
      
      .field-value {
        .text-field, .default-field {
          font-size: 15px;
          color: #2c3e50;
          line-height: 1.5;
        }
        
        .textarea-field {
          pre {
            font-family: inherit;
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            background: rgba(102, 126, 234, 0.05);
            padding: 12px;
            border-radius: 8px;
            color: #2c3e50;
          }
        }
        
        .checkbox-field {
          .checkbox-values {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            
            .checkbox-tag {
              font-size: 13px;
            }
          }
        }
        
        .date-field {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #2c3e50;
          
          i {
            color: #667eea;
          }
        }
        
        .upload-field {
          .file-list {
            .file-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background: rgba(102, 126, 234, 0.05);
              border-radius: 8px;
              margin-bottom: 8px;
              
              i {
                color: #667eea;
                font-size: 16px;
              }
              
              .file-name {
                flex: 1;
                color: #2c3e50;
                font-size: 14px;
              }
              
              .file-size {
                color: #95a5a6;
                font-size: 12px;
              }
            }
          }
        }
        
        .empty-value {
          color: #95a5a6;
          font-style: italic;
        }
      }
    }
  }
  
  .json-view {
    .json-textarea {
      margin-bottom: 16px;
      
      :deep(.el-textarea__inner) {
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.5;
        background: #f8f9fa;
        border: 1px solid rgba(102, 126, 234, 0.2);
      }
    }
    
    .json-actions {
      display: flex;
      gap: 12px;
    }
  }
}
</style> 