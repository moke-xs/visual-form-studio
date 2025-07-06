# 组件管理系统说明

## 概述

本系统采用**完全基于JSON配置**的组件管理方式，实现了组件的动态排序、权限控制、启用/禁用等功能。组件本身只需要定义基本的元数据，所有的排序和权限配置都通过JSON配置文件进行管理。

## 核心特性

### 1. **权限管理**
- 支持4种用户角色：`admin`（管理员）、`vip`（VIP用户）、`user`（普通用户）、`guest`（访客）
- 每个组件可单独配置可见权限
- 实时角色切换，动态显示组件

### 2. **智能排序**
- 使用5的倍数进行排序（5, 10, 15, 20...），便于插入新组件
- 支持自定义排序值
- 同分类内自动按配置排序

### 3. **配置持久化**
- 自动保存到localStorage
- 支持导出/导入JSON配置文件
- 版本控制和兼容性检查

### 4. **可视化管理**
- 提供`WidgetManager`组件进行可视化管理
- 实时编辑排序、权限、描述等
- 统计信息展示

## 当前组件配置

### Form 表单组件 (5-50)
```typescript
{
  'InputWidget': { order: 5, visible: ['admin', 'vip', 'user'], enabled: true },
  'TextareaWidget': { order: 10, visible: ['admin', 'vip', 'user'], enabled: true },
  'SelectWidget': { order: 15, visible: ['admin', 'vip', 'user'], enabled: true },
  'RadioWidget': { order: 20, visible: ['admin', 'vip', 'user'], enabled: true },
  'CheckboxWidget': { order: 25, visible: ['admin', 'vip', 'user'], enabled: true },
  'DatePickerWidget': { order: 30, visible: ['admin', 'vip', 'user'], enabled: true },
  'UploadWidget': { order: 35, visible: ['admin', 'vip', 'user'], enabled: true },
  'RateWidget': { order: 40, visible: ['admin', 'vip', 'user'], enabled: true },
  'CompositeInputWidget': { order: 45, visible: ['admin', 'vip'], enabled: true }
}
```

### Basic 基础组件 (55-70)
```typescript
{
  'ButtonWidget': { order: 55, visible: ['admin', 'vip', 'user'], enabled: true }
}
```

### Data 数据展示 (75-100)
```typescript
{
  'CalendarWidget': { order: 75, visible: ['admin', 'vip', 'user'], enabled: true },
  'CarouselWidget': { order: 80, visible: ['admin', 'vip'], enabled: true }
}
```

## 组件开发指南

### 1. **组件元数据定义**
组件只需要定义基本元数据，**不需要**包含`order`和`visible`字段：

```typescript
export const widgetMeta = {
  type: 'YourWidget',
  label: '你的组件',
  icon: 'mdi mdi-your-icon',
  category: 'form',
  // 不需要 order 和 visible 字段
  defaultProps: {
    // 组件默认属性
  },
  propertySchema: [
    // 属性配置
  ]
}
```

### 2. **自动配置生成**
系统会自动为新组件生成默认配置：
- 默认排序：50
- 默认权限：`['admin', 'vip', 'user']`
- 默认启用：`true`

### 3. **自定义配置**
在`src/components/widgets/index.ts`的`DEFAULT_WIDGET_CONFIGS`中添加自定义配置：

```typescript
const DEFAULT_WIDGET_CONFIGS = {
  'YourWidget': { 
    order: 25, 
    visible: ['admin', 'vip'], 
    enabled: true, 
    description: '你的组件描述' 
  }
}
```

## 使用方式

### 1. **组件管理页面**
```vue
<template>
  <WidgetManager />
</template>

<script setup>
import WidgetManager from '@/components/WidgetManager.vue'
</script>
```

### 2. **程序化操作**
```typescript
import { 
  updateWidgetConfig, 
  setUserRole, 
  exportConfigs,
  importConfigs,
  getConfigStats 
} from '@/components/widgets'

// 更新组件配置
updateWidgetConfig('InputWidget', { 
  order: 8, 
  visible: ['admin', 'vip'] 
})

// 切换用户角色
setUserRole('vip')

// 导出配置
exportConfigs()

// 获取统计信息
const stats = getConfigStats()
```

## 排序规则建议

### Form 表单组件 (5-50)
- **基础输入类**：5-20 (输入框、文本域、选择器、单选、多选)
- **高级输入类**：25-35 (日期选择、上传、评分)
- **复合组件类**：40-50 (复合输入框等)

### Basic 基础组件 (55-70)
- **按钮类**：55-60
- **文本类**：61-65
- **布局类**：66-70

### Data 数据展示 (75-100)
- **日历时间类**：75-80
- **图表类**：81-90
- **媒体类**：91-100

## 配置文件结构

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "configs": {
    "InputWidget": {
      "type": "InputWidget",
      "label": "输入框",
      "icon": "mdi mdi-form-textbox",
      "category": "form",
      "order": 5,
      "visible": ["admin", "vip", "user"],
      "enabled": true,
      "description": "基础文本输入框，支持多种输入类型和验证",
      "version": "1.0.0",
      "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## API 参考

### 主要函数

| 函数名 | 描述 | 参数 | 返回值 |
|--------|------|------|--------|
| `updateWidgetConfig` | 更新单个组件配置 | `(type: string, config: Partial<WidgetConfig>)` | `boolean` |
| `updateWidgetConfigs` | 批量更新组件配置 | `(configs: Record<string, Partial<WidgetConfig>>)` | `number` |
| `setUserRole` | 设置用户角色 | `(role: UserRole)` | `void` |
| `resetWidgetConfigs` | 重置所有配置 | `()` | `void` |
| `regenerateConfigs` | 重新生成配置 | `()` | `WidgetConfig[]` |
| `exportConfigs` | 导出配置文件 | `()` | `void` |
| `importConfigs` | 导入配置文件 | `(file: File)` | `Promise<boolean>` |
| `getConfigStats` | 获取统计信息 | `()` | `ConfigStats` |

### 类型定义

```typescript
type UserRole = 'admin' | 'vip' | 'user' | 'guest'

interface WidgetConfig {
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
```

## 注意事项

1. **配置优先级**：JSON配置 > 组件默认配置
2. **版本兼容性**：系统会检查配置文件版本，不兼容时会重新生成
3. **性能优化**：配置缓存在内存中，避免重复解析
4. **数据安全**：配置文件包含版本和时间戳，支持回滚
5. **扩展性**：新增组件时会自动生成默认配置，无需手动维护

## 最佳实践

1. **排序设计**：使用5的倍数，为后续组件预留空间
2. **权限设计**：根据组件复杂度设置合适的权限等级
3. **配置备份**：定期导出配置文件进行备份
4. **测试验证**：切换不同角色测试组件可见性
5. **文档更新**：新增组件时及时更新配置说明 