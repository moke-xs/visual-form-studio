<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    <el-rate
      v-model="widget.defaultValue"
      :max="widget.max"
      :disabled="widget.disabled"
      :allow-half="widget.allowHalf"
      :low-threshold="widget.lowThreshold"
      :high-threshold="widget.highThreshold"
      :colors="widget.colors?.map((item: any) => item.color) || widget.colors"
      :void-color="widget.voidColor"
      :disabled-void-color="widget.disabledVoidColor"
      :icon-classes="widget.iconClasses"
      :void-icon-class="widget.voidIconClass"
      :disabled-void-icon-class="widget.disabledVoidIconClass"
      :show-text="widget.showText"
      :show-score="widget.showScore"
      :text-color="widget.textColor"
      :texts="widget.texts?.map((item: any) => item.text) || widget.texts"
      :score-template="widget.scoreTemplate"
      :size="widget.size"
    />
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'RateWidget',
  label: '评分',
  icon: 'mdi mdi-star',
  category: 'form',

  defaultProps: {
    label: '评分',
    required: false,
    disabled: false,
    defaultValue: 0,
    max: 5,
    allowHalf: false,
    lowThreshold: 2,
    highThreshold: 4,
    colors: [
      { color: '#F7BA2A' },
      { color: '#F7BA2A' },
      { color: '#F7BA2A' }
    ],
    voidColor: '#C6D1DE',
    disabledVoidColor: '#EFF2F7',
    iconClasses: ['el-icon-star-on', 'el-icon-star-on', 'el-icon-star-on'],
    voidIconClass: 'el-icon-star-off',
    disabledVoidIconClass: 'el-icon-star-on',
    showText: false,
    showScore: false,
    textColor: '#1F2D3D',
    texts: [
      { text: '极差' },
      { text: '失望' },
      { text: '一般' },
      { text: '满意' },
      { text: '惊喜' }
    ],
    scoreTemplate: '{value}',
    size: undefined
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'defaultValue', label: '默认值', type: 'number', placeholder: '默认评分值', min: 0, max: 5, step: 0.5 },
    { key: 'allowHalf', label: '允许半选', type: 'switch' },
    { key: 'lowThreshold', label: '低分界限', type: 'number', placeholder: '低分和中等分数的界限值', min: 1, max: 5 },
    { key: 'highThreshold', label: '高分界限', type: 'number', placeholder: '高分和中等分数的界限值', min: 1, max: 5 },
    { key: 'showText', label: '显示辅助文字', type: 'switch' },
    { key: 'showScore', label: '显示当前分数', type: 'switch' },
    { 
      key: 'voidColor', 
      label: '未选中颜色', 
      type: 'color',
      predefine: ['#C6D1DE', '#E4E7ED', '#DCDFE6', '#F2F6FC']
    },
    { 
      key: 'textColor', 
      label: '文字颜色', 
      type: 'color',
      predefine: ['#1F2D3D', '#606266', '#909399', '#C0C4CC']
    },
    { key: 'scoreTemplate', label: '分数模板', type: 'input', placeholder: '分数显示模板，如 {value} 分' },
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
    {
      key: 'colors',
      label: '评分颜色',
      type: 'array',
      minItems: 1,
      itemSchema: [
        { 
          key: 'color', 
          label: '颜色', 
          type: 'color', 
          defaultValue: '#F7BA2A',
          predefine: ['#F7BA2A', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
        }
      ]
    },
    {
      key: 'texts',
      label: '辅助文字数组',
      type: 'array',
      minItems: 1,
      itemSchema: [
        { key: 'text', label: '文字', type: 'input', width: '80%', defaultValue: '新文字' }
      ]
    }
  ]
}
</script>

<script setup lang="ts">
defineOptions({ name: 'RateWidget' })

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

/* Element Plus Rate 自定义样式 */
:deep(.el-rate) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-rate__item) {
  font-size: 20px;
  transition: all 0.3s ease;
}

:deep(.el-rate__item:hover) {
  transform: scale(1.1);
}

:deep(.el-rate__icon) {
  color: #667eea;
}

:deep(.el-rate__text) {
  color: #2c3e50;
  font-weight: 500;
  margin-left: 8px;
}
</style> 