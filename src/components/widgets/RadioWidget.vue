<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    <!-- 按钮样式的单选框组 -->
    <el-radio-group
      v-if="Array.isArray(widget.options) && widget.options.length > 0 && widget.displayType === 'radio-button'"
      v-model="widget.defaultValue"
      :disabled="widget.disabled"
      :size="widget.size"
    >
      <el-radio-button
        v-for="(opt, idx) in widget.options"
        :key="idx"
        :value="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-radio-button>
    </el-radio-group>
    <!-- 普通样式的单选框组 -->
    <el-radio-group
      v-else-if="Array.isArray(widget.options) && widget.options.length > 0"
      v-model="widget.defaultValue"
      :disabled="widget.disabled"
      :size="widget.size"
    >
      <el-radio
        v-for="(opt, idx) in widget.options"
        :key="idx"
        :value="opt.value"
        :disabled="opt.disabled"
        :border="widget.border"
      >
        {{ opt.label }}
      </el-radio>
    </el-radio-group>
    <!-- 单个单选框 -->
    <el-radio
      v-else
      v-model="widget.defaultValue"
      :value="widget.defaultValue"
      :disabled="widget.disabled"
      :border="widget.border"
      :size="widget.size"
    >
      {{ widget.label }}
    </el-radio>
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'RadioWidget',
  label: '单选框',
  icon: 'mdi mdi-radiobox-marked',
  category: 'form',

  defaultProps: {
    label: '单选框',
    required: false,
    disabled: false,
    border: false,
    displayType: 'radio', // 'radio' | 'radio-button'
    defaultValue: '1',
    size: undefined,
    options: [
      { label: '选项一', value: '1', disabled: false },
      { label: '选项二', value: '2', disabled: false }
    ]
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'required', label: '必填', type: 'switch' },
    { key: 'disabled', label: '禁用状态', type: 'switch' },
    { 
      key: 'displayType', 
      label: '显示样式', 
      type: 'select',
      options: [
        { label: '普通单选框', value: 'radio' },
        { label: '按钮样式', value: 'radio-button' }
      ]
    },
    { key: 'border', label: '带有边框', type: 'switch' },
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
    },
    { key: 'defaultValue', label: '默认值', type: 'input', placeholder: '默认选中值' },
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
defineOptions({ name: 'RadioWidget' })

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

/* Element Plus Radio 自定义样式 */
:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.el-radio) {
  margin-right: 0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-radio.is-bordered) {
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

:deep(.el-radio.is-bordered:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-radio.is-bordered.is-checked) {
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(102, 126, 234, 0.05);
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #667eea;
  border-color: #667eea;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #667eea;
  font-weight: 500;
}

/* 按钮样式单选框 */
:deep(.el-radio-button__inner) {
  border-radius: 8px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: #2c3e50;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-radio-button__inner:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
}

:deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
</style> 