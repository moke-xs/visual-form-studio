<template>
    <div @click.stop="onClick" class="widget-content">
      <div class="widget-label" v-if="widget.label">
        {{ widget.label }}
        <span v-if="widget.required" class="required-mark">*</span>
      </div>
      <el-select
        :placeholder="widget.placeholder"
        :model-value="widget.defaultValue"
        style="width: 100%;"
        :disabled="widget.disabled"
      >
        <el-option
          v-for="opt in widget.options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
  </template>
  
  <script lang="ts">
  export const widgetMeta = {
  type: 'SelectWidget',
  label: '下拉框',
  icon: 'mdi mdi-menu-down',
  category: 'form',

    defaultProps: {
      label: '下拉框',
      placeholder: '请选择',
      required: false,
      defaultValue: '',
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' }
      ]
    },
    propertySchema: [
      { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
      { key: 'placeholder', label: '占位符', type: 'input', placeholder: '请输入占位符' },
      { key: 'required', label: '必填', type: 'switch' },
      { key: 'defaultValue', label: '默认值', type: 'input', placeholder: '默认值' },
      {
        key: 'options',
        label: '选项',
        type: 'array',
        minItems: 1,
        itemSchema: [
          { key: 'label', label: '选项名', type: 'input', width: '45%', defaultValue: '新选项' },
          { key: 'value', label: '值', type: 'input', width: '45%', defaultValue: '' }
        ]
      }
    ]
  }
  </script>
  
  <script setup lang="ts">
  // 组件唯一标识，供自动收集用
  defineOptions({ name: 'SelectWidget' })
  
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
  
  /* Element Plus Select 自定义样式 */
  :deep(.el-select) {
    --el-select-border-color-hover: rgba(102, 126, 234, 0.4);
    --el-select-input-focus-border-color: rgba(102, 126, 234, 0.6);
  }
  
  :deep(.el-select .el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(102, 126, 234, 0.15);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
  
  :deep(.el-select .el-input__wrapper:hover) {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    background: rgba(255, 255, 255, 1);
  }
  
  :deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 1);
  }
  
  :deep(.el-select .el-input__inner) {
    color: #2c3e50;
    font-weight: 500;
  }
  
  :deep(.el-select .el-input__suffix) {
    color: #667eea;
  }
  </style>