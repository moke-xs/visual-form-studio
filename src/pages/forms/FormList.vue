<template>
  <div class="form-list-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <BrandLogo :show-tagline="true" />
      </div>
      <div class="header-right">
        <div class="user-info">
          <el-button text type="primary" @click="logout">
            <i class="mdi mdi-logout"></i>
            注销
          </el-button>
        </div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索表单名称..."
          class="search-input"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <i class="mdi mdi-magnify"></i>
          </template>
        </el-input>
        
        <el-select 
          v-model="statusFilter" 
          placeholder="状态筛选" 
          clearable
          @change="handleFilter"
        >
          <el-option label="全部状态" :value="-1"></el-option>
          <el-option label="草稿" :value="0"></el-option>
          <el-option label="已发布" :value="1"></el-option>
          <el-option label="已归档" :value="2"></el-option>
          <el-option label="已禁用" :value="3"></el-option>
        </el-select>
      </div>
      
      <div class="filter-right">
        <el-button @click="createNewForm">
          <i class="mdi mdi-plus"></i>
          创建表单
        </el-button>
        <el-button @click="refreshList">
          <i class="mdi mdi-refresh"></i>
          刷新
        </el-button>
      </div>
    </div>
    <!-- 表单统计 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-number">{{ totalForms }}</div>
        <div class="stat-label">总表单数</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ publishedCount }}</div>
        <div class="stat-label">已发布</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ draftCount }}</div>
        <div class="stat-label">草稿</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ archivedCount }}</div>
        <div class="stat-label">已归档</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ disabledCount }}</div>
        <div class="stat-label">已禁用</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalCreated }}</div>
        <div class="stat-label">创建总数</div>
      </div>
    </div>

    <!-- 操作提示 -->
    <div class="action-hint">
      <i class="mdi mdi-information-outline"></i>
      <span>点击表单卡片可编辑表单，使用快速操作按钮进行预览、分享等操作</span>
    </div>

    <!-- 表单列表 -->
    <div class="form-grid" v-loading="loading">
      <div
        v-for="form in formList"
          :key="form.id"
        class="form-card"
      >
        <!-- 表单状态标识 -->
        <div class="form-status" :class="getFormStatus(form.status)">
          <i :class="getStatusIcon(getFormStatus(form.status))"></i>
          <span class="status-text">{{ getStatusText(getFormStatus(form.status)) }}</span>
        </div>

        <!-- 上半部分：点击预览 -->
        <div class="form-card-main" @click="viewFormPreview(form)">
          <el-row class="form-header" :gutter="12">
            <el-col :span="18" class="form-header-content" style="padding-left: 0;">
              <h3 class="form-title">{{ form.name }}</h3>
              <p class="form-description">{{ form.description || '暂无描述' }}</p>
              <p class="form-description">
                创建于 {{ formatDate(form.createdAt) }}
              </p>
            </el-col>
          </el-row>
        </div>

        <!-- 下半部分：常用操作按钮 -->
        <div class="quick-actions" @click.stop>
          <!-- 编辑表单按钮 -->
          <el-button link size="small" @click="editForm(form)" title="编辑表单"><i class="mdi mdi-pencil"></i></el-button>
          <!-- 设计表单按钮 -->
          <el-button link size="small" @click="designForm(form)" title="设计表单"><i class="mdi mdi-palette"></i></el-button>
          <!-- 权限设置按钮 -->
          <el-button link size="small" @click="setPermission(form)" title="设置权限"><i class="mdi mdi-lock"></i></el-button>
          
          <!-- 状态操作按钮组 -->
          <el-dropdown @command="handleStatusAction" trigger="click">
            <el-button link size="small" title="状态操作">
              <i class="mdi mdi-cog"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item 
                  :command="{ action: 'draft', form }" 
                  v-if="getFormStatus(form.status) !== 'draft'"
                >
                  <i class="mdi mdi-file-document-outline"></i>
                  设为草稿
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'published', form }" 
                  v-if="getFormStatus(form.status) !== 'published'"
                >
                  <i class="mdi mdi-publish"></i>
                  发布表单
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'archived', form }" 
                  v-if="getFormStatus(form.status) !== 'archived'"
                >
                  <i class="mdi mdi-archive"></i>
                  归档表单
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'disabled', form }" 
                  v-if="getFormStatus(form.status) !== 'disabled'"
                >
                  <i class="mdi mdi-block-helper"></i>
                  禁用表单
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 统计分析按钮 -->
          <el-button link size="small" @click="viewStats(form)" title="访问统计"><i class="mdi mdi-chart-bar"></i></el-button>
          <!-- 分享表单按钮 -->
          <el-button link size="small" @click="shareForm(form)" title="分享表单"><i class="mdi mdi-share"></i></el-button>
          <!-- 数据管理按钮 -->
          <el-button link size="small" @click="viewData(form)" title="数据管理"><i class="mdi mdi-database"></i></el-button>
        </div>

        <!-- 右上角更多操作 -->
        <div class="form-actions" @click.stop>
          <!-- 更多操作下拉菜单，包含复制表单等功能 -->
          <el-dropdown @command="handleMoreAction" trigger="click">
            <el-button link><i class="mdi mdi-dots-vertical"></i></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- 状态操作 -->
                <el-dropdown-item divided>
                  <span style="color: #909399; font-size: 12px;">状态操作</span>
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'draft', form }" 
                  v-if="getFormStatus(form.status) !== 'draft'"
                >
                  <i class="mdi mdi-file-document-outline"></i>
                  设为草稿
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'published', form }" 
                  v-if="getFormStatus(form.status) !== 'published'"
                >
                  <i class="mdi mdi-publish"></i>
                  发布表单
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'archived', form }" 
                  v-if="getFormStatus(form.status) !== 'archived'"
                >
                  <i class="mdi mdi-archive"></i>
                  归档表单
                </el-dropdown-item>
                <el-dropdown-item 
                  :command="{ action: 'disabled', form }" 
                  v-if="getFormStatus(form.status) !== 'disabled'"
                >
                  <i class="mdi mdi-block-helper"></i>
                  禁用表单
                </el-dropdown-item>
                
                <!-- 其他操作 -->
                <el-dropdown-item divided>
                  <span style="color: #909399; font-size: 12px;">其他操作</span>
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'delete', form }">
                  <i class="mdi mdi-delete"></i>
                  删除表单
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'copy', form }">
                  <i class="mdi mdi-content-copy"></i>
                  复制表单
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'analyze', form }">
                  <i class="mdi mdi-chart-line"></i>
                  表单分析
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'move', form }">
                  <i class="mdi mdi-folder-move"></i>
                  移动表单
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'top', form }">
                  <i class="mdi mdi-arrow-up"></i>
                  置顶表单
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'data', form }">
                  <i class="mdi mdi-database"></i>
                  数据管理
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && formList.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="mdi mdi-file-document-outline"></i>
      </div>
      <h3>暂无表单</h3>
      <p>点击上方按钮创建您的第一个表单</p>
      <el-button type="primary" @click="createNewForm">创建表单</el-button>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && total > 0" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFormsStore } from '../../store/forms'
