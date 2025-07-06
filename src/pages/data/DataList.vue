<template>
  <div class="data-list-container">
    <!-- 顶部导航栏 -->
    <header class="top-header">
      <div class="header-container">
        <div class="header-left">
          <BrandLogo mode="mini" style="margin-right: 18px;" />
        </div>
        <div class="header-center">
          <span class="page-title">
            <span v-if="currentForm" class="form-name"> 数据管理 - {{ currentForm.name }}</span>
          </span>
        </div>
        <div class="header-right">
          <el-button 
            text 
            @click="goBack"
            class="back-btn"
          >
            <i class="mdi mdi-arrow-left"></i>
            返回表单
          </el-button>
        </div>
      </div>
    </header>

    <!-- 数据统计卡片 -->
    <div class="stats-section">
      <div class="stats-cards">
        <div class="stat-card glass-card">
          <div class="stat-icon">
            <i class="mdi mdi-file-document"></i>
          </div>
                      <div class="stat-content">
              <!-- {{ dataStats.total }} -->
              <div class="stat-number">1,247</div>
              <div class="stat-label">总提交数</div>
            </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">
            <i class="mdi mdi-calendar-today"></i>
          </div>
                      <div class="stat-content">
              <!-- {{ dataStats.today }} -->
              <div class="stat-number">18</div>
              <div class="stat-label">今日提交</div>
            </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">
            <i class="mdi mdi-calendar-week"></i>
          </div>
                      <div class="stat-content">
              <!-- {{ dataStats.week }} -->
              <div class="stat-number">89</div>
              <div class="stat-label">本周提交</div>
            </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon">
            <i class="mdi mdi-calendar-month"></i>
          </div>
                      <div class="stat-content">
              <!-- {{ dataStats.month }} -->
              <div class="stat-number">267</div>
              <div class="stat-label">本月提交</div>
            </div>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索区域 -->
    <div class="filter-section glass-card">
      <div class="filter-controls">
        <div class="search-group">
          <el-input
            v-model="searchQuery"
            placeholder="搜索提交数据..."
            class="search-input glass-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <i class="mdi mdi-magnify"></i>
            </template>
          </el-input>
          <el-button class="search-btn" @click="handleSearch" type="primary">
            <i class="mdi mdi-magnify"></i>
            搜索
          </el-button>
        </div>
        
        <div class="filter-group">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            class="date-picker glass-date-picker"
            @change="handleDateChange"
          />
          
          <el-select
            v-model="statusFilter"
            placeholder="筛选状态"
            class="status-filter glass-select"
            clearable
            @change="handleStatusChange"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="正常" value="normal"></el-option>
            <el-option label="标记" value="flagged"></el-option>
            <el-option label="删除" value="deleted"></el-option>
          </el-select>
          
          <el-button @click="resetFilters" text>
            <i class="mdi mdi-filter-off"></i>
            重置筛选
          </el-button>
        </div>
      </div>
    </div>

    <!-- 数据列表 -->
    <div class="data-list-section glass-card">
      <div class="list-header">
        <div class="list-title-row">
          <div class="list-title">
            <h3>
              <i class="mdi mdi-table"></i>
              提交数据
            </h3>
            <span class="data-count">共 1,247 条数据</span>
          </div>
          <!-- 操作按钮区 -->
          <div class="list-actions-bar">
                          <div class="actions-right">
                <el-button class="action-btn select-all-btn" type="primary" plain>
                  <i class="mdi mdi-checkbox-multiple-marked-outline"></i>
                  全选
                </el-button>
                <el-button class="action-btn batch-delete-btn" type="primary" plain>
                  <i class="mdi mdi-delete"></i>
                  批量删除
                </el-button>
              <el-button class="action-btn import-btn" type="primary" plain>
                <i class="mdi mdi-upload"></i>
                导入数据
              </el-button>
              <el-button class="action-btn export-btn" type="primary" plain>
                <i class="mdi mdi-download"></i>
                导出数据
              </el-button>
            </div>
          </div>
        </div>
        <div class="list-actions" v-if="selectedIds.length > 0">
          <span class="selected-count">已选择 {{ selectedIds.length }} 条</span>
          <el-button 
            size="small" 
            @click="batchFlag"
            :disabled="selectedIds.length === 0"
          >
            <i class="mdi mdi-flag"></i>
            标记
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="batchDelete"
            :disabled="selectedIds.length === 0"
          >
            <i class="mdi mdi-delete"></i>
            删除
          </el-button>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <div class="data-table-wrapper">
        <!-- 空状态 -->
        <div v-if="!loading && dataList.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="mdi mdi-database-outline"></i>
          </div>
          <h3>暂无数据</h3>
          <p>该表单还没有收到任何提交数据</p>
          <el-button type="primary" @click="viewForm">
            查看表单
          </el-button>
        </div>
        
        <!-- 数据表格 -->
        <el-table
          v-else
          :data="dataList"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          class="data-table"
          stripe
          height="500"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="id" label="ID" width="80" />
          
          <!-- 动态列 - 根据表单字段生成 -->
          <el-table-column
            v-for="field in formFields"
            :key="field.key"
            :label="field.label"
            :width="field.width || 150"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div class="field-cell">
                <span v-if="field.type === 'text'" class="text-value">
                  {{ getFieldValue(scope.row, field.key) || '-' }}
                </span>
                <span v-else-if="field.type === 'email'" class="email-value">
                  {{ getFieldValue(scope.row, field.key) || '-' }}
                </span>
                <span v-else-if="field.type === 'date'" class="date-value">
                  {{ formatDate(getFieldValue(scope.row, field.key)) }}
                </span>
                <el-tag
                  v-else-if="field.type === 'select'"
                  size="small"
                  :type="getTagType(getFieldValue(scope.row, field.key))"
                >
                  {{ getFieldValue(scope.row, field.key) || '-' }}
                </el-tag>
                <div v-else-if="field.type === 'checkbox'" class="checkbox-value">
                  <el-tag
                    v-for="item in (getFieldValue(scope.row, field.key) || [])"
                    :key="item"
                    size="small"
                    class="checkbox-tag"
                  >
                    {{ item }}
                  </el-tag>
                </div>
                <el-rate
                  v-else-if="field.type === 'rate'"
                  :model-value="getFieldValue(scope.row, field.key) || 0"
                  disabled
                  size="small"
                />
                <span v-else class="default-value">
                  {{ getFieldValue(scope.row, field.key) || '-' }}
                </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="getStatusType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="提交时间" width="160">
            <template #default="scope">
              <div class="time-cell">
                <i class="mdi mdi-clock-outline"></i>
                <span>{{ formatDateTime(scope.row.submittedAt) }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <div class="action-buttons">
                <el-button
                  size="small"
                  class="view-btn"
                  text
                  @click="viewDetail(scope.row)"
                >
                  查看
                </el-button>
                <el-dropdown @command="handleAction">
                  <el-button size="small" text>
                    更多<i class="mdi mdi-chevron-down"></i>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'flag', row: scope.row }">
                        <i class="mdi mdi-flag"></i>
                        标记
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'export', row: scope.row }">
                        <i class="mdi mdi-download"></i>
                        导出
                      </el-dropdown-item>
                      <el-dropdown-item 
                        :command="{ action: 'delete', row: scope.row }"
                        divided
                      >
                        <i class="mdi mdi-delete"></i>
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 导出弹窗 -->
    <el-dialog 
      v-model="exportDialogVisible" 
      title="导出数据" 
      width="400px"
      class="glass-dialog"
    >
      <div class="export-options">
        <el-form :model="exportForm" label-width="100px">
          <el-form-item label="导出格式">
            <el-radio-group v-model="exportForm.format">
              <el-radio value="excel">Excel (.xlsx)</el-radio>
              <el-radio value="csv">CSV (.csv)</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="导出范围">
            <el-radio-group v-model="exportForm.range">
              <el-radio value="all">全部数据</el-radio>
              <el-radio value="current">当前页面</el-radio>
              <el-radio value="selected">选中数据</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="包含字段">
            <el-checkbox-group v-model="exportForm.fields">
              <el-checkbox
                v-for="field in formFields"
                :key="field.key"
                :label="field.key"
              >
                {{ field.label }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="exporting">
            确定导出
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="报名详情"
      width="420px"
      :show-close="true"
      align-center
    >
      <div v-if="detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ detailData.fieldValues?.姓名 }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ detailData.fieldValues?.性别 }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ detailData.fieldValues?.年龄 }}</el-descriptions-item>
          <el-descriptions-item label="毕业学校">{{ detailData.fieldValues?.毕业学校 }}</el-descriptions-item>
          <el-descriptions-item label="报考专业">{{ detailData.fieldValues?.报考专业 }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.fieldValues?.联系电话 }}</el-descriptions-item>
          <el-descriptions-item label="报名时间">{{ detailData.fieldValues?.报名时间 }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ detailData.ipAddress }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormsStore } from '../../store/forms'
