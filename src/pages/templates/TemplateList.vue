<template>
  <div class="template-list-container">
    <!-- 顶部导航栏 -->
    <div class="template-header glass-card">
      <div class="header-left">
        <BrandLogo mode="mini" />
        <div class="header-divider"></div>
        <div class="header-info">
          <h1 class="page-title">表单模板市场</h1>
          <p class="page-subtitle">精选模板，快速搭建专业表单</p>
        </div>
      </div>
      
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索模板..."
          class="search-input glass-input"
          clearable
        >
          <template #prefix>
            <i class="mdi mdi-magnify"></i>
          </template>
        </el-input>
        <el-button type="primary" @click="createTemplate">
          <i class="mdi mdi-plus"></i>
          创建模板
        </el-button>
      </div>
    </div>

    <!-- 分类筛选 -->
    <div class="category-filter glass-card">
      <div class="filter-header">
        <h3>
          <i class="mdi mdi-filter-variant"></i>
          模板分类
        </h3>
        <span class="template-count">共 {{ filteredTemplates.length }} 个模板</span>
      </div>
      <div class="category-tabs">
        <div 
          v-for="category in categories" 
          :key="category.key"
          class="category-tab"
          :class="{ active: activeCategory === category.key }"
          @click="setActiveCategory(category.key)"
        >
          <i :class="category.icon"></i>
          <span>{{ category.label }}</span>
          <div class="category-count">{{ category.count }}</div>
        </div>
      </div>
    </div>

    <!-- 模板列表 -->
    <div class="templates-section">
      <div class="templates-grid">
        <div 
          v-for="template in filteredTemplates" 
          :key="template.id"
          class="template-card glass-card"
          @click="previewTemplate(template)"
        >
          <div class="template-preview">
            <div class="preview-image">
              <i :class="template.icon"></i>
            </div>
            <div class="template-badges">
              <el-tag 
                v-if="template.featured" 
                type="danger" 
                size="small"
                effect="dark"
              >
                精选
              </el-tag>
              <el-tag 
                v-if="template.new" 
                type="success" 
                size="small"
                effect="dark"
              >
                新模板
              </el-tag>
            </div>
          </div>
          
          <div class="template-content">
            <div class="template-header">
              <h4 class="template-title">{{ template.name }}</h4>
              <div class="template-rating">
                <el-rate 
                  v-model="template.rating" 
                  disabled 
                  size="small"
                  show-score
                  text-color="#ffd04b"
                />
              </div>
            </div>
            
            <p class="template-description">{{ template.description }}</p>
            
            <div class="template-meta">
              <div class="meta-item">
                <i class="mdi mdi-tag"></i>
                <span>{{ getCategoryLabel(template.category) }}</span>
              </div>
              <div class="meta-item">
                <i class="mdi mdi-download"></i>
                <span>{{ template.downloads }} 次使用</span>
              </div>
            </div>
            
            <div class="template-actions">
              <el-button 
                text 
                @click.stop="previewTemplate(template)"
              >
                <i class="mdi mdi-eye"></i>
                预览
              </el-button>
              <el-button 
                type="primary" 
                @click.stop="useTemplate(template)"
              >
                <i class="mdi mdi-plus"></i>
                使用模板
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="filteredTemplates.length === 0" class="empty-state">
        <i class="mdi mdi-file-document-outline"></i>
        <h3>暂无模板</h3>
        <p>该分类下暂时没有模板，请尝试其他分类或创建新模板</p>
        <el-button type="primary" @click="createTemplate">
          <i class="mdi mdi-plus"></i>
          创建模板
        </el-button>
      </div>
    </div>

    <!-- 模板预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="selectedTemplate?.name"
      width="800px"
      class="template-preview-dialog"
    >
      <div v-if="selectedTemplate" class="preview-content">
        <div class="preview-info">
          <div class="info-grid">
            <div class="info-item">
              <label>模板名称：</label>
              <span>{{ selectedTemplate.name }}</span>
            </div>
            <div class="info-item">
              <label>分类：</label>
              <span>{{ getCategoryLabel(selectedTemplate.category) }}</span>
            </div>
            <div class="info-item">
              <label>评分：</label>
              <el-rate 
                v-model="selectedTemplate.rating" 
                disabled 
                size="small"
                show-score
              />
            </div>
            <div class="info-item">
              <label>使用次数：</label>
              <span>{{ selectedTemplate.downloads }}</span>
            </div>
          </div>
          <div class="template-desc-full">
            <h4>模板描述</h4>
            <p>{{ selectedTemplate.description }}</p>
          </div>
          <div class="template-features">
            <h4>包含组件</h4>
            <div class="feature-tags">
              <el-tag 
                v-for="component in selectedTemplate.components" 
                :key="component"
                size="small"
              >
                {{ component }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="preview-form">
          <h4>表单预览</h4>
          <div class="form-preview-area">
            <div class="form-title">{{ selectedTemplate.name }}</div>
            <div class="form-description">{{ selectedTemplate.description }}</div>
            <div class="form-components">
              <div 
                v-for="component in selectedTemplate.components" 
                :key="component"
                class="component-item"
              >
                <i class="mdi mdi-drag"></i>
                <span>{{ component }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="useSelectedTemplate">
            <i class="mdi mdi-plus"></i>
            使用此模板
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BrandLogo from '../../components/BrandLogo.vue'
const router = useRouter()

// 页面状态
const searchQuery = ref('')
const activeCategory = ref('all')
const previewDialogVisible = ref(false)
const selectedTemplate = ref<any>(null)

// 分类配置
const categories = ref([
  { key: 'all', label: '全部', icon: 'mdi mdi-view-grid', count: 24 },
  { key: 'survey', label: '问卷调查', icon: 'mdi mdi-poll', count: 8 },
  { key: 'registration', label: '活动报名', icon: 'mdi mdi-calendar-account', count: 6 },
  { key: 'feedback', label: '意见反馈', icon: 'mdi mdi-comment-text', count: 5 },
  { key: 'contact', label: '联系表单', icon: 'mdi mdi-email', count: 3 },
  { key: 'application', label: '申请表单', icon: 'mdi mdi-file-document', count: 2 }
])

// 模板数据
const templates = ref([
  {
    id: 1,
    name: '用户满意度调查',
    description: '全面了解用户对产品/服务的满意度，包含多维度评价指标',
    category: 'survey',
    rating: 4.8,
    downloads: 1247,
    featured: true,
    new: false,
    icon: 'mdi mdi-poll-box',
    components: ['单选题', '多选题', '评分组件', '文本框', '提交按钮']
  },
  {
    id: 2,
    name: '活动报名表',
    description: '适用于各类活动报名，支持个人信息收集和活动选择',
    category: 'registration',
    rating: 4.6,
    downloads: 892,
    featured: true,
    new: true,
    icon: 'mdi mdi-calendar-account',
    components: ['文本输入', '下拉选择', '日期选择', '文件上传', '确认框']
  },
  {
    id: 3,
    name: '产品反馈表',
    description: '收集用户对产品的意见和建议，帮助产品优化改进',
    category: 'feedback',
    rating: 4.7,
    downloads: 654,
    featured: false,
    new: true,
    icon: 'mdi mdi-comment-text',
    components: ['文本域', '评分组件', '单选题', '多选题', '文件上传']
  },
  {
    id: 4,
    name: '联系我们表单',
    description: '标准的联系表单，适用于企业官网和客户咨询',
    category: 'contact',
    rating: 4.5,
    downloads: 523,
    featured: false,
    new: false,
    icon: 'mdi mdi-email',
    components: ['姓名输入', '邮箱输入', '电话输入', '消息文本域', '提交按钮']
  },
  {
    id: 5,
    name: '求职申请表',
    description: '完整的求职申请表单，包含个人信息和简历上传',
    category: 'application',
    rating: 4.4,
    downloads: 387,
    featured: false,
    new: false,
    icon: 'mdi mdi-account-tie',
    components: ['个人信息', '教育经历', '工作经验', '文件上传', '自我介绍']
  },
  {
    id: 6,
    name: '客户信息登记',
    description: '客户基本信息收集表单，适用于CRM系统录入',
    category: 'registration',
    rating: 4.3,
    downloads: 298,
    featured: false,
    new: false,
    icon: 'mdi mdi-account-plus',
    components: ['基本信息', '联系方式', '公司信息', '备注说明', '提交确认']
  }
])

// 筛选后的模板
const filteredTemplates = computed(() => {
  let filtered = templates.value

  // 分类筛选
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(template => template.category === activeCategory.value)
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(template => 
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query)
    )
  }

  return filtered
})

