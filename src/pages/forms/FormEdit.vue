<template>
  <div class="form-edit-container">
    <!-- 页面头部 -->
    <div class="page-header glass-card">
      <div class="header-left">
        <BrandLogo :show-tagline="false" />
        <div class="header-divider"></div>
        <div class="page-info">
          <h1 class="page-title">编辑表单</h1>
          <p class="page-description">修改表单基本信息和设置</p>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="goBack">
          <i class="mdi mdi-arrow-left"></i>
          返回列表
        </el-button>
        <el-button 
          type="primary" 
          @click="goToDesigner"
          v-if="formData.id"
        >
          <i class="mdi mdi-palette"></i>
          设计表单
        </el-button>
      </div>
    </div>

    <!-- 编辑表单 -->
    <div class="edit-content">
      <div class="edit-card glass-card">
        <div class="card-header">
          <h2>
            <i class="mdi mdi-form-select"></i>
            表单信息
          </h2>
        </div>
        
        <el-form 
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="120px"
          class="edit-form"
          v-loading="loading"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="表单名称" prop="name">
                <el-input 
                  v-model="formData.name"
                  placeholder="请输入表单名称"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="表单分类" prop="category">
                <el-select 
                  v-model="formData.category"
                  placeholder="请选择表单分类"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="问卷调查" value="survey"></el-option>
                  <el-option label="信息收集" value="collection"></el-option>
                  <el-option label="反馈表单" value="feedback"></el-option>
                  <el-option label="报名表单" value="registration"></el-option>
                  <el-option label="其他" value="other"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="表单描述" prop="description">
            <el-input 
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入表单描述（可选）"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="formData.startDate"
                  type="datetime"
                  placeholder="选择开始时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="formData.endDate"
                  type="datetime"
                  placeholder="选择结束时间"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="表单状态">
            <el-radio-group v-model="formData.status" class="status-group">
              <el-radio value="draft" class="status-radio">
                <span class="status-indicator draft"></span>
                草稿
              </el-radio>
              <el-radio value="published" class="status-radio">
                <span class="status-indicator published"></span>
                已发布
              </el-radio>
              <el-radio value="archived" class="status-radio">
                <span class="status-indicator archived"></span>
                已归档
              </el-radio>
              <el-radio value="disabled" class="status-radio">
                <span class="status-indicator disabled"></span>
                已禁用
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="自定义CSS">
            <el-input 
              v-model="formData.customCss"
              type="textarea"
              :rows="6"
              placeholder="请输入自定义CSS样式（可选）"
            />
          </el-form-item>
        </el-form>

        <div class="form-actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="saveForm" :loading="saving">
            <i class="mdi mdi-content-save"></i>
            保存修改
          </el-button>
        </div>
      </div>

      <!-- 表单统计信息 -->
      <div class="stats-card glass-card" v-if="formData.id">
        <div class="card-header">
          <h2>
            <i class="mdi mdi-chart-line"></i>
            表单统计
          </h2>
        </div>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ formData.viewCount || 0 }}</div>
            <div class="stat-label">总浏览量</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formData.submitCount || 0 }}</div>
            <div class="stat-label">总提交数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ conversionRate }}%</div>
            <div class="stat-label">转化率</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ formatDate(formData.createdAt) }}</div>
            <div class="stat-label">创建时间</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormRules } from 'element-plus'
import { formsAPI } from '../../api/forms'
import type { FormItem, FormCreateParams } from '../../types/forms'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const route = useRoute()

// 页面状态
const formRef = ref()
const loading = ref(false)
const saving = ref(false)

// 表单数据
const formData = reactive<Partial<FormItem & FormCreateParams>>({
  name: '',
  description: '',
  category: '',
  status: 'draft',
  startDate: '',
  endDate: '',
  customCss: '',
  viewCount: 0,
  submitCount: 0,
  configJson: '',
  settingsJson: '{}',
  formKey: '',
  fields: []
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入表单名称', trigger: 'blur' },
    { min: 2, max: 50, message: '表单名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择表单分类', trigger: 'change' }
  ]
}

// 计算属性
const formId = computed(() => {
  const id = route.params.id as string
  return id && !isNaN(Number(id)) ? Number(id) : null
})

const conversionRate = computed(() => {
  if (!formData.viewCount || formData.viewCount === 0) return 0
  return Math.round((formData.submitCount || 0) / formData.viewCount * 100)
})

// 页面初始化
onMounted(async () => {
  console.log('FormEdit页面初始化，formId:', formId.value)
  if (formId.value) {
    await loadFormData()
  } else {
    ElMessage.error('无效的表单ID')
    router.push('/forms')
  }
})

