<template>
  <div class="form-renderer">
    <div v-if="formConfig && formConfig.components" class="form-content">
      <!-- 表单标题和描述 -->
      <div class="form-header" v-if="formInfo">
        <h1 class="form-title">{{ formInfo.name }}</h1>
        <p class="form-description" v-if="formInfo.description">
          {{ formInfo.description }}
        </p>
            <!-- 表单元信息 -->
            <div class="form-meta-info">
              <div class="meta-item">
                <el-icon><Calendar /></el-icon>
                <span>创建于 {{ formatDate(formInfo.createdAt) }}</span>
              </div>
              <div class="meta-item" v-if="formInfo.viewCount">
                <el-icon><View /></el-icon>
                <span>{{ formInfo.viewCount }} 次浏览</span>
              </div>
              <div class="meta-item" v-if="formInfo.submitCount">
                <el-icon><Document /></el-icon>
                <span>{{ formInfo.submitCount }} 次提交</span>
              </div>
            </div>
      </div>
      <!-- 表单内容 -->
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="rendered-form"
        @submit.prevent="handleSubmit">
        <div v-for="(component, index) in formConfig.components" :key="component.id || index" class="form-item-container">
          <div class="form-item-vertical">
            <div class="form-item-label">
              {{ component.label || component.props?.label }}
              <span v-if="component.required || component.props?.required" style="color:#f56c6c;margin-left:4px;">*</span>
            </div>
            <el-form-item
              :prop="component.field || component.props?.field"
              :required="component.required || component.props?.required"
              label-width="0"
              style="margin-bottom:0;"
            >
              <!-- 输入框 -->
              <el-input
                v-if="component.type === 'InputWidget'"
                v-model="formData[component.field || component.props?.field]"
                :placeholder="component.placeholder || component.props?.placeholder"
                :disabled="component.disabled || component.props?.disabled"
                :clearable="component.clearable || component.props?.clearable"
                :show-password="component.showPassword || component.props?.showPassword"
                :type="component.inputType || component.props?.inputType"
                :size="component.size || component.props?.size"
                :maxlength="component.maxlength || component.props?.maxlength"
                :minlength="component.minlength || component.props?.minlength"
                :show-word-limit="component.showWordLimit || component.props?.showWordLimit"
              />
              <!-- 多行文本框 -->
              <el-input
                v-else-if="component.type === 'TextareaWidget'"
                v-model="formData[component.field || component.props?.field]"
                type="textarea"
                :placeholder="component.placeholder || component.props?.placeholder"
                :disabled="component.disabled || component.props?.disabled"
                :clearable="component.clearable || component.props?.clearable"
                :rows="component.rows || component.props?.rows"
                :maxlength="component.maxlength || component.props?.maxlength"
                :show-word-limit="component.showWordLimit || component.props?.showWordLimit"
              />
              <!-- 下拉框 -->
              <el-select
                v-else-if="component.type === 'SelectWidget'"
                v-model="formData[component.field || component.props?.field]"
                :placeholder="component.placeholder || component.props?.placeholder"
                :disabled="component.disabled || component.props?.disabled"
                :clearable="component.clearable || component.props?.clearable"
                :multiple="component.multiple || component.props?.multiple"
              >
                <el-option
                  v-for="opt in component.options || component.props?.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
              <!-- 多选框 -->
              <el-checkbox-group
                v-else-if="component.type === 'CheckboxWidget'"
                v-model="formData[component.field || component.props?.field]"
              >
                <el-checkbox
                  v-for="opt in component.options || component.props?.options"
                  :key="opt.value"
                  :value="opt.value"
                >{{ opt.label }}</el-checkbox>
              </el-checkbox-group>
              <!-- 日期选择器 -->
              <el-date-picker
                v-else-if="component.type === 'DatePickerWidget'"
                v-model="formData[component.field || component.props?.field]"
                type="date"
                :placeholder="component.placeholder || component.props?.placeholder"
                :disabled="component.disabled || component.props?.disabled"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
              <!-- 单选框 -->
              <el-radio-group
                v-else-if="component.type === 'RadioWidget'"
                v-model="formData[component.field || component.props?.field]"
              >
                <el-radio
                  v-for="opt in component.options || component.props?.options"
                  :key="opt.value"
                  :value="opt.value"
                >{{ opt.label }}</el-radio>
              </el-radio-group>
              <!-- 评分 -->
              <el-rate
                v-else-if="component.type === 'RateWidget'"
                v-model="formData[component.field || component.props?.field]"
                :max="component.max || component.props?.max || 5"
                :allow-half="component.allowHalf || component.props?.allowHalf"
                :show-text="component.showText || component.props?.showText"
                :texts="component.texts || component.props?.texts"
                :disabled="component.disabled || component.props?.disabled"
              />
              <!-- 文件上传 -->
              <el-upload
                v-else-if="component.type === 'UploadWidget'"
                v-model:file-list="formData[component.field || component.props?.field]"
                :action="component.action || component.props?.action"
                :multiple="component.multiple || component.props?.multiple"
                :limit="component.limit || component.props?.limit"
                :accept="component.accept || component.props?.accept"
                :show-file-list="component.showFileList || component.props?.showFileList"
                :drag="component.drag || component.props?.drag"
                :auto-upload="component.autoUpload || component.props?.autoUpload"
                :disabled="component.disabled || component.props?.disabled"
              >
                <el-button type="primary">{{ component.buttonText || component.props?.buttonText || '点击上传' }}</el-button>
              </el-upload>
              <!-- 复合输入 -->
              <el-input
                v-else-if="component.type === 'CompositeInputWidget'"
                v-model="formData[component.field || component.props?.field]"
                :placeholder="component.placeholder || component.props?.placeholder"
                :disabled="component.disabled || component.props?.disabled"
                :clearable="component.clearable || component.props?.clearable"
                :maxlength="component.maxlength || component.props?.maxlength"
                :type="component.inputType || component.props?.inputType || 'text'"
              >
                <template #prepend v-if="component.prependText || component.props?.prependText">
                  {{ component.prependText || component.props?.prependText }}
                </template>
                <template #append v-if="component.appendText || component.props?.appendText">
                  {{ component.appendText || component.props?.appendText }}
                </template>
              </el-input>
              <!-- 其它类型，仍用原有动态组件 -->
              <component
                v-else
                :is="getWidgetComponent(component.type)"
                :widget="component"
                :selected="false"
                class="render-mode"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 表单提交按钮 -->
        <div class="form-actions" v-if="!readonly && showSubmit">
          <el-button @click="handleReset" v-if="showReset">
            重置
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ submitText || '提交' }}
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-form">
      <i class="mdi mdi-file-document-outline"></i>
      <p>表单配置为空或无效</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Calendar, View, Document } from '@element-plus/icons-vue'
