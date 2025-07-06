<template>
  <div class="dashboard-container">
    <!-- 顶部导航栏 -->
    <div class="dashboard-header glass-card">
      <div class="header-left">
        <BrandLogo mode="mini" />
        <div class="header-divider"></div>
        <div class="header-info">
          <h1 class="page-title">数据分析仪表板</h1>
          <p class="page-subtitle">全面了解您的表单数据和使用情况</p>
        </div>
      </div>
      
      <div class="header-actions">
        <el-button @click="refreshData" :loading="loading">
          <i class="mdi mdi-refresh"></i>
          刷新数据
        </el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
          class="date-picker glass-date-picker"
        />
        <el-button type="primary" @click="exportReport">
          <i class="mdi mdi-download"></i>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 新功能广告 -->
    <FeatureAd page-type="dashboard" />

    <!-- 核心数据统计 -->
    <div class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card glass-card" v-for="stat in coreStats" :key="stat.key">
          <div class="stat-icon" :style="{ background: stat.gradient }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change" :class="stat.changeClass">
              <i :class="stat.changeIcon"></i>
              <span>{{ stat.change }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表分析区域 -->
    <div class="charts-section">
      <div class="charts-grid">
        <!-- 表单提交趋势 -->
        <div class="chart-card glass-card">
          <div class="chart-header">
            <h3>
              <i class="mdi mdi-chart-line"></i>
              表单提交趋势
            </h3>
            <div class="chart-controls">
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button value="7d">7天</el-radio-button>
                <el-radio-button value="30d">30天</el-radio-button>
                <el-radio-button value="90d">90天</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div class="chart-content">
            <div class="trend-chart">
              <div class="chart-placeholder">
                <i class="mdi mdi-chart-line-variant"></i>
                <p>提交趋势图表</p>
                <div class="mock-chart-data">
                  <div class="chart-bar" v-for="i in 7" :key="i" :style="{ height: Math.random() * 100 + 20 + 'px' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 表单分类统计 -->
        <div class="chart-card glass-card">
          <div class="chart-header">
            <h3>
              <i class="mdi mdi-chart-donut"></i>
              表单分类分布
            </h3>
          </div>
          <div class="chart-content">
            <div class="category-stats">
              <div class="category-item" v-for="category in categoryStats" :key="category.name">
                <div class="category-color" :style="{ background: category.color }"></div>
                <div class="category-info">
                  <div class="category-name">{{ category.name }}</div>
                  <div class="category-count">{{ category.count }} 个表单</div>
                </div>
                <div class="category-percentage">{{ category.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近活动 -->
        <div class="chart-card glass-card">
          <div class="chart-header">
            <h3>
              <i class="mdi mdi-history"></i>
              最近活动
            </h3>
            <el-button text @click="viewAllActivities">
              查看全部
            </el-button>
          </div>
          <div class="chart-content">
            <div class="activity-list">
              <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
                <div class="activity-icon" :class="activity.type">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-content">
                  <div class="activity-text">{{ activity.text }}</div>
                  <div class="activity-time">{{ formatTime(activity.time) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门表单 -->
        <div class="chart-card glass-card">
          <div class="chart-header">
            <h3>
              <i class="mdi mdi-fire"></i>
              热门表单
            </h3>
            <el-button text @click="viewAllForms">
              查看全部
            </el-button>
          </div>
          <div class="chart-content">
            <div class="popular-forms">
              <div class="form-item" v-for="form in popularForms" :key="form.id">
                <div class="form-info">
                  <div class="form-name">{{ form.name }}</div>
                  <div class="form-meta">
                    <span class="form-category">{{ form.category }}</span>
                    <span class="form-submissions">{{ form.submissions }} 次提交</span>
                  </div>
                </div>
                <div class="form-actions">
                  <el-button text @click="viewForm(form.id)">
                    <i class="mdi mdi-eye"></i>
                  </el-button>
                  <el-button text @click="editForm(form.id)">
                    <i class="mdi mdi-pencil"></i>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div class="quick-actions glass-card">
      <div class="actions-header">
        <h3>
          <i class="mdi mdi-lightning-bolt"></i>
          快速操作
        </h3>
      </div>
      <div class="actions-grid">
        <div class="action-item" @click="createForm">
          <div class="action-icon">
            <i class="mdi mdi-plus-circle"></i>
          </div>
          <div class="action-text">创建表单</div>
        </div>
        <div class="action-item" @click="viewTemplates">
          <div class="action-icon">
            <i class="mdi mdi-file-document-multiple"></i>
          </div>
          <div class="action-text">浏览模板</div>
        </div>
        <div class="action-item" @click="viewAnalytics">
          <div class="action-icon">
            <i class="mdi mdi-chart-box"></i>
          </div>
          <div class="action-text">数据分析</div>
        </div>
        <div class="action-item" @click="manageUsers">
          <div class="action-icon">
            <i class="mdi mdi-account-group"></i>
          </div>
          <div class="action-text">用户管理</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BrandLogo from '../../components/BrandLogo.vue'
import FeatureAd from '../../components/FeatureAd.vue'

const router = useRouter()

// 页面状态
const loading = ref(false)
const dateRange = ref<[Date, Date] | null>(null)
const trendPeriod = ref('7d')

// 核心统计数据
const coreStats = ref([
  {
    key: 'total_forms',
    label: '总表单数',
    value: '156',
    change: '+12%',
    changeClass: 'positive',
    changeIcon: 'mdi mdi-trending-up',
    icon: 'mdi mdi-file-document',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
  },
  {
    key: 'total_submissions',
    label: '总提交数',
    value: '12,847',
    change: '+8%',
    changeClass: 'positive',
    changeIcon: 'mdi mdi-trending-up',
    icon: 'mdi mdi-send',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
  },
  {
    key: 'active_users',
    label: '活跃用户',
    value: '2,439',
    change: '+5%',
    changeClass: 'positive',
    changeIcon: 'mdi mdi-trending-up',
    icon: 'mdi mdi-account-group',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)'
  },
  {
    key: 'response_rate',
    label: '响应率',
    value: '89.2%',
    change: '-2%',
    changeClass: 'negative',
    changeIcon: 'mdi mdi-trending-down',
    icon: 'mdi mdi-chart-line',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)'
  }
])

// 表单分类统计
const categoryStats = ref([
  { name: '问卷调查', count: 45, percentage: 28.8, color: '#667eea' },
  { name: '活动报名', count: 38, percentage: 24.4, color: '#f093fb' },
  { name: '成绩查询', count: 38, percentage: 22.4, color: '#f093fb' },
  { name: '信息收集', count: 32, percentage: 20.5, color: '#4facfe' },
  { name: '意见反馈', count: 26, percentage: 16.7, color: '#43e97b' },
  { name: '其他', count: 15, percentage: 9.6, color: '#ffa726' }
])

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    type: 'create',
    icon: 'mdi mdi-plus-circle',
    text: '创建了新表单"用户反馈调查"',
    time: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: 2,
    type: 'submit',
    icon: 'mdi mdi-send',
    text: '表单"活动报名"收到新提交',
    time: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: 3,
    type: 'edit',
    icon: 'mdi mdi-pencil',
    text: '修改了表单"信息收集表"',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 4,
    type: 'view',
    icon: 'mdi mdi-eye',
    text: '查看了数据分析报告',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
])

// 热门表单
const popularForms = ref([
  {
    id: 1,
    name: '用户满意度调查',
    category: '问卷调查',
    submissions: 1247
  },
  {
    id: 2,
    name: '产品体验反馈',
    category: '意见反馈',
    submissions: 892
  },
  {
    id: 3,
    name: '年会报名表',
    category: '活动报名',
    submissions: 567
  },
  {
    id: 4,
    name: '员工信息登记',
    category: '信息收集',
    submissions: 443
  }
])

// 刷新数据
const refreshData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 1000)
}