// 加载表单数据
const loadFormData = async () => {
  try {
    loading.value = true
    console.log('开始加载表单数据，ID:', formId.value)
    
    const response = await formsAPI.getFormDetail(formId.value!)
    console.log('API响应数据:', response)
    
    // 根据响应拦截器的处理，response.data 已经是标准化后的数据
    const data = response.data || response
    console.log('处理后的数据:', data)
    
    // 填充表单数据 - 字段名已经标准化为小写
    Object.assign(formData, {
      id: data.id,
      name: data.name || '',
      description: data.description || '',
      category: data.category || '',
      status: convertStatusToString(data.status || 0),
      startDate: data.startDate ? formatDateForComponent(data.startDate) : '',
      endDate: data.endDate ? formatDateForComponent(data.endDate) : '',
      customCss: data.customCss || '',
      viewCount: data.viewCount || 0,
      submitCount: data.submitCount || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      configJson: data.configJson || '{}',
      settingsJson: data.settingsJson || '{}',
      formKey: data.formKey || '',
      fields: data.fields || []
    })
    
    console.log('填充后的表单数据:', formData)
    console.log('表单配置数据:', formData.configJson)
    
    // 检查配置数据
    if (formData.configJson) {
      console.log('配置数据类型:', typeof formData.configJson)
      console.log('配置数据组件数量:', formData.configJson.components?.length || 0)
    } else {
      console.warn('表单配置数据为空或未定义')
    }
  } catch (error) {
    console.error('加载表单数据详细错误:', error)
    ElMessage.error('加载表单数据失败')
  } finally {
    loading.value = false
  }
}

// 保存表单
const saveForm = async () => {
  try {
    await formRef.value.validate()
    
    saving.value = true
    
    // 构建完整的实体对象，保持所有字段
    const updateData = {
      id: formData.id,
      name: formData.name!,
      description: formData.description || '',
      configJson: formData.configJson || '{}',
      settingsJson: formData.settingsJson || '{}',
      category: formData.category || '',
      status: convertStatusToNumber(formData.status || 'draft'),
      startDate: formData.startDate ? formatDateForBackend(formData.startDate) : undefined,
      endDate: formData.endDate ? formatDateForBackend(formData.endDate) : undefined,
      formKey: formData.formKey || '',
      customCss: formData.customCss || '',
      viewCount: formData.viewCount || 0,
      submitCount: formData.submitCount || 0,
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      fields: formData.fields || []
    }
    
    console.log('提交的完整实体数据:', updateData)
    
    // 使用any类型避免类型检查问题，因为我们提交的是完整实体
    await formsAPI.updateForm(formId.value!, updateData as any)
    ElMessage.success('表单信息保存成功')
    
    // 重新加载数据
    await loadFormData()
  } catch (error: any) {
    if (error !== 'validation failed') {
      ElMessage.error('保存失败，请重试')
      console.error('Save form error:', error)
    }
  } finally {
    saving.value = false
  }
}

// 重置表单
const resetForm = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置表单吗？这将恢复到上次保存的状态。',
      '重置确认',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    await loadFormData()
    ElMessage.success('表单已重置')
  } catch (error) {
    // 用户取消
  }
}

// 返回列表
const goBack = () => {
  router.push('/forms')
}

// 前往设计器
const goToDesigner = () => {
          router.push(`/designer/${formId.value}`)
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '---'
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 将后端ISO格式转换为组件格式
const formatDateForComponent = (isoDate: string) => {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

// 将组件格式转换为后端ISO格式
const formatDateForBackend = (componentDate: string) => {
  if (!componentDate) return undefined
  const date = new Date(componentDate)
  return date.toISOString()
}

// 状态转换函数
const convertStatusToNumber = (status: string | number) => {
  if (typeof status === 'number') return status
  
  const statusMap: Record<string, number> = {
    'draft': 0,
    'published': 1,
    'archived': 2,
    'disabled': 3
  }
  
  return statusMap[status] || 0
}

const convertStatusToString = (status: number | string) => {
  if (typeof status === 'string') return status
  
  const statusMap: Record<number, string> = {
    0: 'draft',
    1: 'published',
    2: 'archived',
    3: 'disabled'
  }
  
  return statusMap[status] || 'draft'
}
</script>

<style scoped lang="scss">
.form-edit-container {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  margin-bottom: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-divider {
  width: 2px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 1px;
  opacity: 0.3;
}

.page-info {
  .page-title {
    margin: 0 0 8px 0;
    color: #2c3e50;
    font-size: 28px;
    font-weight: 700;
  }
  
  .page-description {
    margin: 0;
    color: #7f8c8d;
    font-size: 16px;
  }
}

.header-right {
  display: flex;
  gap: 12px;
}

.edit-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.edit-card, .stats-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 22px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    
    i {
      color: #667eea;
    }
  }
}

.edit-form {
  .el-form-item {
    margin-bottom: 24px;
  }
}

.status-group {
  display: flex;
  gap: 24px;
}

.status-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    
    &.draft { background: #e6a23c; }
    &.published { background: #67c23a; }
    &.archived { background: #909399; }
    &.disabled { background: #f56c6c; }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  
  .stat-number {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
    margin-bottom: 8px;
  }
  
  .stat-label {
    font-size: 14px;
    color: #718096;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .edit-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .form-edit-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 