// 设置活跃分类
const setActiveCategory = (category: string) => {
  activeCategory.value = category
}

// 获取分类标签
const getCategoryLabel = (categoryKey: string) => {
  const category = categories.value.find(cat => cat.key === categoryKey)
  return category ? category.label : categoryKey
}

// 预览模板
const previewTemplate = (template: any) => {
  selectedTemplate.value = template
  previewDialogVisible.value = true
}

// 使用模板
const useTemplate = (template: any) => {
  ElMessage.success(`正在使用模板"${template.name}"创建表单...`)
  // 跳转到创建页面，并传递模板ID
  router.push(`/forms/create?template=${template.id}`)
}

// 使用选中的模板
const useSelectedTemplate = () => {
  if (selectedTemplate.value) {
    useTemplate(selectedTemplate.value)
    previewDialogVisible.value = false
  }
}

// 创建模板
const createTemplate = () => {
  ElMessage.info('模板创建功能开发中...')
}

onMounted(() => {
  // 页面初始化
})
</script>

<style scoped>
.template-list-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  margin-bottom: 20px;
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

.header-info {
  .page-title {
    font-size: 28px;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 5px 0;
  }
  
  .page-subtitle {
    font-size: 14px;
    color: #718096;
    margin: 0;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 280px;
}

.category-filter {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-header h3 i {
  color: #667eea;
}

.template-count {
  font-size: 14px;
  color: #718096;
}

.category-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-tab:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: transparent;
  color: white;
}

.category-tab i {
  font-size: 16px;
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
}

.category-tab.active .category-count {
  background: rgba(255, 255, 255, 0.3);
}

.templates-section {
  margin-bottom: 30px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.template-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(31, 38, 135, 0.3);
}

.template-preview {
  position: relative;
  height: 160px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image i {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.9);
}

.template-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
}

.template-content {
  padding: 20px;
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.template-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  flex: 1;
}

.template-rating {
  margin-left: 12px;
}

.template-description {
  font-size: 14px;
  color: #718096;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.template-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
}

.meta-item i {
  font-size: 14px;
}

.template-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  display: block;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #64748b;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

/* 预览对话框样式 */
.template-preview-dialog .preview-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.info-item span {
  font-size: 14px;
  color: #2d3748;
}

.template-desc-full,
.template-features {
  margin-bottom: 20px;
}

.template-desc-full h4,
.template-features h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.template-desc-full p {
  margin: 0;
  font-size: 13px;
  color: #718096;
  line-height: 1.5;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-form h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.form-preview-area {
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.form-description {
  font-size: 13px;
  color: #718096;
  margin-bottom: 16px;
}

.form-components {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  font-size: 13px;
  color: #4a5568;
}

.component-item i {
  color: #94a3b8;
}

/* Glass Morphism 样式 */
.glass-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  
  .template-preview-dialog .preview-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .template-list-container {
    padding: 10px;
  }
  
  .template-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input {
    width: 200px;
  }
  
  .category-tabs {
    justify-content: center;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style> 