import { widgets } from './widgets'

interface FormComponent {
  id?: string
  type: string
  label?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  showPassword?: boolean
  inputType?: string
  size?: string
  maxlength?: number
  minlength?: number
  showWordLimit?: boolean
  rows?: number
  multiple?: boolean
  // Radio/Select/Checkbox
  options?: any[]
  // RateWidget
  max?: number
  allowHalf?: boolean
  showText?: boolean
  texts?: string[]
  // UploadWidget
  action?: string
  limit?: number
  accept?: string
  showFileList?: boolean
  drag?: boolean
  autoUpload?: boolean
  buttonText?: string
  // CompositeInputWidget
  prependText?: string
  appendText?: string
  props?: Record<string, any>
  field?: string
  defaultValue?: any
  required?: boolean
}

interface FormConfig {
  components: FormComponent[]
  settings?: Record<string, any>
}

interface Props {
  formConfig?: FormConfig
  formInfo?: any
  readonly?: boolean
  showMeta?: boolean
  showWelcome?: boolean
  showSubmit?: boolean
  showReset?: boolean
  submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  showMeta: true,
  showWelcome: true,
  showSubmit: true,
  showReset: true,
  submitText: '提交'
})

const emit = defineEmits<{
  submit: [data: Record<string, any>]
  reset: []
  buttonClick: [component: FormComponent]
}>()

const formRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({})
const submitting = ref(false)

// 获取组件实例
const getWidgetComponent = (type: string) => {
  return widgets[type] || null
}