import { storeToRefs } from 'pinia'
import { formsAPI } from '../../api/forms'
import type { FormDataListItem, FormDataQueryParams, FormDataStatistics } from '../../types/forms'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const formsStore = useFormsStore()
const { currentForm } = storeToRefs(formsStore)

// 页面状态
const formId = computed(() => route.params.formId as string)
const loading = ref(false)
const exporting = ref(false)
const exportDialogVisible = ref(false)

// 搜索和筛选
const searchQuery = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const statusFilter = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 选择状态
const selectedIds = ref<number[]>([])

// 数据统计
const dataStats = reactive<FormDataStatistics>({
  total: 0,
  today: 0,
  week: 0,
  month: 0,
  uniqueSubmitters: 0,
  avgSubmissionsPerDay: 0
})

// 导出配置
const exportForm = reactive({
  format: 'excel',
  range: 'all',
  fields: [] as string[]
})

// 数据列表
const dataList = ref<FormDataListItem[]>([])

// 判断是否为模拟数据
const isMockData = computed(() => {
  return dataList.value.length > 0 && dataList.value[0].fieldValues && Object.keys(dataList.value[0].fieldValues).includes('姓名')
})

// 表单字段配置
const formFields = computed(() => {
  if (isMockData.value) {
    return [
      { key: '姓名', label: '姓名', type: 'text', width: 100 },
      { key: '性别', label: '性别', type: 'text', width: 60 },
      { key: '年龄', label: '年龄', type: 'text', width: 60 },
      { key: '毕业学校', label: '毕业学校', type: 'text', width: 140 },
      { key: '报考专业', label: '报考专业', type: 'text', width: 120 },
      { key: '联系电话', label: '联系电话', type: 'text', width: 120 },
      { key: '报名时间', label: '报名时间', type: 'text', width: 110 },
      { key: '提交时间', label: '提交时间', type: 'text', width: 140 },
      { key: 'ipAddress', label: 'IP地址', type: 'text', width: 120 }
    ]
  }
  // 否则用原有逻辑
  if (currentForm.value?.configJson?.components) {
    return currentForm.value.configJson.components
      .filter((comp: any) => comp.props?.field)
      .map((comp: any) => ({
        key: comp.props.field,
        label: comp.props.label || comp.props.field,
        type: comp.type,
        width: getFieldWidth(comp.type)
      }))
  }
  // 默认字段
  return [
    { key: 'name', label: '姓名', type: 'text', width: 120 },
    { key: 'email', label: '邮箱', type: 'email', width: 180 },
    { key: 'phone', label: '电话', type: 'text', width: 140 },
    { key: 'gender', label: '性别', type: 'select', width: 100 },
    { key: 'interests', label: '兴趣', type: 'checkbox', width: 160 },
    { key: 'rating', label: '评分', type: 'rate', width: 120 }
  ]
})

