// src/components/widgets/index.ts
// 组件收集和管理系统 - 完全基于JSON配置
import { ref } from 'vue'

// 用户权限类型
export type UserRole = 'admin' | 'vip' | 'user' | 'guest'

// 组件元数据接口（组件本身的定义）
export interface WidgetMeta {
  type: string
  label: string
  icon: string
  category: string
  version?: string
  description?: string
  defaultProps: Record<string, any>
  propertySchema: any[]
}

// 组件配置接口（JSON配置文件中的配置）
export interface WidgetConfig {
  type: string
  label: string
  icon: string
  category: string
  order: number
  visible: UserRole[]
  enabled: boolean
  description?: string
  version?: string
  lastUpdated?: string
}

// 当前用户角色
export const currentUserRole = ref<UserRole>('admin')

// 组件配置文件路径
const WIDGET_CONFIG_KEY = 'widget_configs'
const WIDGET_CONFIG_VERSION = '1.0.0'

// 自动收集 widgets 目录下所有 .vue 组件及其元数据
const modules = import.meta.glob('./*.vue', { eager: true })

const widgets: Record<string, any> = {}
const originalWidgetMetas: WidgetMeta[] = []

// 收集原始组件元数据（不包含order和visible）
for (const path in modules) {
  if (path.includes('ButtonWidget.vue')) continue; // 跳过按钮组件
  if (path.includes('CalendarWidget.vue')) continue; // 跳过日历组件
  const mod = modules[path] as any
  if (mod.widgetMeta) {
    const meta = mod.widgetMeta as WidgetMeta
    widgets[meta.type] = mod.default
    originalWidgetMetas.push(meta)
  }
}

// 默认组件配置模板 - 使用5的倍数排序
const DEFAULT_WIDGET_CONFIGS: Record<string, Omit<WidgetConfig, 'type' | 'label' | 'icon' | 'category'>> = {
  // Form 表单组件 (5-50)
  'InputWidget': { order: 5, visible: ['admin', 'vip', 'user'], enabled: true, description: '基础文本输入框，支持多种输入类型和验证' },
  'TextareaWidget': { order: 10, visible: ['admin', 'vip', 'user'], enabled: true, description: '多行文本输入框，支持自适应高度' },
  'SelectWidget': { order: 15, visible: ['admin', 'vip', 'user'], enabled: true, description: '下拉选择框，支持单选和搜索' },
  'RadioWidget': { order: 20, visible: ['admin', 'vip', 'user'], enabled: true, description: '单选按钮组，支持多种样式' },
  'CheckboxWidget': { order: 25, visible: ['admin', 'vip', 'user'], enabled: true, description: '多选框组，支持全选和部分选中' },
  'DatePickerWidget': { order: 30, visible: ['admin', 'vip', 'user'], enabled: true, description: '日期时间选择器，支持多种格式' },
  'UploadWidget': { order: 35, visible: ['admin', 'vip', 'user'], enabled: true, description: '文件上传组件，支持拖拽和多种上传模式' },
  'RateWidget': { order: 40, visible: ['admin', 'vip', 'user'], enabled: true, description: '评分组件，支持星级评分和自定义样式' },
  'CompositeInputWidget': { order: 45, visible: ['admin', 'vip'], enabled: true, description: '复合输入框，支持手机号、身份证等格式化输入' },
  
  // Basic 基础组件 (55-70)
  // 'ButtonWidget': { order: 55, visible: ['admin', 'vip', 'user'], enabled: true, description: '按钮组件，支持多种类型和样式' },
  
  // Data 数据展示 (75-100)
  'CarouselWidget': { order: 80, visible: ['admin', 'vip'], enabled: true, description: '轮播图组件，支持多种切换效果和自定义内容' }
}

// 加载组件配置
function loadWidgetConfigs(): Record<string, WidgetConfig> {
  try {
    const stored = localStorage.getItem(WIDGET_CONFIG_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // 检查版本兼容性
      if (parsed.version === WIDGET_CONFIG_VERSION) {
        return parsed.configs || {}
      }
    }
  } catch (error) {
    console.warn('Failed to load widget configs:', error)
  }
  return {}
}