import { storeToRefs } from 'pinia'
import type { FormStatus } from '../../types/forms'
import { FormStatusUtils } from '../../types/forms'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const formsStore = useFormsStore()
const { formList, loading, total, pagination, statistics } = storeToRefs(formsStore)

// 筛选和搜索
const searchKeyword = ref('')
const statusFilter = ref<number>(-1)  // 使用数字枚举值，-1表示全部状态，与后端API一致

// 辅助函数：安全获取表单状态
const getFormStatus = (status: FormStatus | number): FormStatus => {
  return typeof status === 'number' ? FormStatusUtils.toString(status) : status
}

// 计算属性 - 使用后端返回的统计数据
const totalForms = computed(() => statistics.value.totalForms)  // 使用后端统计数据
const publishedCount = computed(() => statistics.value.publishedCount)  // 使用后端统计数据
const draftCount = computed(() => statistics.value.draftCount)  // 使用后端统计数据
const archivedCount = computed(() => statistics.value.archivedCount)  // 使用后端统计数据
const disabledCount = computed(() => statistics.value.disabledCount)  // 使用后端统计数据
const totalCreated = computed(() => statistics.value.totalCreated)  // 使用后端统计数据
// 页面初始化
onMounted(() => {
  console.log('FormList页面初始化')
  fetchForms()
  
  // 调试：检查当前表单列表
  console.log('当前表单列表:', formList.value)
  console.log('表单列表长度:', formList.value.length)
})

/**
 * 获取表单列表
 * 说明：状态筛选使用数字枚举值（-1=全部, 0=草稿, 1=已发布, 2=已归档, 3=已禁用）
 * 与后端API /api/Forms 接口的status参数保持一致
 */