// 表单验证规则
const formRules = computed(() => {
  const rules: Record<string, any> = {}

  if (props.formConfig?.components) {
    props.formConfig.components.forEach(component => {
      const fieldName = component.props?.field || component.field
      const isRequired = component.props?.required || component.required

      if (fieldName && isRequired) {
        rules[fieldName] = [
          { required: true, message: '请填写', trigger: 'blur' }
        ]
      }
    })
  }

  return rules
})

// 初始化表单数据
const initFormData = () => {
  if (props.formConfig?.components) {
    props.formConfig.components.forEach(component => {
      // 支持两种数据结构：props.field 和直接 field
      const fieldName = component.props?.field || component.field
      if (fieldName && !(fieldName in formData)) {
        // 根据组件类型设置默认值
        const defaultValue = component.props?.defaultValue || component.defaultValue
        switch (component.type) {
          case 'CheckboxWidget':
            // CheckboxWidget根据是否有options决定类型
            if (component.options && Array.isArray(component.options) && component.options.length > 0) {
              // 多选组模式，需要数组
              formData[fieldName] = Array.isArray(defaultValue) ? defaultValue : []
            } else {
              // 单个复选框模式，需要布尔值
              formData[fieldName] = defaultValue === true || defaultValue === 'true' || defaultValue === 1
            }
            break
          case 'RateWidget':
            // 确保RateWidget的默认值是数字类型
            const rateValue = defaultValue !== undefined && defaultValue !== null ? Number(defaultValue) : 0
            formData[fieldName] = isNaN(rateValue) ? 0 : rateValue
            // 同时更新组件的defaultValue
            if (component.defaultValue !== undefined) {
              component.defaultValue = formData[fieldName]
            }
            break
          case 'UploadWidget':
            formData[fieldName] = Array.isArray(defaultValue) ? defaultValue : []
            break
          default:
            formData[fieldName] = defaultValue !== undefined && defaultValue !== null ? defaultValue : ''
        }
      }
    })
  }
}

// 监听配置变化，重新初始化数据
watch(() => props.formConfig, () => {
  initFormData()
}, { immediate: true, deep: true })

// 监听组件数据变化，同步到formData
watch(() => props.formConfig?.components, (components) => {
  if (components) {
    components.forEach(component => {
      const fieldName = component.props?.field || component.field
      if (fieldName) {
        // 初始化时同步数据
        if (component.defaultValue !== undefined) {
          formData[fieldName] = component.defaultValue
        }
        
        // 监听组件的defaultValue变化
        watch(() => component.defaultValue, (newValue) => {
          // 过滤掉事件对象，只保留实际值
          if (newValue && typeof newValue === 'object' && newValue.target) {
            // 这是事件对象，获取实际值
            const target = newValue.target as HTMLInputElement
            formData[fieldName] = target.value
          } else {
            // 这是正常值
            formData[fieldName] = newValue
          }
          console.log(`组件 ${fieldName} 值变化:`, formData[fieldName])
        }, { deep: true })
      }
    })
  }
}, { immediate: true, deep: true })

// 处理表单提交
const handleSubmit = async () => {
  if (props.readonly) return

  try {
    await formRef.value?.validate()
    submitting.value = true

    // 收集表单数据
    const submitData = { ...formData }

    emit('submit', submitData)
    ElMessage.success('表单提交成功')
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.warning('请检查表单填写是否完整')
  } finally {
    submitting.value = false
  }
}

// 处理表单重置
const handleReset = () => {
  formRef.value?.resetFields()
  emit('reset')
  ElMessage.info('表单已重置')
}



// 这些格式化函数现在由widgets组件库处理

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 获取表单数据
const getFormData = () => {
  return { ...formData }
}

// 设置表单数据
const setFormData = (data: Record<string, any>) => {
  Object.assign(formData, data)
}

// 验证表单
const validateForm = () => {
  return formRef.value?.validate()
}

// 暴露方法给父组件
defineExpose({
  getFormData,
  setFormData,
  validateForm,
  resetForm: handleReset
})

onMounted(() => {
  initFormData()
})
</script>

<style scoped lang="scss">
.form-renderer {
  max-width: 800px;
  margin: 0 auto;
  // padding: 20px;
}