// 保存组件配置
function saveWidgetConfigs(configs: Record<string, WidgetConfig>) {
  try {
    const data = {
      version: WIDGET_CONFIG_VERSION,
      lastUpdated: new Date().toISOString(),
      configs
    }
    localStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(data, null, 2))
    console.log('Widget configs saved:', Object.keys(configs).length, 'components')
  } catch (error) {
    console.error('Failed to save widget configs:', error)
  }
}

// 生成默认配置
function generateDefaultConfigs(): Record<string, WidgetConfig> {
  const configs: Record<string, WidgetConfig> = {}
  
  originalWidgetMetas.forEach(meta => {
    const defaultConfig = DEFAULT_WIDGET_CONFIGS[meta.type]
    configs[meta.type] = {
      type: meta.type,
      label: meta.label,
      icon: meta.icon,
      category: meta.category,
      order: defaultConfig?.order || 50,
      visible: defaultConfig?.visible || ['admin', 'vip', 'user'],
      enabled: defaultConfig?.enabled ?? true,
      description: defaultConfig?.description || `${meta.label}组件`,
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    }
  })
  
  return configs
}

// 初始化组件配置
let widgetConfigs = loadWidgetConfigs()
if (Object.keys(widgetConfigs).length === 0) {
  console.log('Generating default widget configs...')
  widgetConfigs = generateDefaultConfigs()
  saveWidgetConfigs(widgetConfigs)
  console.log('Default widget configs generated and saved')
}

// 获取过滤后的组件元数据
function getFilteredWidgetMetas(userRole: UserRole = currentUserRole.value): WidgetMeta[] {
  return originalWidgetMetas
    .filter(meta => {
      const config = widgetConfigs[meta.type]
      if (!config || !config.enabled) {
        console.log(`Widget ${meta.type} is disabled or not configured`)
        return false
      }
      
      // 检查权限
      const visibleRoles = config.visible || ['admin', 'vip', 'user']
      const hasPermission = visibleRoles.includes(userRole)
      if (!hasPermission) {
        console.log(`Widget ${meta.type} not visible for role ${userRole}`)
      }
      return hasPermission
    })
    .map(meta => {
      // 应用配置中的排序和其他属性
      const config = widgetConfigs[meta.type]
      return {
        ...meta,
        order: config?.order || 50,
        description: config?.description || meta.description
      }
    })
    .sort((a, b) => {
      // 按照配置的排序规则排序
      const orderA = (a as any).order || 50
      const orderB = (b as any).order || 50
      
      if (orderA !== orderB) {
        return orderA - orderB
      }
      
      // 如果排序相同，按标签字母顺序
      return a.label.localeCompare(b.label)
    })
}

// 导出的组件元数据（响应式）
export const widgetMetas = ref<WidgetMeta[]>(getFilteredWidgetMetas())

// 更新单个组件配置
export function updateWidgetConfig(type: string, config: Partial<WidgetConfig>) {
  const meta = originalWidgetMetas.find(m => m.type === type)
  if (!meta) {
    console.error(`Widget ${type} not found`)
    return false
  }

  if (widgetConfigs[type]) {
    Object.assign(widgetConfigs[type], {
      ...config,
      lastUpdated: new Date().toISOString()
    })
  } else {
    widgetConfigs[type] = {
      type,
      label: meta.label,
      icon: meta.icon,
      category: meta.category,
      order: config.order || 50,
      visible: config.visible || ['admin', 'vip', 'user'],
      enabled: config.enabled ?? true,
      description: config.description || `${meta.label}组件`,
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      ...config
    }
  }
  
  saveWidgetConfigs(widgetConfigs)
  refreshWidgetMetas()
  return true
}

// 批量更新组件配置
export function updateWidgetConfigs(configs: Record<string, Partial<WidgetConfig>>) {
  let updated = 0
  Object.entries(configs).forEach(([type, config]) => {
    if (updateWidgetConfig(type, config)) {
      updated++
    }
  })
  console.log(`Updated ${updated} widget configs`)
  return updated
}