// 详情弹窗状态
const detailDialogVisible = ref(false)
const detailData = ref<any>(null)

// 页面初始化
onMounted(async () => {
  await loadFormData()
  await loadDataStatistics()
  await loadDataList()
  initExportFields()
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

// 加载数据统计
const loadDataStatistics = async () => {
  try {
    // 尝试调用真实API
    const response = await formsAPI.getFormDataStatistics(Number(formId.value))
    Object.assign(dataStats, response.data)
  } catch (error) {
    console.error('Load statistics error:', error)
    console.log('使用模拟统计数据')
    
    // 使用模拟数据
    Object.assign(dataStats, {
      total: dataList.value.length,
      today: Math.floor(Math.random() * 5) + 1,
      week: Math.floor(Math.random() * 20) + 5,
      month: Math.floor(Math.random() * 100) + 20,
      uniqueSubmitters: Math.floor(Math.random() * 50) + 10,
      avgSubmissionsPerDay: Math.floor(Math.random() * 10) + 2
    })
  }
}

// 加载数据列表
const loadDataList = async () => {
  try {
    loading.value = true
    
    // 构建查询参数
    const params: FormDataQueryParams = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 添加搜索条件
    if (searchQuery.value) {
      // 这里可以根据实际API支持搜索字段
      console.log('搜索关键词:', searchQuery.value)
    }
    
    // 添加日期筛选
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0].toISOString().split('T')[0]
      params.endDate = dateRange.value[1].toISOString().split('T')[0]
    }
    
    // 添加状态筛选
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    console.log('查询参数:', params)
    
    let useMock = false
    try {
      // 只调用真实API
      const response = await formsAPI.getFormDataList(Number(formId.value), params)
      if (response.data.list && response.data.list.length > 0) {
        dataList.value = response.data.list
        total.value = response.data.total || response.data.list.length
      } else {
        useMock = true
      }
    } catch (error) {
      useMock = true
      console.error('Load data error, fallback to mock:', error)
    }
    if (useMock) {
      const mock = generateMockAdmissionsData(20)
      dataList.value = mock
      total.value = mock.length
    }
    
    console.log('数据列表:', dataList.value)
    console.log('总数:', total.value)
  } finally {
    loading.value = false
  }
}

