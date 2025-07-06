<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    <el-date-picker
      v-model="widget.defaultValue"
      :type="widget.pickerType"
      :placeholder="widget.placeholder"
      :start-placeholder="widget.startPlaceholder"
      :end-placeholder="widget.endPlaceholder"
      :readonly="widget.readonly"
      :disabled="widget.disabled"
      :clearable="widget.clearable"
      :editable="widget.editable"
      :format="widget.format"
      :value-format="widget.valueFormat"
      :range-separator="widget.rangeSeparator"
      :size="widget.size"
      style="width: 100%;"
    />
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'DatePickerWidget',
  label: '日期选择器',
  icon: 'mdi mdi-calendar-range',
  category: 'form',

  defaultProps: {
    label: '日期',
    required: false,
    readonly: false,
    disabled: false,
    clearable: true,
    editable: true,
    placeholder: '请选择日期',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    pickerType: 'date',
    format: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD',
    rangeSeparator: '-',
    defaultValue: '',
    size: undefined
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'required', label: '必填', type: 'switch' },
    { key: 'readonly', label: '只读', type: 'switch' },
    { key: 'disabled', label: '禁用状态', type: 'switch' },
    { key: 'clearable', label: '可清除', type: 'switch' },
    { key: 'editable', label: '可编辑', type: 'switch' },
    { key: 'placeholder', label: '占位符', type: 'input', placeholder: '请输入占位符' },
    { key: 'startPlaceholder', label: '开始占位符', type: 'input', placeholder: '范围选择开始占位符' },
    { key: 'endPlaceholder', label: '结束占位符', type: 'input', placeholder: '范围选择结束占位符' },
    {
      key: 'pickerType',
      label: '选择器类型',
      type: 'select',
      options: [
        { label: '日期', value: 'date' },
        { label: '日期时间', value: 'datetime' },
        { label: '日期范围', value: 'daterange' },
        { label: '日期时间范围', value: 'datetimerange' },
        { label: '月份', value: 'month' },
        { label: '年份', value: 'year' }
      ]
    },
    { key: 'format', label: '显示格式', type: 'input', placeholder: 'YYYY-MM-DD' },
    { key: 'valueFormat', label: '值格式', type: 'input', placeholder: 'YYYY-MM-DD' },
    { key: 'rangeSeparator', label: '范围分隔符', type: 'input', placeholder: '-' },
    {
      key: 'size',
      label: '尺寸',
      type: 'select',
      clearable: true,
      placeholder: '请选择尺寸',
      options: [
        { label: '大', value: 'large' },
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' }
      ]
    }
  ]
}
</script>

<script setup lang="ts">
defineOptions({ name: 'DatePickerWidget' })

const props = defineProps<{
  widget: any
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

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

/* Element Plus DatePicker 自定义样式 */
:deep(.el-date-editor) {
  --el-date-editor-border-radius: 12px;
}

:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

:deep(.el-date-editor .el-input__wrapper:hover) {
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-date-editor .el-input__wrapper.is-focus) {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-date-editor .el-input__inner) {
  color: #2c3e50;
  font-weight: 500;
}

:deep(.el-date-editor .el-input__inner::placeholder) {
  color: #a0aec0;
  font-weight: 400;
}

:deep(.el-date-editor .el-input__suffix) {
  color: #667eea;
}
</style> 