.form-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
  // border: 2px solid rgba(102, 126, 234, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);

  .form-title {
    margin: 0 0 12px 0;
    font-size: 28px;
    font-weight: 700;
    color: #2c3e50;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .form-description {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #7f8c8d;
    line-height: 1.6;
  }

  .form-meta-info {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 16px;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 20px;
      font-size: 14px;
      color: #667eea;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(102, 126, 234, 0.15);
        transform: translateY(-1px);
      }

      .el-icon {
        font-size: 16px;
        color: #667eea;
      }

      span {
        color: #667eea;
        font-weight: 500;
      }
    }
  }
}

.form-welcome {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);

  .welcome-content {
    .welcome-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;

      .welcome-icon {
        font-size: 24px;
        color: #667eea;
      }
    }

    .welcome-desc {
      margin: 0;
      font-size: 14px;
      color: #7f8c8d;
      line-height: 1.6;
    }
  }
}

.rendered-form {
  .form-item-container {
    margin-bottom: 24px;
  }

  .glass-form-item {
    :deep(.el-form-item__label) {
      color: #2c3e50;
      font-weight: 500;
      font-size: 14px;
    }
  }

  .button-container {
    text-align: center;
    margin: 24px 0;
  }

  .unknown-component {
    margin: 16px 0;
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 2px solid rgba(102, 126, 234, 0.1);

  .el-button {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 500;

    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
      }
    }
  }
}

.empty-form {
  text-align: center;
  padding: 80px 20px;
  color: #95a5a6;

  i {
    font-size: 64px;
    margin-bottom: 16px;
    display: block;
    color: #bdc3c7;
  }

  p {
    margin: 0;
    font-size: 18px;
  }
}

// 表单控件样式
.glass-input {
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;

    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }

    &.is-focus {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.glass-textarea {
  :deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;

    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }

    &:focus {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.glass-select {
  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;

    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }

    &.is-focused {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.glass-radio {
  :deep(.el-radio__input) {
    .el-radio__inner {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(102, 126, 234, 0.3);

      &:hover {
        border-color: rgba(102, 126, 234, 0.5);
      }
    }

    &.is-checked .el-radio__inner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
    }
  }
}

.glass-checkbox {
  :deep(.el-checkbox__input) {
    .el-checkbox__inner {
      background: rgba(255, 255, 255, 0.8);
      border-color: rgba(102, 126, 234, 0.3);

      &:hover {
        border-color: rgba(102, 126, 234, 0.5);
      }
    }

    &.is-checked .el-checkbox__inner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
    }
  }
}

.glass-date-picker {
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;

    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }

    &.is-focus {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.glass-rate {
  :deep(.el-rate__item) {
    .el-rate__icon {
      color: rgba(102, 126, 234, 0.3);

      &.hover {
        color: #667eea;
      }
    }

    &.is-selected .el-rate__icon {
      color: #667eea;
    }
  }
}

.glass-upload {
  :deep(.el-upload) {
    .el-upload__input {
      display: none;
    }
  }

  :deep(.el-upload-dragger) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px dashed rgba(102, 126, 234, 0.3);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(102, 126, 234, 0.5);
      background: rgba(255, 255, 255, 0.9);
    }

    &.is-dragover {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }
  }

  :deep(.el-upload-list) {
    .el-upload-list__item {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(102, 126, 234, 0.2);
      border-radius: 8px;
      margin-bottom: 8px;

      &:hover {
        border-color: rgba(102, 126, 234, 0.4);
      }
    }
  }

  :deep(.el-button) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;

    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-1px);
    }
  }
}

// 复合输入框样式
.composite-input-container {

  .input-prefix,
  .input-suffix {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-weight: 500;
    padding: 0 8px;
    border-radius: 4px;
  }

  .validation-tip {
    margin-top: 8px;
    font-size: 12px;

    .valid-tip {
      color: #67c23a;
      display: flex;
      align-items: center;
      gap: 4px;

      i {
        font-size: 14px;
      }
    }

    .invalid-tip {
      color: #f56c6c;
      display: flex;
      align-items: center;
      gap: 4px;

      i {
        font-size: 14px;
      }
    }
  }
}

