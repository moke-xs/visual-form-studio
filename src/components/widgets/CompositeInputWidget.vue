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
      :type="widget.inputType"
      :maxlength="widget.maxlength"
      :show-word-limit="widget.showWordLimit"

      :formatter="createFormatter(widget.compositeType)"
      :parser="createParser(widget.compositeType)"
    >
      <template #prefix v-if="widget.prefixIcon">
        <i :class="widget.prefixIcon"></i>
      </template>
      <template #suffix v-if="widget.suffixIcon">
        <i :class="widget.suffixIcon"></i>
      </template>
      <template #prepend v-if="widget.prependText">
        {{ widget.prependText }}
      </template>
      <template #append v-if="widget.appendText">
        {{ widget.appendText }}
      </template>
    </el-input>
    <div v-if="widget.showHint && widget.hint" class="input-hint">
      <i class="mdi mdi-information-outline"></i>
      {{ widget.hint }}
    </div>
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'CompositeInputWidget',
  label: '复合输入框',
  icon: 'mdi mdi-form-textbox-password',
  category: 'form',

  defaultProps: {
    label: '复合输入框',
    placeholder: '请选择输入类型',
    required: false,
    defaultValue: '',
    disabled: false,
    clearable: true,
    inputType: 'text',
    maxlength: undefined,
    showWordLimit: false,
    prefixIcon: '',
    suffixIcon: '',
    prependText: '',
    appendText: '',
    compositeType: 'phone',
    showHint: true,
    hint: '请输入正确的手机号码格式'
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { 
      key: 'compositeType', 
      label: '输入类型', 
      type: 'select', 
      options: [
        { label: '手机号码', value: 'phone' },
        { label: '身份证号', value: 'idcard' },
        { label: '邮箱地址', value: 'email' },
        { label: '网站地址', value: 'url' },
        { label: '银行卡号', value: 'bankcard' },
        { label: '邮政编码', value: 'postcode' },
        { label: '车牌号码', value: 'license' },
        { label: '固定电话', value: 'landline' }
      ]
    },
    { key: 'required', label: '必填', type: 'switch' },
    { key: 'defaultValue', label: '默认值', type: 'input', placeholder: '默认值' },
    { key: 'disabled', label: '禁用', type: 'switch' },
    { key: 'clearable', label: '可清空', type: 'switch' },
    { key: 'showWordLimit', label: '显示字数', type: 'switch' },
    { key: 'showHint', label: '显示提示', type: 'switch' },
    { key: 'hint', label: '提示信息', type: 'input', placeholder: '输入提示信息' },
    { key: 'prependText', label: '前置内容', type: 'input', placeholder: '如：https://' },
    { key: 'appendText', label: '后置内容', type: 'input', placeholder: '如：.com' }
  ]
}
</script>

<script setup lang="ts">
import { watch } from 'vue'

defineOptions({ name: 'CompositeInputWidget' })
const props = defineProps<{
  widget: any
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

// 监听复合类型变化，自动应用配置
watch(() => props.widget.compositeType, (newType) => {
  if (!newType) return
  
  // 先清空所有配置，避免之前的配置残留
  Object.assign(props.widget, {
    prefixIcon: '',
    suffixIcon: '',
    prependText: '',
    appendText: '',
    maxlength: undefined,
    inputType: 'text'
  })
  
  const configs = {
    phone: {
      placeholder: '请输入手机号码',
      prefixIcon: 'mdi mdi-phone-outline',
      maxlength: 13,
      hint: '请输入正确的手机号码格式，如：138 0013 8000',
      inputType: 'tel'
    },
    idcard: {
      placeholder: '请输入身份证号码',
      prefixIcon: 'mdi mdi-card-account-details-outline',
      maxlength: 21,
      hint: '请输入18位身份证号码，格式：110101 1990 0101 001X',
      inputType: 'text'
    },
    email: {
      placeholder: '请输入邮箱地址',
      prefixIcon: 'mdi mdi-email-outline',
      suffixIcon: 'mdi mdi-at',
      hint: '请输入有效的邮箱地址，如：example@domain.com',
      inputType: 'email'
    },
    url: {
      placeholder: '请输入网站地址',
      prependText: 'https://',
      appendText: '.com',
      hint: '请输入网站地址，如：www.example',
      inputType: 'url'
    },
    bankcard: {
      placeholder: '请输入银行卡号',
      prefixIcon: 'mdi mdi-credit-card-outline',
      maxlength: 23,
      hint: '请输入16-19位银行卡号，格式：6222 0000 0000 0000',
      inputType: 'text'
    },
    postcode: {
      placeholder: '请输入邮政编码',
      prefixIcon: 'mdi mdi-map-marker-outline',
      maxlength: 6,
      hint: '请输入6位邮政编码，如：100000',
      inputType: 'text'
    },
    license: {
      placeholder: '请输入车牌号码',
      prefixIcon: 'mdi mdi-car',
      maxlength: 8,
      hint: '请输入车牌号码，如：京A12345 或 京AD12345',
      inputType: 'text'
    },
    landline: {
      placeholder: '请输入固定电话',
      prefixIcon: 'mdi mdi-phone-classic',
      maxlength: 13,
      hint: '请输入固定电话，如：010-12345678',
      inputType: 'tel'
    }
  }
  
  const config = configs[newType as keyof typeof configs]
  if (config) {
    Object.assign(props.widget, config)
  }
}, { immediate: true })

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
    case 'idcard':
      return (value: string) => {
        if (!value) return ''
        const cleaned = value.replace(/[^\dXx]/g, '')
        const match = cleaned.match(/^(\d{6})(\d{4})(\d{4})(\d{3}[\dXx])$/)
        if (match) {
          return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`
        }
        return value
      }
    case 'bankcard':
      return (value: string) => {
        if (!value) return ''
        const cleaned = value.replace(/\D/g, '')
        return cleaned.replace(/(.{4})/g, '$1 ').trim()
      }
    case 'landline':
      return (value: string) => {
        if (!value) return ''
        const cleaned = value.replace(/\D/g, '')
        const match = cleaned.match(/^(\d{3,4})(\d{7,8})$/)
        if (match) {
          return `${match[1]}-${match[2]}`
        }
        return value
      }
    default:
      return undefined
  }
}

// 创建解析函数
function createParser(type: string) {
  switch (type) {
    case 'phone':
    case 'idcard':
    case 'bankcard':
    case 'landline':
      return (value: string) => {
        if (!value) return ''
        return value.replace(/[\s-]/g, '')
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

.input-hint {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.input-hint i {
  margin-right: 6px;
  font-size: 14px;
  color: #667eea;
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