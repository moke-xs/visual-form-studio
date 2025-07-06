<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    <el-checkbox-group
      v-if="Array.isArray(widget.options) && widget.options.length > 0"
      v-model="widget.defaultValue"
      :disabled="widget.disabled"
      :min="widget.min"
      :max="widget.max"
    >
      <el-checkbox
        v-for="(opt, idx) in widget.options"
        :key="idx"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-checkbox>
    </el-checkbox-group>
    <el-checkbox
      v-else
      v-model="widget.defaultValue"
      :value="widget.label"
      :disabled="widget.disabled"
      :border="widget.border"
      :indeterminate="widget.indeterminate"
    >
      {{ widget.label }}
    </el-checkbox>
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'CheckboxWidget',
  label: '多选框',
  icon: 'mdi mdi-checkbox-marked-outline',
  category: 'form',

  defaultProps: {
    label: '多选框',
    required: false,
    disabled: false,
    border: false,
    indeterminate: false,
    defaultValue: [],
    options: [
      { label: '选项一', value: '1', disabled: false },
      { label: '选项二', value: '2', disabled: false }
    ],
    min: undefined,
    max: undefined
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'required', label: '必填', type: 'switch' },
    { key: 'disabled', label: '禁用状态', type: 'switch' },
    { key: 'border', label: '带有边框', type: 'switch' },
    { key: 'indeterminate', label: '不确定状态', type: 'switch' },
    {
      key: 'options',
      label: '选项',
      type: 'array',
      minItems: 1,
      itemSchema: [
        { key: 'label', label: '选项名', type: 'input', width: '35%', defaultValue: '新选项' },
        { key: 'value', label: '值', type: 'input', width: '35%', defaultValue: '' },
        { key: 'disabled', label: '禁用', type: 'switch', defaultValue: false }
      ]
    }
  ]
}
</script>

<script setup lang="ts">

defineOptions({ name: 'CheckboxWidget' })

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

/* Element Plus Checkbox 自定义样式 */
:deep(.el-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.el-checkbox) {
  margin-right: 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-checkbox.is-bordered) {
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

:deep(.el-checkbox.is-bordered:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #667eea;
  font-weight: 500;
}

:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

:deep(.el-checkbox__label) {
  color: #2c3e50;
  font-weight: 500;
}
</style> 