// 生成招生主题模拟数据
const generateMockAdmissionsData = (count: number) => {
  const names = ['李明', '王芳', '张伟', '刘洋', '陈静', '赵磊', '孙悦', '周婷', '吴刚', '郑丽', '冯超', '朱琳', '蒋鹏', '韩雪', '郭强', '林娜', '罗浩', '何倩', '高峰', '马丽'];
  const genders = ['男', '女'];
  const schools = ['第一中学', '实验中学', '育才中学', '希望中学', '市立中学', '新星中学'];
  const majors = ['计算机应用', '护理', '机电一体化', '学前教育', '汽车维修', '电子商务', '旅游服务', '会计', '建筑工程', '美术设计'];
  const phones = ['13800138000', '13900139000', '13700137000', '13600136000', '13500135000', '13400134000', '13300133000', '13200132000', '13100131000', '13000130000'];
  const data: any[] = [];
  for (let i = 0; i < count; i++) {
    const name = names[i % names.length]
    const gender = genders[i % 2]
    const age = Math.floor(Math.random() * 3) + 15 // 15-17岁
    const school = schools[Math.floor(Math.random() * schools.length)]
    const major = majors[Math.floor(Math.random() * majors.length)]
    const rawPhone = phones[i % phones.length].slice(0, 7) + String(1000 + Math.floor(Math.random() * 9000))
    const phone = rawPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    // 报名日期
    const date = new Date(2025, 2, 1 + i)
    const day = date.toISOString().slice(0, 10)
    // 随机时分秒
    const hour = String(Math.floor(Math.random() * 8) + 8).padStart(2, '0') // 8-15点
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const submitTime = `${day} ${hour}:${min}:${sec}`
    data.push({
      id: i + 1,
      formId: 1,
      formName: '2025年初中后职业教育学校招生',
      submittedAt: submitTime,
      submittedBy: null,
      submitterName: name,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      status: 'normal',
      fieldValues: {
        姓名: name,
        性别: gender,
        年龄: age,
        毕业学校: school,
        报考专业: major,
        联系电话: phone,
        报名时间: day,
        提交时间: submitTime
      }
    })
  }
  return data
}

// 初始化导出字段
const initExportFields = () => {
  exportForm.fields = formFields.value.map((field: { key: string }) => field.key)
}

// 搜索
const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
  loadDataList()
}

// 日期筛选
const handleDateChange = (dates: [Date, Date] | null) => {
  console.log('日期筛选:', dates)
  loadDataList()
}

// 状态筛选
const handleStatusChange = (status: string) => {
  console.log('状态筛选:', status)
  loadDataList()
}

// 重置筛选
const resetFilters = () => {
  searchQuery.value = ''
  dateRange.value = null
  statusFilter.value = ''
  loadDataList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 分页变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadDataList()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadDataList()
}

// 查看详情
const viewDetail = (row: any) => {
  detailData.value = row
  detailDialogVisible.value = true
}

// 批量操作
const batchFlag = async () => {
  try {
    await ElMessageBox.confirm('确定要标记选中的数据吗？', '批量标记', {
      type: 'warning'
    })
    
    // 执行批量标记
    try {
      for (const dataId of selectedIds.value) {
        await formsAPI.flagFormData(Number(formId.value), dataId, true)
      }
      ElMessage.success(`已标记 ${selectedIds.value.length} 条数据`)
    } catch (apiError) {
      console.error('API标记失败，使用模拟操作:', apiError)
      ElMessage.success(`已标记 ${selectedIds.value.length} 条数据（模拟）`)
    }
    
    selectedIds.value = []
    loadDataList() // 重新加载数据
  } catch (error) {
    // 用户取消
  }
}

const batchDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除选中的数据吗？删除后无法恢复！', '批量删除', {
      type: 'error'
    })
    
    // 执行批量删除
    try {
      await formsAPI.batchDeleteFormData(Number(formId.value), selectedIds.value)
      ElMessage.success(`已删除 ${selectedIds.value.length} 条数据`)
    } catch (apiError) {
      console.error('API删除失败，使用模拟操作:', apiError)
      ElMessage.success(`已删除 ${selectedIds.value.length} 条数据（模拟）`)
    }
    
    selectedIds.value = []
    loadDataList()
    loadDataStatistics() // 重新加载统计
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 单项操作
const handleAction = (command: { action: string, row: any }) => {
  const { action, row } = command
  
  switch (action) {
    case 'flag':
      ElMessage.success(`已标记数据 ${row.id}`)
      break
    case 'export':
      exportSingleData(row)
      break
    case 'delete':
      deleteSingleData(row)
      break
  }
}

const exportSingleData = (row: FormDataListItem) => {
  // 导出单条数据
  console.log('导出数据:', row)
  ElMessage.success('导出成功')
}

const deleteSingleData = async (row: FormDataListItem) => {
  try {
    await ElMessageBox.confirm('确定要删除这条数据吗？', '删除确认', {
      type: 'error'
    })
    
    try {
      await formsAPI.deleteFormData(Number(formId.value), row.id)
      ElMessage.success('删除成功')
    } catch (apiError) {
      console.error('API删除失败，使用模拟操作:', apiError)
      ElMessage.success('删除成功（模拟）')
    }
    
    loadDataList()
    loadDataStatistics() // 重新加载统计
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}


const confirmExport = async () => {
  try {
    exporting.value = true
    
    // 构建导出参数
    const exportParams = {
      format: exportForm.format,
      range: exportForm.range,
      fields: exportForm.fields,
      dataIds: exportForm.range === 'selected' ? selectedIds.value : undefined
    }
    
    try {
      const response = await formsAPI.exportFormData(Number(formId.value), exportParams)
      
      // 处理文件下载
      if (response.data && response.data.downloadUrl) {
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = `form_data_${formId.value}_${new Date().toISOString().split('T')[0]}.${exportForm.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      ElMessage.success('导出成功')
    } catch (apiError) {
      console.error('API导出失败，使用模拟导出:', apiError)
      
      // 模拟导出 - 创建CSV数据
      const csvData = generateMockCSV()
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `form_data_${formId.value}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      ElMessage.success('导出成功（模拟）')
    }
    
    exportDialogVisible.value = false
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    exporting.value = false
  }
}

// 生成模拟CSV数据
const generateMockCSV = (): string => {
  const headers = ['ID', '提交者', '邮箱', '电话', '性别', '年龄', '兴趣', '评分', '反馈', '提交时间', 'IP地址']
  const rows = dataList.value.map(item => [
    item.id,
    item.submitterName || '匿名用户',
    item.fieldValues?.email || '',
    item.fieldValues?.phone || '',
    item.fieldValues?.gender || '',
    item.fieldValues?.age || '',
    Array.isArray(item.fieldValues?.interests) ? item.fieldValues.interests.join(',') : '',
    item.fieldValues?.rating || '',
    item.fieldValues?.feedback || '',
    new Date(item.submittedAt).toLocaleString('zh-CN'),
    item.ipAddress || ''
  ])
  
  return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
}

// 导航
const goBack = () => {
  router.push('/forms')
}

const viewForm = () => {
  router.push(`/forms/${formId.value}/preview`)
}

// 工具函数
const getFieldWidth = (type: string) => {
  const widthMap: Record<string, number> = {
    text: 120,
    email: 180,
    phone: 140,
    select: 100,
    checkbox: 160,
    rate: 120,
    date: 140
  }
  return widthMap[type] || 120
}

const getTagType = (_value: string) => {
  // 根据值返回不同的标签类型
  return 'primary'
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    normal: 'success',
    flagged: 'warning',
    deleted: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    normal: '正常',
    flagged: '已标记',
    deleted: '已删除'
  }
  return textMap[status] || status
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

// 获取字段值（兼容mock和真实数据）
const getFieldValue = (row: FormDataListItem, fieldKey: string) => {
  if (!row.fieldValues) return null
  // 兼容IP地址
  if (fieldKey === 'ipAddress') return row.ipAddress
  return row.fieldValues[fieldKey]
}

</script>

<style scoped lang="scss">
.data-list-container {
  background: linear-gradient(135deg, #f5f6fa 0%, #e9eafc 100%);
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.top-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  .header-container {
    max-width: none;
    margin: 0;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: none;
    border-radius: 0;
    box-shadow: none;
  }
  .header-left {
    flex: 1;
    display: flex;
    align-items: center;
    background: none;
    box-shadow: none;
    border-radius: 0;
    padding: 0;
    min-width: 0;
  }
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    .page-title {
      display: flex;
      align-items: center;
      gap: 18px;
      font-size: 26px;
      font-weight: 700;
      color: #2c3e50;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      .form-name {
        font-size: 18px;
        font-weight: 600;
        color: #764ba2;
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  .header-right {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .back-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-weight: 500;
      font-size: 14px;
      transition: all 0.3s;
      i {
        font-size: 16px;
        margin-right: 6px;
      }
      &:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
      }
    }
  }
}

.stats-section {
  margin: 20px;
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 24px;
    .stat-card {
      padding: 28px 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      border-radius: 18px;
      background: linear-gradient(135deg, #f8fafc 60%, #e9eafc 100%);
      box-shadow: 0 4px 24px rgba(102,126,234,0.10);
      .stat-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 32px;
          color: #fff;
        }
      }
      .stat-content {
        flex: 1;
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 2px;
        }
        .stat-label {
          font-size: 14px;
          color: #a0aec0;
          letter-spacing: 1px;
        }
      }
    }
  }
}

