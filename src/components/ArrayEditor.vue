<template>
  <div class="array-editor">
    <!-- 数组项列表 -->
    <div v-for="(item, idx) in modelValue" :key="idx" class="array-item">
      <div class="item-header">
        <span class="item-index">{{ idx + 1 }}</span>
        <el-button
          type="danger"
          size="small"
          :icon="Delete"
          @click="removeItem(idx)"
          :disabled="modelValue.length <= (minItems || 1)"
          class="delete-btn"
          title="删除"
        />
      </div>
      
      <div class="item-fields">
        <template v-for="field in itemSchema" :key="field.key">
          <div class="field-item" :class="`field-${field.type}`">
            <div class="field-content">
              <label class="field-label">{{ field.label }}</label>
              
              <el-input-number
                v-if="field.type === 'number'"
                v-model="item[field.key]"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :precision="field.precision"
                size="small"
                class="field-control"
              />
              <el-color-picker
                v-else-if="field.type === 'color'"
                v-model="item[field.key]"
                :show-alpha="field.showAlpha || false"
                :color-format="field.colorFormat || 'hex'"
                :predefine="field.predefine"
                size="small"
                class="field-control"
              />
              <icon-picker
                v-else-if="field.type === 'icon'"
                v-model="item[field.key]"
                :placeholder="field.placeholder || '选择图标'"
                size="small"
                class="field-control"
              />
              <el-input
                v-else-if="field.type === 'input'"
                v-model="item[field.key]"
                :placeholder="field.placeholder || field.label"
                size="small"
                class="field-control"
              />
              <el-select
                v-else-if="field.type === 'select'"
                v-model="item[field.key]"
                :placeholder="field.placeholder || '请选择'"
                size="small"
                class="field-control"
              >
                <el-option
                  v-for="option in field.options"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <div v-else-if="field.type === 'switch'" class="field-switch">
                <el-switch
                  v-model="item[field.key]"
                  size="small"
                  class="field-control"
                />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    
    <!-- 添加按钮 -->
    <div class="add-button-wrapper">
      <el-button
        type="primary"
        :icon="Plus"
        @click="addItem"
        class="add-btn"
      >
        添加项
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue'
import IconPicker from './IconPicker.vue'

const props = defineProps<{
  modelValue: any[]
  itemSchema: any[]
  minItems?: number
}>()

const emit = defineEmits<{
  'update:model-value': [value: any[]]
}>()

function addItem() {
  const newItem: any = {}
  props.itemSchema.forEach(field => {
    if (field.type === 'switch') {
      newItem[field.key] = false
    } else {
      newItem[field.key] = field.defaultValue || ''
    }
  })
  
  const newArray = [...props.modelValue, newItem]
  emit('update:model-value', newArray)
}

function removeItem(index: number) {
  const newArray = props.modelValue.filter((_, idx) => idx !== index)
  emit('update:model-value', newArray)
}
</script>

<style scoped>
.array-editor {
  width: 100%;
}

.array-item {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.25);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 
    0 8px 32px rgba(102, 126, 234, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.array-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.array-item:hover {
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 
    0 12px 40px rgba(102, 126, 234, 0.15),
    0 6px 20px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.array-item:hover::before {
  left: 100%;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.15);
  position: relative;
}

.item-index {
  font-size: 13px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  padding: 6px 12px;
  min-width: 28px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
}

.item-index::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.item-index:hover::before {
  left: 100%;
}

.delete-btn {
  border: none;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.25);
  position: relative;
  overflow: hidden;
}

.delete-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.4s ease;
}

.delete-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.delete-btn:hover::before {
  left: 100%;
}

.delete-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.delete-btn:disabled {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.3);
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.item-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  align-items: start;
}

.field-item {
  position: relative;
}

.field-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
}

.field-label::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 20px;
  height: 2px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 1px;
}

.field-control {
  width: 100% !important;
}

.field-switch {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  min-height: 32px;
}

/* 特殊字段类型样式 */
.field-color .field-control {
  width: auto !important;
}

.field-switch .field-control {
  width: auto !important;
}

.add-button-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.add-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: 500;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* Element Plus 组件样式定制 */
.array-item :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.array-item :deep(.el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.5);
}

.array-item :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.array-item :deep(.el-input-number__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  box-shadow: none;
}

.array-item :deep(.el-input-number__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.5);
}

.array-item :deep(.el-input-number__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Select 下拉框样式 */
.array-item :deep(.el-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.array-item :deep(.el-select .el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.5);
}

.array-item :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.array-item :deep(.el-select .el-input__inner) {
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
}

.array-item :deep(.el-select .el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

.array-item :deep(.el-select .el-select__caret) {
  color: rgba(255, 255, 255, 0.6);
}

.array-item :deep(.el-select .el-select__caret:hover) {
  color: #667eea;
}

/* 下拉选项样式 */
.array-item :deep(.el-select-dropdown) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.array-item :deep(.el-select-dropdown .el-select-dropdown__item) {
  color: rgba(255, 255, 255, 0.9);
  background: transparent;
}

.array-item :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(102, 126, 234, 0.2);
  color: white;
}

.array-item :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.array-item :deep(.el-switch__core) {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.array-item :deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
}
</style> 