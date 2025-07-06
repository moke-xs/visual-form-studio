<template>
  <div class="form-create-container">
    <!-- 顶部导航栏 -->
    <div class="create-header glass-card">
      <div class="header-left">
        <BrandLogo mini />
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
          <h1 class="page-title">创建表单</h1>
          <p class="page-subtitle">设置表单基本信息</p>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="create-content">
      <!-- 表单信息设置 -->
      <div class="form-info-container">
        <div class="form-info-card glass-card">
          <div class="card-header">
            <h2>
              <i class="mdi mdi-information-outline"></i>
              表单基本信息
            </h2>
            <p class="card-subtitle">请填写表单的基本信息，创建后将进入设计器进行表单设计</p>
          </div>
          
          <div class="card-content">
            <el-form 
              ref="formInfoRef" 
              :model="formInfo" 
              :rules="formRules" 
              label-width="100px"
              size="large"
            >
              <el-form-item label="表单名称" prop="name" required>
                <el-input 
                  v-model="formInfo.name" 
                  placeholder="请输入表单名称"
                  maxlength="100"
                  show-word-limit
                  class="glass-input"
                />
              </el-form-item>
              
              <el-form-item label="表单描述" prop="description">
                <el-input 
                  v-model="formInfo.description" 
                  type="textarea" 
                  placeholder="请输入表单描述（可选）"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                  class="glass-textarea"
                />
              </el-form-item>
              
              <el-form-item label="表单分类" prop="category">
                <el-select 
                  v-model="formInfo.category" 
                  placeholder="选择表单分类"
                  class="glass-select"
                  style="width: 100%"
                >
                  <el-option label="问卷调查" value="survey" />
                  <el-option label="信息收集" value="collection" />
                  <el-option label="活动报名" value="registration" />
                  <el-option label="意见反馈" value="feedback" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
              
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="formInfo.startDate"
                  type="datetime"
                  placeholder="选择开始时间（可选）"
                  style="width: 100%"
                  class="glass-date-picker"
                />
              </el-form-item>
              
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="formInfo.endDate"
                  type="datetime"
                  placeholder="选择结束时间（可选）"
                  style="width: 100%"
                  class="glass-date-picker"
                />
              </el-form-item>
              
              <el-form-item label="填写设置">
                <div class="form-settings">
                  <el-checkbox v-model="formInfo.settingsJson.allowAnonymous">
                    允许匿名填写
                  </el-checkbox>
                  <el-checkbox v-model="formInfo.settingsJson.allowMultiple">
                    允许重复提交
                  </el-checkbox>
                  <el-checkbox v-model="formInfo.settingsJson.showProgress">
                    显示填写进度
                  </el-checkbox>
                  <el-checkbox v-model="formInfo.settingsJson.autoSave">
                    自动保存草稿
                  </el-checkbox>
                </div>
              </el-form-item>
            </el-form>
          </div>
          
          <!-- 操作按钮 -->
          <div class="card-actions">
            <el-button size="large" @click="goBack">
              取消
            </el-button>
            <el-button 
              type="primary" 
              size="large"
              @click="createAndDesign" 
              :loading="creating"
              :disabled="!formInfo.name"
            >
              <i class="mdi mdi-plus-circle-outline"></i>
              创建并进入设计器
            </el-button>
          </div>
        </div>
        
        <!-- 右侧提示信息 -->
        <div class="info-sidebar">
          <!-- 创建流程指引 -->
          <div class="process-card glass-card">
            <div class="process-header">
              <i class="mdi mdi-route"></i>
              <h3>创建流程</h3>
            </div>
            <div class="process-steps">
              <div class="step-item active">
                <div class="step-number">1</div>
                <div class="step-content">
                  <div class="step-title">设置基本信息</div>
                  <div class="step-desc">表单名称、描述、分类</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-content">
                  <div class="step-title">设计表单结构</div>
                  <div class="step-desc">添加表单组件、设置字段</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-content">
                  <div class="step-title">预览和发布</div>
                  <div class="step-desc">测试表单、发布使用</div>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-card glass-card">
            <div class="preview-header">
              <div class="left">
                <i class="mdi mdi-eye-outline"></i>
                <h3>实时预览</h3>
              </div>
              <div class="preview-status">
                <span :class="previewStatus.class">{{ previewStatus.text }}</span>
              </div>
            </div>
            <div class="preview-content">
              <div class="form-preview">
                <div class="preview-form-header">
                  <div class="preview-title">{{ formInfo.name || '请输入表单名称' }}</div>
                  <div class="preview-description">{{ formInfo.description || '请输入表单描述' }}</div>
                  <div class="preview-meta">
                    <div class="meta-item" v-if="formInfo.category">
                      <i class="mdi mdi-tag-outline"></i>
                      <el-tag size="small" effect="plain">{{ getCategoryText(formInfo.category) }}</el-tag>
                    </div>
                    <div class="meta-item" v-if="formInfo.startDate">
                      <i class="mdi mdi-calendar-start"></i>
                      <span>{{ formatDate(formInfo.startDate) }}</span>
                    </div>
                    <div class="meta-item" v-if="formInfo.endDate">
                      <i class="mdi mdi-calendar-end"></i>
                      <span>{{ formatDate(formInfo.endDate) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="preview-form-body">
                  <div class="preview-placeholder">
                    <i class="mdi mdi-puzzle-outline"></i>
                    <p>创建后将在设计器中添加表单组件</p>
                  </div>
                </div>
                
                <div class="preview-form-footer">
                  <div class="preview-settings">
                    <div class="setting-item" v-if="formInfo.settingsJson?.allowAnonymous">
                      <i class="mdi mdi-account-question"></i>
                      <span>允许匿名填写</span>
                    </div>
                    <div class="setting-item" v-if="formInfo.settingsJson?.allowMultiple">
                      <i class="mdi mdi-repeat"></i>
                      <span>允许重复提交</span>
                    </div>
                    <div class="setting-item" v-if="formInfo.settingsJson?.showProgress">
                      <i class="mdi mdi-progress-check"></i>
                      <span>显示填写进度</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="tip-card glass-card">
            <div class="tip-header">
              <i class="mdi mdi-lightbulb-outline"></i>
              <h3>创建提示</h3>
            </div>
            <div class="tip-content">
              <div class="tip-item">
                <i class="mdi mdi-information-outline"></i>
                <span>表单名称将作为用户填写时的标题</span>
              </div>
              <div class="tip-item">
                <i class="mdi mdi-text-box-outline"></i>
                <span>详细的表单描述有助于提高填写率</span>
              </div>
              <div class="tip-item">
                <i class="mdi mdi-palette-outline"></i>
                <span>创建后将进入可视化设计器</span>
              </div>
              <div class="tip-item">
                <i class="mdi mdi-chart-line"></i>
                <span>可随时查看表单数据和统计</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { formsAPI } from '../../api/forms'
import type { FormCreateParams } from '../../types/forms'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()


// 响应式数据
const formInfoRef = ref()
const creating = ref(false)

// 表单信息
const formInfo = reactive<FormCreateParams>({
  name: '',
  description: '',
  category: '',
  startDate: undefined,
  endDate: undefined,
  settingsJson: {
    allowAnonymous: true,
    allowMultiple: false,
    showProgress: true,
    autoSave: true
  },
  configJson: { components: [] }
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入表单名称', trigger: 'blur' },
    { min: 1, max: 100, message: '表单名称长度在 1 到 100 个字符', trigger: 'blur' }
  ]
}

// 获取分类文本
const getCategoryText = (category?: string) => {
  const categoryMap: Record<string, string> = {
    survey: '问卷调查',
    collection: '信息收集',
    registration: '活动报名',
    feedback: '意见反馈',
    other: '其他'
  }
  return categoryMap[category || ''] || '未分类'
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 预览状态
const previewStatus = computed(() => {
  const hasName = formInfo.name && formInfo.name.trim()
  const hasDescription = formInfo.description && formInfo.description.trim()
  
  if (hasName && hasDescription) {
    return { class: 'status-complete', text: '信息完整' }
  } else if (hasName) {
    return { class: 'status-partial', text: '基本信息' }
  } else {
    return { class: 'status-empty', text: '待完善' }
  }
})

// 返回列表
const goBack = () => {
  router.push('/forms')
}

// 创建表单并进入设计器
const createAndDesign = async () => {
  try {
    // 验证表单
    await formInfoRef.value?.validate()
    
    creating.value = true
    
    // 准备发送的数据
    const formData = {
      name: formInfo.name,
      description: formInfo.description || '',
      category: formInfo.category || '',
      startDate: formInfo.startDate ? (typeof formInfo.startDate === 'object' ? formInfo.startDate.toISOString() : formInfo.startDate) : undefined,
      endDate: formInfo.endDate ? (typeof formInfo.endDate === 'object' ? formInfo.endDate.toISOString() : formInfo.endDate) : undefined,
      configJson: JSON.stringify(formInfo.configJson || { components: [] }),
      settingsJson: JSON.stringify(formInfo.settingsJson || {})
    }
    
    // 详细的调试信息
    console.log('📋 原始时间数据:', {
      startDate: formInfo.startDate,
      startDateType: typeof formInfo.startDate,
      endDate: formInfo.endDate,
      endDateType: typeof formInfo.endDate
    })
    console.log('📋 准备发送的表单数据:', formData)
    console.log('📋 JSON字符串:', JSON.stringify(formData, null, 2))
    console.log('📋 数据类型检查:', {
      name: typeof formData.name,
      description: typeof formData.description,
      category: typeof formData.category,
      startDate: typeof formData.startDate,
      endDate: typeof formData.endDate,
      configJson: typeof formData.configJson,
      settingsJson: typeof formData.settingsJson
    })
    
    // 创建表单
    console.log('🚀 即将调用API，发送数据:', formData)
    
    let response: any
    try {
      response = await formsAPI.createForm(formData)
      
      // 调试信息
      console.log('✅ 创建表单响应:', response)
      console.log('📋 响应数据结构:', response.data)
    } catch (apiError: any) {
      console.error('💥 API调用详细错误:', apiError)
      console.error('💥 错误状态:', apiError.response?.status)
      console.error('💥 错误数据:', apiError.response?.data)
      console.error('💥 请求配置:', apiError.config)
      throw apiError
    }
    
    // 提取表单ID（响应拦截器已处理过格式）
    const responseData = response.data as any
    const formId = responseData?.Id || responseData?.id || responseData
    
    console.log('🆔 响应拦截器处理后的数据:', responseData)
    console.log('🆔 提取的表单ID:', formId, '类型:', typeof formId)
    
    if (!formId || isNaN(Number(formId))) {
      throw new Error(`无效的表单ID: ${formId}`)
    }
    
    ElMessage.success('表单创建成功！')
    
    // 跳转到设计器页面
            console.log('🚀 即将跳转到:', `/designer/${formId}`)
        await router.push(`/designer/${formId}`)
    
  } catch (error: any) {
    console.error('❌ 创建表单失败:', error)
    if (error.name !== 'ValidationError') {
      ElMessage.error(error.message || '创建表单失败')
    }
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  // 页面初始化
})
</script>

<style scoped>
.form-create-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  margin-bottom: 30px;
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
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 1px;
  opacity: 0.3;
}

.back-button {
  color: #667eea;
  font-size: 16px;
  padding: 8px 16px;
}

.back-button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #718096;
  margin: 0;
}

.create-content {
  display: flex;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.form-info-container {
  display: flex;
  gap: 30px;
  width: 100%;
}

.form-info-card {
  flex: 2;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  margin-bottom: 30px;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header h2 i {
  color: #667eea;
}

.card-subtitle {
  color: #718096;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.card-content {
  margin-bottom: 40px;
}

.form-settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-settings .el-checkbox {
  margin: 0;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding-top: 30px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.info-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 流程步骤样式 */
.process-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.process-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.process-header i {
  font-size: 20px;
  color: #667eea;
}

.process-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.process-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.step-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-item:not(.active) .step-number {
  background: #e2e8f0;
  color: #718096;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 12px;
  color: #718096;
  line-height: 1.4;
}

.tip-card, .preview-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tip-header, .preview-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.preview-header {
  justify-content: space-between;
}

.preview-status {
  display: flex;
  align-items: center;
}

.preview-status span {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-complete {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.status-partial {
  background-color: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.status-empty {
  background-color: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}

.tip-header h3, .preview-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.tip-header i, .preview-header i {
  color: #667eea;
  font-size: 20px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #4a5568;
}

.tip-item i {
  color: #48bb78;
  font-size: 16px;
}

.form-preview {
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.05);
  overflow: hidden;
}

.preview-form-header {
  padding: 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.preview-description {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
  line-height: 1.5;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.meta-item i {
  font-size: 14px;
  color: #667eea;
}

.preview-form-body {
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: #94a3b8;
}

.preview-placeholder i {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.preview-placeholder p {
  font-size: 12px;
  margin: 0;
}

.preview-form-footer {
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.02);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.preview-settings {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #64748b;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
}

.setting-item i {
  font-size: 12px;
  color: #667eea;
}

/* Glass Morphism 样式 */
.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}

.glass-textarea :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}

.glass-select :deep(.el-select__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}

.glass-date-picker :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-info-container {
    flex-direction: column;
  }
  
  .info-sidebar {
    flex-direction: row;
  }
}

@media (max-width: 768px) {
  .create-content {
    padding: 0 10px;
  }
  
  .form-info-card {
    padding: 25px;
  }
  
  .info-sidebar {
    flex-direction: column;
  }
  
  .form-settings {
    grid-template-columns: 1fr;
  }
}
</style> 