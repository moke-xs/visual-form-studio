<template>
  <div class="property-item">
    <!-- 标签 -->
    <div class="property-label">{{ schema.label }}</div>
    
    <!-- 控件内容 -->
    <div class="property-content">
      <!-- 数字输入框 -->
      <el-input-number
        v-if="schema.type === 'number'"
        :model-value="modelValue"
        :placeholder="schema.placeholder"
        :min="schema.min"
        :max="schema.max"
        :step="schema.step"
        :precision="schema.precision"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <!-- 颜色选择器 -->
      <el-color-picker
        v-else-if="schema.type === 'color'"
        :model-value="modelValue"
        :show-alpha="schema.showAlpha || false"
        :color-format="schema.colorFormat || 'hex'"
        :predefine="schema.predefine"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <!-- 图标选择器 -->
      <icon-picker
        v-else-if="schema.type === 'icon'"
        :model-value="modelValue"
        :placeholder="schema.placeholder || '选择图标'"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <!-- 输入框 -->
      <el-input 
        v-else-if="schema.type === 'input'"
        :model-value="modelValue"
        :placeholder="schema.placeholder"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <!-- 开关 -->
      <el-switch
        v-else-if="schema.type === 'switch'"
        :model-value="modelValue"
        @update:model-value="$emit('update:model-value', $event)"
      />
      <!-- 下拉选择 -->
      <el-select
        v-else-if="schema.type === 'select'"
        :model-value="modelValue"
        :placeholder="schema.placeholder || '请选择'"
        :clearable="schema.clearable"
        @update:model-value="$emit('update:model-value', $event)"
      >
        <el-option
          v-for="opt in schema.options"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <!-- 数组编辑器 -->
      <array-editor
        v-else-if="schema.type === 'array'"
        :model-value="modelValue"
        :item-schema="schema.itemSchema"
        :min-items="schema.minItems"
        @update:model-value="$emit('update:model-value', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ArrayEditor from './ArrayEditor.vue'
import IconPicker from './IconPicker.vue'

defineProps<{
  schema: any
  modelValue: any
}>()

defineEmits<{
  'update:model-value': [value: any]
}>()
</script>

<style scoped>
.property-item {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.7);
  padding: 20px;
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.property-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
}

.property-label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 4px;
}

.property-content {
  line-height: 1.4;
}

/* 统一的输入框样式 */
.property-content :deep(.el-input__wrapper),
.property-content :deep(.el-textarea__inner),
.property-content :deep(.el-select .el-select__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(102, 126, 234, 0.15);
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.05);
}

.property-content :deep(.el-input__wrapper:hover),
.property-content :deep(.el-textarea__inner:hover),
.property-content :deep(.el-select .el-select__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.property-content :deep(.el-input__wrapper.is-focus),
.property-content :deep(.el-textarea__inner:focus),
.property-content :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: rgba(102, 126, 234, 0.5);
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.property-content :deep(.el-input__inner),
.property-content :deep(.el-textarea__inner) {
  color: #2c3e50;
  font-weight: 500;
}

.property-content :deep(.el-input__inner::placeholder),
.property-content :deep(.el-textarea__inner::placeholder) {
  color: #a0aec0;
  font-weight: 400;
}

/* 开关样式 */
.property-content :deep(.el-switch__core) {
  background: #e2e8f0;
  border: none;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.property-content :deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 数字输入框样式 */
.property-content :deep(.el-input-number) {
  width: 100%;
}

.property-content :deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
}

/* 颜色选择器样式 */
.property-content :deep(.el-color-picker__trigger) {
  border: 2px solid rgba(102, 126, 234, 0.15);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.property-content :deep(.el-color-picker__trigger:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

/* 下拉选择器样式 */
.property-content :deep(.el-select) {
  width: 100%;
}

.property-content :deep(.el-select .el-input__inner) {
  color: #2c3e50;
  font-weight: 500;
}

.property-content :deep(.el-select .el-input__inner::placeholder) {
  color: #a0aec0;
  font-weight: 400;
}

.property-content :deep(.el-select .el-select__caret) {
  color: rgba(102, 126, 234, 0.6);
  transition: all 0.3s ease;
}

.property-content :deep(.el-select .el-select__caret:hover) {
  color: #667eea;
}

.property-content :deep(.el-select .el-select__caret.is-reverse) {
  color: #667eea;
}

/* 下拉选项面板样式 */
.property-content :deep(.el-select-dropdown) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
  padding: 8px;
}

.property-content :deep(.el-select-dropdown .el-select-dropdown__item) {
  color: #2c3e50;
  background: transparent;
  border-radius: 8px;
  margin: 2px 0;
  padding: 10px 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.property-content :deep(.el-select-dropdown .el-select-dropdown__item:hover) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateX(4px);
}

.property-content :deep(.el-select-dropdown .el-select-dropdown__item.selected) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  color: #667eea;
  font-weight: 600;
  border-left: 3px solid #667eea;
  padding-left: 9px;
}

.property-content :deep(.el-select-dropdown .el-select-dropdown__item.selected:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
}
</style> 