const fetchForms = async () => {
  try {
    console.log('开始获取表单列表')
    console.log('API基础URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api')
    
    // 构建查询参数，确保状态筛选传递数字枚举值给后端
    const queryParams: any = {
      keyword: searchKeyword.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    // 只有当选择了具体状态（非-1）时才传递status参数
    if (statusFilter.value !== -1) {
      queryParams.status = statusFilter.value
    }
    
    console.log('查询参数:', queryParams)
    await formsStore.fetchFormList(queryParams)
    console.log('获取表单列表完成，当前列表长度:', formList.value.length)
  } catch (error) {
    console.error('获取表单列表失败:', error)
    ElMessage.error('获取表单列表失败')
  }
}

/**
 * 搜索处理
 * 说明：重置分页到第一页，然后重新获取数据
 */
const handleSearch = () => {
  formsStore.resetPagination()
  fetchForms()
}

/**
 * 状态筛选处理
 * 说明：重置分页到第一页，然后重新获取数据
 * 状态值：-1=全部, 0=草稿, 1=已发布, 2=已归档, 3=已禁用
 */
const handleFilter = () => {
  formsStore.resetPagination()
  fetchForms()
}

/**
 * 刷新列表
 * 说明：重置分页到第一页，然后重新获取数据
 */
const refreshList = () => {
  formsStore.resetPagination()
  fetchForms()
}

/**
 * 分页处理 - 页码变更
 * 说明：更新当前页码，重新获取对应页的数据
 */
const handlePageChange = (page: number) => {
  console.log('handlePageChange', page)
  pagination.value.page = page
  fetchForms()
}

/**
 * 分页处理 - 每页大小变更
 * 说明：更新每页大小，重置到第一页，重新获取数据
 */
const handleSizeChange = (pageSize: number) => {
  pagination.value.pageSize = pageSize
  formsStore.resetPagination()
  fetchForms()
}

// 创建新表单
const createNewForm = () => {
  router.push('/forms/create')
}

// 工具函数
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
    disabled: '已禁用'
  }
  return statusMap[status] || status
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    draft: 'mdi mdi-file-document-outline',
    published: 'mdi mdi-check-circle',
    archived: 'mdi mdi-archive',
    disabled: 'mdi mdi-block-helper'
  }
  return iconMap[status] || 'mdi mdi-help-circle'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 注销功能
const logout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要注销登录吗？',
      '注销确认',
      { 
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 清除token
    localStorage.removeItem('token')
    
    // 提示并跳转到登录页
    ElMessage.success('已注销登录')
    router.push('/auth/login')
  } catch (error) {
    // 用户取消注销
  }
}

// 新增方法
const viewFormPreview = (form: any) => {
  router.push(`/forms/${form.id}/preview`)
}
// 编辑表单
const editForm = (form: any) => {
  router.push(`/forms/${form.id}/edit`)
}
// 设计表单
const designForm = (form: any) => {
  router.push(`/designer/${form.id}`)
}
const setPermission = (_form: any) => {
  // 权限设置弹窗或跳转
  ElMessage.info('权限设置功能开发中')
}
const viewStats = (form: any) => {
  router.push(`/forms/${form.id}/stats`)
}
const shareForm = (form: any) => {

  console.log("---------------------------")
  if (getFormStatus(form.status) === 'published') {
    // 调试信息
    console.log('分享表单信息:', {
      id: form.id,
      formKey: form.formKey,
      name: form.name,
      status: form.status
    })
    
    // 优先使用formKey，如果没有则使用id
    const formIdentifier = form.formKey || form.id
    const shareUrl = `${window.location.origin}/fill/${formIdentifier}`
    
    console.log('生成的分享链接:', shareUrl)
    
    // 显示分享对话框
    ElMessageBox.alert(
      `<div style="text-align: center;">
        <p style="margin-bottom: 16px; color: #666;">复制以下链接分享给其他人填写表单：</p>
        <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px; word-break: break-all; font-family: monospace; font-size: 14px;">
          ${shareUrl}
        </div>
        <p style="color: #999; font-size: 12px;">点击确定复制链接到剪贴板</p>
      </div>`,
      '分享表单',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '复制链接',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      navigator.clipboard.writeText(shareUrl).then(() => {
        ElMessage.success('分享链接已复制到剪贴板')
      }).catch(() => {
        ElMessage.error('复制失败，请手动复制链接')
      })
    }).catch(() => {
      // 用户取消
    })
  } else {
    ElMessage.warning('只有已发布的表单才能分享')
  }
}
const handleMoreAction = ({ action, form }: any) => {
  switch (action) {
    // 状态操作
    case 'draft':
    case 'published':
    case 'archived':
    case 'disabled':
      handleUpdateFormStatus(form, action)
      break
      
    // 其他操作
    case 'delete':
      deleteForm(form)
      break
    case 'analyze':
      ElMessage.info('表单分析功能开发中')
      break
    case 'move':
      ElMessage.info('移动表单功能开发中')
      break
    case 'top':
      ElMessage.info('置顶表单功能开发中')
      break
    case 'copy':
      handleCopyForm(form)
      break
    case 'data':
      viewData(form)
      break
  }
}

