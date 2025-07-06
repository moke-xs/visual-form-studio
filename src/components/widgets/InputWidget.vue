<template>
    <div @click.stop="onClick" class="widget-content">
      <div class="widget-label" v-if="widget.label">
        {{ widget.label }}
        <span v-if="widget.required" class="required-mark">*</span>
      </div>
      <el-input
      :placeholder="widget.placeholder"
      v-model="widget.defaultValue"
        :disabled="widget.disabled"
        :clearable="widget.clearable"
        :show-password="widget.showPassword"
        :type="widget.inputType"
        :size="widget.size"
        :maxlength="widget.maxlength"
        :minlength="widget.minlength"
        :show-word-limit="widget.showWordLimit"
        
        :formatter="widget.formatter ? createFormatter(widget.formatter) : undefined"
        :parser="widget.parser ? createParser(widget.parser) : undefined"
      >
              <template #prefix v-if="widget.prefixIcon || widget.prefixText">
        <i v-if="widget.prefixIcon" :class="widget.prefixIcon"></i>
        <span v-if="widget.prefixText">{{ widget.prefixText }}</span>
      </template>
      <template #suffix v-if="widget.suffixIcon || widget.suffixText">
        <i v-if="widget.suffixIcon" :class="widget.suffixIcon"></i>
        <span v-if="widget.suffixText">{{ widget.suffixText }}</span>
      </template>
        <template #prepend v-if="widget.prependText">
          {{ widget.prependText }}
        </template>
        <template #append v-if="widget.appendText">
          {{ widget.appendText }}
        </template>
      </el-input>
    </div>
  </template>
  
  <script lang="ts">
  export const widgetMeta = {
  type: 'InputWidget',
  label: '输入框',
  icon: 'mdi mdi-form-textbox',
  category: 'form',

    defaultProps: {
      label: '输入框',
      placeholder: '请输入内容',
      required: false,
      defaultValue: '',
      disabled: false,
      clearable: false,
      showPassword: false,
      inputType: 'text',
      size: 'default',
      maxlength: undefined,
      minlength: undefined,
      showWordLimit: false,
      prefixIcon: '',
      suffixIcon: '',
      prefixText: '',
      suffixText: '',
      prependText: '',
      appendText: '',
      formatter: '',
      parser: '',
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
          { label: '密码框', value: 'password' },
          { label: '禁用状态', value: 'disabled' },
          { label: '一键清空', value: 'clearable' },
          { label: '带图标', value: 'with-icon' },
          { label: '前缀后缀', value: 'with-text' },
          { label: '复合输入', value: 'composite' },
          { label: '字数限制', value: 'word-limit' },
          { label: '格式化', value: 'formatted' }
        ]
      },
      { key: 'disabled', label: '禁用', type: 'switch' },
      { key: 'clearable', label: '可清空', type: 'switch' },
      { key: 'showPassword', label: '显示密码', type: 'switch' },
      { 
        key: 'inputType', 
        label: '输入类型', 
        type: 'select',
        options: [
          { label: '文本', value: 'text' },
          { label: '密码', value: 'password' },
          { label: '数字', value: 'number' },
          { label: '邮箱', value: 'email' },
          { label: '网址', value: 'url' },
          { label: '电话', value: 'tel' }
        ]
      },
      { 
        key: 'size', 
        label: '尺寸', 
        type: 'select',
        options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' }
        ]
      },
      { key: 'maxlength', label: '最大长度', type: 'number', placeholder: '最大字符数' },
      { key: 'minlength', label: '最小长度', type: 'number', placeholder: '最小字符数' },
      { key: 'showWordLimit', label: '显示字数', type: 'switch' },
          { key: 'prefixIcon', label: '前缀图标', type: 'icon', placeholder: '选择前缀图标' },
    { key: 'suffixIcon', label: '后缀图标', type: 'icon', placeholder: '选择后缀图标' },
      { key: 'prefixText', label: '前缀文本', type: 'input', placeholder: '前缀内容' },
      { key: 'suffixText', label: '后缀文本', type: 'input', placeholder: '后缀内容' },
      { key: 'prependText', label: '前置内容', type: 'input', placeholder: '前置内容' },
      { key: 'appendText', label: '后置内容', type: 'input', placeholder: '后置内容' },
      { key: 'formatter', label: '格式化', type: 'input', placeholder: '如：phone（手机号）' },
      { key: 'parser', label: '解析器', type: 'input', placeholder: '如：phone（手机号）' }
    ]
  }
  </script>
  
  <script setup lang="ts">
  import { watch } from 'vue'

  defineOptions({ name: 'InputWidget' })
  const props = defineProps<{
    widget: any
    selected: boolean
  }>()
  
  const emit = defineEmits<{
    select: [id: string]
  }>()
  
  // 监听预设模式变化，自动应用配置
  watch(() => props.widget.preset, (newPreset) => {
    if (!newPreset) return
    
    const presets = {
      basic: {
        placeholder: '请输入内容',
        disabled: false,
        clearable: false,
        showPassword: false,
        inputType: 'text',
        prefixIcon: '',
        suffixIcon: '',
        prefixText: '',
        suffixText: '',
        prependText: '',
        appendText: '',
        maxlength: undefined,
        showWordLimit: false,
        formatter: '',
        parser: ''
      },
      password: {
        placeholder: '请输入密码',
        inputType: 'password',
        showPassword: true,
        clearable: true,
        prefixIcon: 'mdi mdi-lock-outline'
      },
      disabled: {
        placeholder: '禁用状态',
        disabled: true,
        defaultValue: '不可编辑的内容'
      },
      clearable: {
        placeholder: '可一键清空',
        clearable: true,
        suffixIcon: '',
        defaultValue: '示例内容'
      },
      'with-icon': {
        placeholder: '带图标的输入框',
        prefixIcon: 'mdi mdi-account-outline',
        suffixIcon: 'mdi mdi-check-circle-outline'
      },
      'with-text': {
        placeholder: '请输入',
        prefixText: '￥',
        suffixText: '.00'
      },
      composite: {
        placeholder: '请输入网址',
        prependText: 'https://',
        appendText: '.com'
      },
      'word-limit': {
        placeholder: '有字数限制的输入框',
        maxlength: 50,
        showWordLimit: true,
        clearable: true
      },
      formatted: {
        placeholder: '手机号格式化',
        formatter: 'phone',
        parser: 'phone',
        maxlength: 13
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

  // 创建格式化函数
  function createFormatter(type: string) {
    switch (type) {
      case 'phone':
        return (value: string) => {
          if (!value) return ''
          const cleaned = value.replace(/\D/g, '')
          const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/)
          if (match) {
            return `${match[1]} ${match[2]} ${match[3]}`
          }
          return value
        }
      case 'card':
        return (value: string) => {
          if (!value) return ''
          return value.replace(/(.{4})/g, '$1 ').trim()
        }
      default:
        return undefined
    }
  }

  // 创建解析函数
  function createParser(type: string) {
    switch (type) {
      case 'phone':
      case 'card':
        return (value: string) => {
          if (!value) return ''
          return value.replace(/\s/g, '')
        }
      default:
        return undefined
    }
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
  
  /* Element Plus Input 自定义样式 */
  :deep(.el-input) {
    --el-input-border-radius: 12px;
    --el-input-border-color: rgba(102, 126, 234, 0.2);
    --el-input-hover-border-color: rgba(102, 126, 234, 0.4);
    --el-input-focus-border-color: rgba(102, 126, 234, 0.6);
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid rgba(102, 126, 234, 0.15);
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
  }
  
  :deep(.el-input__wrapper:hover) {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    background: rgba(255, 255, 255, 1);
  }
  
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
    border-color: rgba(102, 126, 234, 0.5);
    background: rgba(255, 255, 255, 1);
  }
  
  :deep(.el-input__inner) {
    color: #2c3e50;
    font-weight: 500;
  }
  
  :deep(.el-input__inner::placeholder) {
    color: #a0aec0;
    font-weight: 400;
  }
  
  /* 前置后置内容样式 */
  :deep(.el-input-group__prepend),
  :deep(.el-input-group__append) {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border: 2px solid rgba(102, 126, 234, 0.15);
    color: #667eea;
    font-weight: 500;
    border-radius: 12px;
  }
  
  /* 前后缀图标样式 */
  :deep(.el-input__prefix),
  :deep(.el-input__suffix) {
    color: #667eea;
  }
  
  :deep(.el-input__prefix i),
  :deep(.el-input__suffix i) {
    font-size: 16px;
  }
  </style>