<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    <el-input
      type="textarea"
      :placeholder="widget.placeholder"
      v-model="widget.defaultValue"
      :disabled="widget.disabled"
      :clearable="widget.clearable"
      :rows="widget.rows"
      :autosize="widget.autosize ? parsedAutosize : false"
      :maxlength="widget.maxlength"
      :minlength="widget.minlength"
      :show-word-limit="widget.showWordLimit"
      :resize="widget.resize"
    />
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'TextareaWidget',
  label: '文本域',
  icon: 'mdi mdi-text-box-outline',
  category: 'form',

  defaultProps: {
    label: '文本域',
    placeholder: '请输入多行文本',
    required: false,
    defaultValue: '',
    disabled: false,
    clearable: false,
    rows: 4,
    autosize: false,
    autosizeMin: 2,
    autosizeMax: 8,
    maxlength: undefined,
    minlength: undefined,
    showWordLimit: false,
    resize: 'vertical',
    preset: 'basic'
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'placeholder', label: '占位符', type: 'input', placeholder: '请输入占位符' },
    { key: 'required', label: '必填', type: 'switch' },
    { key: 'defaultValue', label: '默认值', type: 'input', placeholder: '默认值' },
    { 
      key: 'preset', 
      label: '预设模式', 
      type: 'select', 
      options: [
        { label: '基础用法', value: 'basic' },
        { label: '自适应高度', value: 'autosize' },
        { label: '固定行数', value: 'fixed-rows' },
        { label: '字数限制', value: 'word-limit' },
        { label: '禁用状态', value: 'disabled' },
        { label: '不可调整', value: 'no-resize' }
      ]
    },
    { key: 'disabled', label: '禁用', type: 'switch' },
    { key: 'clearable', label: '可清空', type: 'switch' },
    { key: 'rows', label: '行数', type: 'number', placeholder: '默认行数' },
    { key: 'autosize', label: '自适应高度', type: 'switch' },
    { key: 'autosizeMin', label: '最小行数', type: 'number', placeholder: '自适应最小行数' },
    { key: 'autosizeMax', label: '最大行数', type: 'number', placeholder: '自适应最大行数' },
    { key: 'maxlength', label: '最大长度', type: 'number', placeholder: '最大字符数' },
    { key: 'minlength', label: '最小长度', type: 'number', placeholder: '最小字符数' },
    { key: 'showWordLimit', label: '显示字数', type: 'switch' },
    { 
      key: 'resize', 
      label: '调整尺寸', 
      type: 'select',
      options: [
        { label: '垂直', value: 'vertical' },
        { label: '水平', value: 'horizontal' },
        { label: '双向', value: 'both' },
        { label: '禁用', value: 'none' }
      ]
    }
  ]
}
</script>

<script setup lang="ts">
import { computed, watch } from 'vue'

defineOptions({ name: 'TextareaWidget' })
const props = defineProps<{
  widget: any
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

// 计算 autosize 属性
const parsedAutosize = computed(() => {
  if (!props.widget.autosize) return false
  return {
    minRows: props.widget.autosizeMin || 2,
    maxRows: props.widget.autosizeMax || 8
  }
})

// 监听预设模式变化，自动应用配置
watch(() => props.widget.preset, (newPreset) => {
  if (!newPreset) return
  
  const presets = {
    basic: {
      placeholder: '请输入多行文本',
      disabled: false,
      clearable: false,
      rows: 4,
      autosize: false,
      maxlength: undefined,
      showWordLimit: false,
      resize: 'vertical'
    },
    autosize: {
      placeholder: '自适应高度的文本域',
      autosize: true,
      autosizeMin: 2,
      autosizeMax: 6,
      clearable: true,
      resize: 'none'
    },
    'fixed-rows': {
      placeholder: '固定6行的文本域',
      rows: 6,
      autosize: false,
      resize: 'none'
    },
    'word-limit': {
      placeholder: '有字数限制的文本域',
      maxlength: 200,
      showWordLimit: true,
      clearable: true,
      rows: 5
    },
    disabled: {
      placeholder: '禁用状态',
      disabled: true,
      defaultValue: '这是一段不可编辑的文本内容，用于展示禁用状态下的文本域效果。'
    },
    'no-resize': {
      placeholder: '不可调整大小',
      resize: 'none',
      rows: 4
    }
  }
  
  const presetConfig = presets[newPreset as keyof typeof presets]
  if (presetConfig) {
    Object.assign(props.widget, presetConfig)
  }
}, { immediate: false })

function onClick() {
  emit('select', props.widget.id)
}
</script>

<style scoped>
.widget-content {
  width: 100%;
}

.widget-label {
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.required-mark {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 16px;
}

/* Element Plus Textarea 自定义样式 */
:deep(.el-textarea) {
  --el-input-border-radius: 12px;
  --el-input-border-color: rgba(102, 126, 234, 0.2);
  --el-input-hover-border-color: rgba(102, 126, 234, 0.4);
  --el-input-focus-border-color: rgba(102, 126, 234, 0.6);
}

:deep(.el-textarea__inner) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #2c3e50;
  font-weight: 500;
  line-height: 1.6;
}

:deep(.el-textarea__inner:hover) {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-textarea__inner::placeholder) {
  color: #a0aec0;
  font-weight: 400;
}

/* 字数统计样式 */
:deep(.el-input__count) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  font-weight: 500;
  border-radius: 8px;
  padding: 2px 8px;
}
</style> 