// 日期范围变化
const handleDateChange = (dates: [Date, Date] | null) => {
  console.log('日期范围:', dates)
  // 根据日期范围重新加载数据
}

// 导出报告
const exportReport = () => {
  ElMessage.success('报告导出功能开发中...')
}

// 格式化时间
const formatTime = (time: Date) => {
  const diff = Date.now() - time.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return `${days}天前`
  }
}

// 快速操作
const createForm = () => {
  router.push('/forms/create')
}

const viewTemplates = () => {
  router.push('/templates')
}

const viewAnalytics = () => {
  // 当前页面就是分析页面
  ElMessage.info('您已在数据分析页面')
}

const manageUsers = () => {
  ElMessage.info('用户管理功能开发中...')
}

// 查看表单
const viewForm = (formId: number) => {
  router.push(`/forms/${formId}/preview`)
}

const editForm = (formId: number) => {
  router.push(`/forms/${formId}/edit`)
}

const viewAllActivities = () => {
  ElMessage.info('活动历史页面开发中...')
}

const viewAllForms = () => {
  router.push('/forms')
}

onMounted(() => {
  // 初始化数据
  refreshData()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.dashboard-header {
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

.date-picker {
  width: 280px;
}

.stats-overview {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(31, 38, 135, 0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 28px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-change.positive {
  color: #22c55e;
}

.stat-change.negative {
  color: #ef4444;
}

.charts-section {
  margin-bottom: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chart-header {
  padding: 20px 24px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-header h3 i {
  color: #667eea;
}

.chart-content {
  padding: 24px;
}

.chart-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
}

.chart-placeholder i {
  font-size: 48px;
  margin-bottom: 12px;
  display: block;
}

.chart-placeholder p {
  font-size: 14px;
  margin: 0 0 20px 0;
}

.mock-chart-data {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 8px;
  max-width: 200px;
  margin: 0 auto;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
  min-height: 20px;
  opacity: 0.7;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

.category-count {
  font-size: 12px;
  color: #718096;
}

.category-percentage {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  gap: 12px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.create {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.activity-icon.submit {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.activity-icon.edit {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.activity-icon.view {
  background: rgba(156, 163, 175, 0.1);
  color: #9ca3af;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 14px;
  color: #2d3748;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #718096;
}

.popular-forms {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.form-item:last-child {
  border-bottom: none;
}

.form-info {
  flex: 1;
}

.form-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 4px;
}

.form-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #718096;
}

.form-actions {
  display: flex;
  gap: 4px;
}

.quick-actions {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.actions-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.actions-header h3 i {
  color: #667eea;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.action-item {
  text-align: center;
  padding: 20px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-item:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px auto;
}

.action-icon i {
  font-size: 24px;
  color: white;
}

.action-text {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
}

/* Glass Morphism 样式 */
.glass-date-picker :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 16px;
    padding: 20px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .date-picker {
    width: 200px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 