// 将 quick-actions 和更多操作中原本跳转到收集数据的部分，改为跳转到数据管理页面
const viewData = (form: any) => {
  router.push(`/data/${form.id}`)
}

/**
 * 复制表单操作，弹窗输入新表单名称和描述，调用store方法
 */
const handleCopyForm = async (form: any) => {
  try {
    const { value: formName } = await ElMessageBox.prompt(
      '请输入新表单名称',
      '复制表单',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `${form.name}-副本`,
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '表单名称不能为空，且不超过100字符'
      }
    )
    // 可选：弹窗输入描述
    // const { value: description } = await ElMessageBox.prompt('请输入新表单描述（可选）', '表单描述', { ... })
    await formsStore.copyForm(form.id, { name: formName, copyData: false })
    fetchForms()
  } catch (error) {
    // 用户取消或出错
  }
}

/**
 * 通用表单状态变更操作
 * @param form 当前表单对象
 * @param status 目标状态（'draft' | 'published' | 'archived' | 'disabled'）
 * 交互说明：弹窗确认，确认后调用store.updateFormStatus，成功后刷新列表。
 */
const handleUpdateFormStatus = async (form: any, status: FormStatus) => {
  const statusTextMap: Record<FormStatus, string> = {
    draft: '草稿',
    published: '已发布',
    archived: '已归档',
    disabled: '已禁用'
  }
  try {
    await ElMessageBox.confirm(
      `确定将表单"${form.name}"状态变更为"${statusTextMap[status]}"?`,
      '状态变更确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )
    await formsStore.updateFormStatus(form.id, status)
    fetchForms()
    // ElMessage.success(`表单已${statusTextMap[status]}`)
  } catch (error) {
    // 用户取消或出错
  }
}
/**
 * 处理状态操作
 */
const handleStatusAction = ({ action, form }: any) => {
  handleUpdateFormStatus(form, action)
}

// 删除表单
const deleteForm = async (form: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除表单"${form.name}"吗？此操作不可恢复。`,
      '删除确认',
      { 
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    await formsStore.deleteForm(form.id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('表单删除失败')
    }
  }
}

</script>

<style scoped lang="scss">
.form-list-container {
  padding: 24px;
  background: #f5f6fa;
  min-height: 100vh;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  .header-left {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1 1 0%;
    .page-info {
      min-width: 0;
      .page-title, .page-description {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 40vw;
      }
    }
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    white-space: nowrap;
    .el-button {
      min-width: 80px;
      max-width: 120px;
      flex-shrink: 0;
    }
    .more-menu {
      display: none;
    }
  }
  @media (max-width: 900px) {
    .page-info .page-description {
      display: none;
    }
    .page-info .page-title {
      max-width: 50vw;
      font-size: 20px;
    }
    .header-right {
      .el-button {
        min-width: 60px;
        font-size: 13px;
        padding: 0 8px;
      }
    }
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
    padding: 16px;
    margin-bottom: 16px;
    
    .header-left {
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 100%;
      
      .page-info {
        text-align: center;
        .page-title {
          font-size: 18px;
          max-width: 100%;
          margin-bottom: 0;
        }
      }
    }
    
    .header-right {
      width: 100%;
      margin-top: 12px;
      justify-content: center;
      gap: 8px;
      
      .user-info {
        display: none;
      }
      
      .el-button:not(.more-menu-btn) {
        display: none;
      }
      
      .more-menu-btn {
        display: inline-flex !important;
        min-width: 40px;
        height: 40px;
        border-radius: 50%;
        padding: 0;
        justify-content: center;
        align-items: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3) !important;
        
        &:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
        }
        
        i {
          font-size: 18px;
        }
      }
    }
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
  
  .filter-left {
    display: flex;
    gap: 16px;
    
    .search-input,
    :deep(.el-select) {
      .el-input__wrapper {
        height: 40px !important;
        border-radius: 12px !important;
        background: #fff !important;
        border: 1px solid #e0e3ea !important;
        box-shadow: none !important;
        font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
      }
      .el-input__inner {
        font-size: 15px !important;
        color: #2c3e50 !important;
      }
    }
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  .stat-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: 24px;
    border: 2px solid rgba(102, 126, 234, 0.1);
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
    text-align: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 70px rgba(102, 126, 234, 0.2);
      border-color: rgba(102, 126, 234, 0.2);
    }
    
    .stat-number {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
    }
    
    .stat-label {
      font-size: 14px;
      color: #5a6c7d;
      font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
    }
  }
}

.action-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  color: #667eea;
  font-size: 14px;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
  
  i {
    font-size: 16px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
  position: relative;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 25px 70px rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.2);
    
    .form-icon {
      transform: scale(1.1);
      color: #4a5fe4;
    }
    
    .quick-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &:active {
    transform: translateY(-4px);
    box-shadow: 0 15px 50px rgba(102, 126, 234, 0.25);
  }
  
  // 添加点击波纹效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
  
  &:active::before {
    opacity: 1;
  }
  
  .form-card-main {
    .form-header {
      .form-header-content {
        .form-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .form-description {
          margin: 0 0 8px 0;
          color: #5a6c7d;
          font-size: 13px;
          line-height: 1.4;
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
          display: -webkit-box;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          
          i {
            margin-right: 4px;
            color: #667eea;
          }
        }
      }
    }
  }
}

.form-status {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  i {
    font-size: 14px;
  }
  
  &.draft {
    background: linear-gradient(135deg, #fef3e2 0%, #fde68a 100%);
    color: #d97700;
    border: 1px solid #fbbf24;
  }
  
  &.published {
    background: linear-gradient(135deg, #e8f5e8 0%, #bbf7d0 100%);
    color: #16a34a;
    border: 1px solid #22c55e;
  }
  
  &.archived {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    color: #64748b;
    border: 1px solid #cbd5e1;
  }
  
  &.disabled {
    background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
    color: #dc2626;
    border: 1px solid #f87171;
  }
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  opacity: 0.7;
  transform: translateY(4px);
  transition: all 0.3s ease;
  
  .el-button {
    height: 32px !important;
    min-width: 32px;
    border-radius: 8px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px !important;
    margin: 0 !important;
  }
}

.form-actions {
  position: absolute;
  bottom: 16px;
  right: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 2px solid rgba(102, 126, 234, 0.1) !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15) !important;
  
  .empty-icon {
    font-size: 64px;
    color: #ddd;
    margin-bottom: 20px;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: #666;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
  }
  
  p {
    margin: 0 0 20px 0;
    color: #999;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
}

// 玻璃按钮样式
.el-button {
  border-radius: 12px !important;
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
  
  &:not(.el-button--text) {
    background: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(10px) !important;
    color: #5a6c7d !important;
    border-color: rgba(102, 126, 234, 0.2) !important;
    height: 40px !important;
    
    &:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2) !important;
      border-color: rgba(102, 126, 234, 0.3) !important;
    }
  }
  
  &.el-button--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-color: transparent !important;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3) !important;
    height: 40px !important;
    
    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
  }
  
  &.el-button--success {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
    color: white !important;
    border-color: transparent !important;
    box-shadow: 0 4px 16px rgba(79, 172, 254, 0.3) !important;
    
    &:hover {
      background: linear-gradient(135deg, #42a5f5 0%, #00e1f5 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4) !important;
    }
  }
  
  &.el-button--danger {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%) !important;
    color: white !important;
    border-color: transparent !important;
    box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3) !important;
    
    &:hover {
      background: linear-gradient(135deg, #ff5722 0%, #e53935 100%) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4) !important;
    }
  }
  
  &.el-button--text {
    color: #667eea !important;
    background: transparent !important;
    
    &:hover {
      background: rgba(102, 126, 234, 0.1) !important;
    }
  }
}

// 用户信息卡片
.user-info {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border: 2px solid rgba(102, 126, 234, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.1) !important;
}

.form-icon-col {
  font-size: 60px;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-icon {
  color: #667eea;
  text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    color: #4a5fe4;
  }
}

// 分页组件样式优化
:deep(.el-pagination) {
  .el-pagination__total,
  .el-pagination__jump {
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
  }
  
  .el-pager li {
    border-radius: 8px !important;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
  }
}

// 下拉菜单样式优化
:deep(.el-dropdown-menu) {
  border-radius: 12px !important;
  backdrop-filter: blur(10px) !important;
  
  .el-dropdown-menu__item {
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
    
    &:hover {
      background: rgba(102, 126, 234, 0.1) !important;
    }
  }
}
</style> 