.composite-phone {
  :deep(.el-input-group__prepend) {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
}

.composite-money {

  :deep(.el-input-group__prepend),
  :deep(.el-input-group__append) {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
}

.composite-url {
  :deep(.el-input-group__prepend) {
    background: rgba(102, 126, 234, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
}

.composite-email {
  :deep(.el-input__suffix) {
    color: #667eea;
  }
}

// 渲染模式样式
.render-mode {
  :deep(.widget-content) {
    // 移除设计器相关的样式
    border: none;
    background: transparent;
    padding: 0;
    margin: 0;
    cursor: default;

    &:hover {
      border: none;
      background: transparent;
    }
  }

  :deep(.widget-label) {
    // 使用Element Plus的表单项标签样式
    display: none;
  }

  :deep(.el-form-item__label) {
    color: #2c3e50;
    font-weight: 500;
    font-size: 14px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select__wrapper),
  :deep(.el-date-editor) {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: none;

    &:hover {
      border-color: rgba(102, 126, 234, 0.3);
    }

    &.is-focus,
    &.is-focused {
      border-color: rgba(102, 126, 234, 0.5);
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }
  }
}

.form-item-vertical {
  display: flex;
  flex-direction: column;
  margin-bottom: 32px;

  // 输入框
  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :deep(.el-input__wrapper:hover) {
    border-color: rgba(102, 126, 234, 0.4);
    background: #fff;
  }
  :deep(.el-input__wrapper.is-focus) {
    border-color: rgba(102, 126, 234, 0.6);
    background: #fff;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  }

  // 文本域
  :deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 15px;
    color: #2c3e50;
    min-height: 80px;
  }
  :deep(.el-textarea__inner:hover) {
    border-color: rgba(102, 126, 234, 0.4);
    background: #fff;
  }
  :deep(.el-textarea__inner:focus) {
    border-color: rgba(102, 126, 234, 0.6);
    background: #fff;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  }

  // 下拉框
  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid rgba(102, 126, 234, 0.2);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :deep(.el-select__wrapper:hover) {
    border-color: rgba(102, 126, 234, 0.4);
    background: #fff;
  }
  :deep(.el-select__wrapper.is-focused) {
    border-color: rgba(102, 126, 234, 0.6);
    background: #fff;
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  }
}
.form-item-label {
  font-weight: 600;
  font-size: 15px;
  color: #2c3e50;
  margin-bottom: 8px;
  text-align: left;
}

/* 新增统一风格样式 */
.form-item-vertical .el-input__wrapper,
.form-item-vertical .el-textarea__inner,
.form-item-vertical .el-select__wrapper,
.form-item-vertical .el-radio-group,
.form-item-vertical .el-checkbox-group {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-item-vertical .el-input__wrapper:hover,
.form-item-vertical .el-textarea__inner:hover,
.form-item-vertical .el-select__wrapper:hover {
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
  background: rgba(255, 255, 255, 1);
}
.form-item-vertical .el-input__wrapper.is-focus,
.form-item-vertical .el-textarea__inner:focus,
.form-item-vertical .el-select__wrapper.is-focused {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
  background: rgba(255, 255, 255, 1);
}
.form-item-vertical .el-radio-group,
.form-item-vertical .el-checkbox-group {
  padding: 8px 12px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
}
.form-item-vertical .el-radio,
.form-item-vertical .el-checkbox {
  margin-right: 12px;
}
@media (prefers-color-scheme: dark) {
  .form-item-vertical .el-input__wrapper,
  .form-item-vertical .el-textarea__inner,
  .form-item-vertical .el-select__wrapper,
  .form-item-vertical .el-radio-group,
  .form-item-vertical .el-checkbox-group {
    background: rgba(44, 62, 80, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .form-item-vertical .el-input__wrapper:hover,
  .form-item-vertical .el-textarea__inner:hover,
  .form-item-vertical .el-select__wrapper:hover {
    border-color: #667eea;
    background: rgba(44, 62, 80, 1);
  }
  .form-item-vertical .el-input__wrapper.is-focus,
  .form-item-vertical .el-textarea__inner:focus,
  .form-item-vertical .el-select__wrapper.is-focused {
    border-color: #667eea;
    background: rgba(44, 62, 80, 1);
  }
  .form-item-vertical .el-radio-group,
  .form-item-vertical .el-checkbox-group {
    background: rgba(44, 62, 80, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.form-item-vertical :deep(.el-upload .el-button) {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-item-vertical :deep(.el-upload .el-button):hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  color: #fff;
}
</style>