// 重置组件配置
export function resetWidgetConfigs() {
  console.log('Resetting widget configs to defaults...')
  widgetConfigs = generateDefaultConfigs()
  saveWidgetConfigs(widgetConfigs)
  refreshWidgetMetas()
  console.log('Widget configs reset complete')
}

// 刷新组件元数据
export function refreshWidgetMetas(userRole?: UserRole) {
  const role = userRole || currentUserRole.value
  const filtered = getFilteredWidgetMetas(role)
  widgetMetas.value = filtered
  console.log(`Refreshed widget metas for role ${role}:`, filtered.length, 'components visible')
}

// 设置用户角色
export function setUserRole(role: UserRole) {
  console.log(`Switching user role from ${currentUserRole.value} to ${role}`)
  currentUserRole.value = role
  refreshWidgetMetas(role)
}

// 获取组件配置（只读副本）
export function getWidgetConfigs() {
  return JSON.parse(JSON.stringify(widgetConfigs))
}

// 获取原始组件元数据（只读副本）
export function getOriginalWidgetMetas() {
  return JSON.parse(JSON.stringify(originalWidgetMetas))
}

// 重新生成配置（保留自定义设置）
export function regenerateConfigs() {
  console.log('Regenerating widget configs...')
  const newDefaults = generateDefaultConfigs()
  
  // 保留现有的自定义配置
  Object.keys(widgetConfigs).forEach(type => {
    if (newDefaults[type]) {
      // 保留用户自定义的配置，但更新基本信息
      newDefaults[type] = {
        ...newDefaults[type],
        ...widgetConfigs[type],
        // 确保基本信息是最新的
        type: newDefaults[type].type,
        label: newDefaults[type].label,
        icon: newDefaults[type].icon,
        category: newDefaults[type].category,
        lastUpdated: new Date().toISOString()
      }
    }
  })
  
  // 添加新组件的默认配置
  Object.keys(newDefaults).forEach(type => {
    if (!widgetConfigs[type]) {
      console.log(`Adding new widget config: ${type}`)
    }
  })
  
  widgetConfigs = newDefaults
  saveWidgetConfigs(widgetConfigs)
  refreshWidgetMetas()
  
  console.log('Widget configs regenerated:', Object.keys(widgetConfigs).length, 'components')
  return getWidgetConfigs()
}

// 导出配置到JSON文件
export function exportConfigs() {
  const data = {
    version: WIDGET_CONFIG_VERSION,
    exportTime: new Date().toISOString(),
    totalComponents: Object.keys(widgetConfigs).length,
    configs: widgetConfigs
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `widget-configs-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('Widget configs exported')
}

// 从JSON文件导入配置
export function importConfigs(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.configs && typeof data.configs === 'object') {
          widgetConfigs = data.configs
          saveWidgetConfigs(widgetConfigs)
          refreshWidgetMetas()
          console.log('Widget configs imported successfully')
          resolve(true)
        } else {
          console.error('Invalid config file format')
          resolve(false)
        }
      } catch (error) {
        console.error('Failed to import configs:', error)
        resolve(false)
      }
    }
    reader.readAsText(file)
  })
}

// 获取配置统计信息
export function getConfigStats() {
  const total = Object.keys(widgetConfigs).length
  const enabled = Object.values(widgetConfigs).filter(c => c.enabled).length
  const byCategory = Object.values(widgetConfigs).reduce((acc, config) => {
    acc[config.category] = (acc[config.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total,
    enabled,
    disabled: total - enabled,
    byCategory,
    byRole: {
      admin: Object.values(widgetConfigs).filter(c => c.visible.includes('admin')).length,
      vip: Object.values(widgetConfigs).filter(c => c.visible.includes('vip')).length,
      user: Object.values(widgetConfigs).filter(c => c.visible.includes('user')).length,
      guest: Object.values(widgetConfigs).filter(c => c.visible.includes('guest')).length
    }
  }
}

console.log('Widget management system initialized')
console.log('Config stats:', getConfigStats())

export { widgets }