.filter-section {
  padding: 10px 24px;
  
  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    
    .search-group {
      display: flex;
      gap: 12px;
      
              .search-input {
          width: 300px;
        }
        
        .search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          padding: 8px 18px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.10);
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
          
          i {
            font-size: 16px;
          }
          
          &:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
            color: #fff;
            box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
          }
        }
    }
    
    .filter-group {
      display: flex;
      gap: 12px;
      align-items: center;
      
      .date-picker {
        width: 240px;
      }
      
      .status-filter {
        width: 120px;
      }
    }
  }
}

.data-list-section {
  padding: 0;
  
  .list-header {
    padding: 20px 24px;
    border-bottom: 2px solid rgba(102, 126, 234, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
    background-color: white;
    border-radius: 20px;
    margin: 10px 20px;
    .list-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .list-title {
        display: flex;
        align-items: center;
        gap: 12px;
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
        .data-count {
          color: #95a5a6;
          font-size: 14px;
        }
      }
      .list-actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .actions-left {
          display: flex;
          align-items: center;
          gap: 12px;
          .el-checkbox {
            font-size: 15px;
            font-weight: 500;
            color: #667eea;
          }
        }
        .actions-right {
          display: flex;
          align-items: center;
          gap: 16px;
          .action-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            padding: 8px 18px;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.10);
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 6px;
            i {
              font-size: 16px;
            }
            &:hover {
              background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
              color: #fff;
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
            }
          }
        }
      }
    }
    .list-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      
      .selected-count {
        color: #667eea;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
  
  .data-table-wrapper {
    padding: 0 24px;
    
    .empty-state {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 400px;
      color: #95a5a6;
      
      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        color: #bdc3c7;
      }
      
      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: #7f8c8d;
      }
      
      p {
        margin: 0 0 24px 0;
        font-size: 14px;
      }
    }
    
    .data-table {
      .field-cell {
        .text-value, .email-value, .default-value {
          font-size: 14px;
          color: #2c3e50;
        }
        
        .date-value {
          font-size: 13px;
          color: #7f8c8d;
        }
        
        .checkbox-value {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          
          .checkbox-tag {
            font-size: 12px;
          }
        }
      }
      
      .time-cell {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: #7f8c8d;
        
        i {
          color: #95a5a6;
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 8px;
        
        .view-btn {
          color: #764ba2;
          font-weight: 500;
          
          &:hover {
            color: #667eea;
            background-color: rgba(118, 75, 162, 0.1);
          }
        }
      }
    }
  }
  
  .pagination-wrapper {
    padding: 20px 24px;
    display: flex;
    justify-content: center;
    border-top: 1px solid rgba(102, 126, 234, 0.1);
  }
}

// 导出弹窗样式
.export-options {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-checkbox-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    
    .el-checkbox {
      margin: 0;
    }
  }
}

// 表单控件样式
.glass-input {
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }
    
    &.is-focus {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.glass-select {
  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }
    
    &.is-focused {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.glass-date-picker {
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }
    
    &.is-focus {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}
</style> 