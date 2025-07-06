<template>
  <div class="icon-picker">
    <el-popover
      ref="popoverRef"
      placement="bottom-start"
      :width="400"
      trigger="click"
      popper-class="icon-picker-popover"
    >
      <template #reference>
        <el-input
          :model-value="displayValue"
          :placeholder="placeholder"
          readonly
          class="icon-picker-input"
        >
          <template #prefix v-if="modelValue">
            <i :class="modelValue" class="selected-icon"></i>
          </template>
          <template #suffix>
            <i class="mdi mdi-chevron-down"></i>
          </template>
        </el-input>
      </template>
      
      <div class="icon-picker-content">
        <div class="icon-picker-header">
          <el-input
            v-model="searchQuery"
            placeholder="搜索图标..."
            clearable
          >
            <template #prefix>
              <i class="mdi mdi-magnify"></i>
            </template>
          </el-input>
        </div>
        
        <div class="icon-picker-categories">
          <el-tabs v-model="activeCategory">
            <!-- 搜索结果/全部图标 -->
            <el-tab-pane
              :label="searchQuery ? `搜索结果 (${searchResults.length})` : `全部 (${allIcons.length})`"
              name="all"
            >
              <el-scrollbar height="300px">
                <div class="icon-grid">
                  <div
                    v-for="icon in searchQuery ? searchResults : allIcons"
                    :key="icon.class"
                    class="icon-item"
                    :class="{ active: modelValue === icon.class }"
                    @click="selectIcon(icon.class)"
                    :title="icon.name"
                  >
                    <i :class="icon.class"></i>
                    <span class="icon-name">{{ icon.name }}</span>
                  </div>
                </div>
                <!-- 无搜索结果提示 -->
                <div v-if="searchQuery && searchResults.length === 0" class="no-results">
                  <i class="mdi mdi-magnify-close"></i>
                  <p>未找到匹配的图标</p>
                  <p class="no-results-tip">尝试使用其他关键词，如："用户"、"邮件"、"设置"等</p>
                </div>
              </el-scrollbar>
            </el-tab-pane>
            <!-- 分类标签 -->
            <el-tab-pane
              v-for="category in categories"
              :key="category.key"
              :label="`${category.label} (${category.icons.length})`"
              :name="category.key"
            >
              <el-scrollbar height="300px">
                <div class="icon-grid">
                  <div
                    v-for="icon in category.icons"
                    :key="icon.class"
                    class="icon-item"
                    :class="{ active: modelValue === icon.class }"
                    @click="selectIcon(icon.class)"
                    :title="icon.name"
                  >
                    <i :class="icon.class"></i>
                    <span class="icon-name">{{ icon.name }}</span>
                  </div>
                </div>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="icon-picker-footer">
          <el-button size="small" @click="clearIcon">清除</el-button>
          <el-button size="small" type="primary" @click="closePopover">关闭</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface IconItem {
  class: string
  name: string
}

interface IconCategory {
  key: string
  label: string
  icons: IconItem[]
}

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchQuery = ref('')
const activeCategory = ref('all')
const popoverRef = ref()

// 显示值（去掉 mdi mdi- 前缀）
const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue.replace('mdi mdi-', '')
})

// 所有图标的扁平化数组
const allIcons = computed(() => {
  return categories.reduce((acc, category) => {
    return acc.concat(category.icons)
  }, [] as IconItem[])
})

// 搜索结果
const searchResults = computed(() => {
  if (!searchQuery.value) return []
  
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return []
  
  return allIcons.value.filter(icon => {
    // 支持多种搜索方式
    const name = icon.name.toLowerCase()
    const className = icon.class.toLowerCase()
    
    // 精确匹配
    if (name === query || className.includes(query)) return true
    
    // 模糊匹配：名称包含关键词
    if (name.includes(query)) return true
    
    // 拼音首字母匹配（简单实现）
    const firstLetters = getPinyinFirstLetters(icon.name)
    if (firstLetters.includes(query)) return true
    
    // 部分匹配：类名的某个部分
    const classParts = className.replace('mdi mdi-', '').split('-')
    if (classParts.some(part => part.includes(query))) return true
    
    return false
  })
})

// 简单的拼音首字母提取（常用字符映射）
function getPinyinFirstLetters(text: string): string {
  const pinyinMap: Record<string, string> = {
    '用': 'y', '户': 'h', '邮': 'y', '件': 'j', '电': 'd', '话': 'h',
    '锁': 's', '眼': 'y', '睛': 'j', '隐': 'y', '藏': 'c', '搜': 's',
    '索': 's', '放': 'f', '大': 'd', '镜': 'j', '首': 's', '页': 'y',
    '星': 'x', '心': 'x', '形': 'x', '勾': 'g', '选': 'x', '关': 'g',
    '闭': 'b', '圆': 'y', '圈': 'q', '加': 'j', '号': 'h', '减': 'j',
    '删': 's', '除': 'c', '编': 'b', '辑': 'j', '设': 's', '置': 'z',
    '齿': 'c', '轮': 'l', '文': 'w', '本': 'b', '框': 'k', '密': 'm',
    '码': 'm', '复': 'f', '单': 'd', '日': 'r', '历': 'l',
    '范': 'f', '围': 'w', '时': 's', '钟': 'z', '上': 's', '传': 'c',
    '下': 'x', '载': 'z', '附': 'f', '回': 'h', '针': 'z', '信': 'x',
    '贷': 'd', '卡': 'k', '廓': 'k', '美': 'm', '元': 'y',
    '人': 'r', '民': 'm', '币': 'b', '银': 'y', '行': 'h', '钱': 'q',
    '包': 'b', '购': 'g', '物': 'w', '车': 'c', '商': 's', '店': 'd',
    '办': 'b', '公': 'g', '楼': 'l', '网': 'w',
    '蓝': 'l', '牙': 'y', '手': 's', '机': 'j', '笔': 'b',
    '记': 'j', '台': 't', '式': 's', '显': 'x', '示': 's', '器': 'q',
    '数': 's', '据': 'j', '库': 'k', '服': 'f', '务': 'w', '云': 'y',
    '代': 'd', '控': 'k', '制': 'z', '错': 'c', '误': 'w',
    '汽': 'q', '交': 'j', '火': 'h', '飞': 'f',
    '船': 'c', '自': 'z', '摩': 'm', '托': 't', '地': 'd',
    '图': 't', '标': 'b', '导': 'd', '航': 'h', '指': 'z',
    '南': 'n'
  }
  
  return text.split('').map(char => pinyinMap[char] || '').join('')
}

// 图标分类数据
const categories: IconCategory[] = [
  {
    key: 'common',
    label: '常用',
    icons: [
      { class: 'mdi mdi-account', name: '用户' },
      { class: 'mdi mdi-account-outline', name: '用户轮廓' },
      { class: 'mdi mdi-email', name: '邮件' },
      { class: 'mdi mdi-email-outline', name: '邮件轮廓' },
      { class: 'mdi mdi-phone', name: '电话' },
      { class: 'mdi mdi-phone-outline', name: '电话轮廓' },
      { class: 'mdi mdi-lock', name: '锁' },
      { class: 'mdi mdi-lock-outline', name: '锁轮廓' },
      { class: 'mdi mdi-eye', name: '眼睛' },
      { class: 'mdi mdi-eye-outline', name: '眼睛轮廓' },
      { class: 'mdi mdi-eye-off', name: '隐藏' },
      { class: 'mdi mdi-magnify', name: '搜索' },
      { class: 'mdi mdi-magnify', name: '放大镜' },
      { class: 'mdi mdi-home', name: '首页' },
      { class: 'mdi mdi-home-outline', name: '首页轮廓' },
      { class: 'mdi mdi-star', name: '星星' },
      { class: 'mdi mdi-star-outline', name: '星星轮廓' },
      { class: 'mdi mdi-heart', name: '心形' },
      { class: 'mdi mdi-heart-outline', name: '心形轮廓' },
      { class: 'mdi mdi-check', name: '勾选' },
      { class: 'mdi mdi-check-circle', name: '勾选圆圈' },
      { class: 'mdi mdi-close', name: '关闭' },
      { class: 'mdi mdi-close-circle', name: '关闭圆圈' },
      { class: 'mdi mdi-plus', name: '加号' },
      { class: 'mdi mdi-minus', name: '减号' },
      { class: 'mdi mdi-delete', name: '删除' },
      { class: 'mdi mdi-book-edit-outline', name: '编辑' },
      { class: 'mdi mdi-cog-outline', name: '设置' },
      { class: 'mdi mdi-cog', name: '齿轮' }
    ]
  },
  {
    key: 'form',
    label: '表单',
    icons: [
      { class: 'mdi mdi-form-textbox', name: '文本框' },
      { class: 'mdi mdi-form-textbox-password', name: '密码框' },
      { class: 'mdi mdi-form-select', name: '选择框' },
      { class: 'mdi mdi-checkbox-marked', name: '复选框' },
      { class: 'mdi mdi-checkbox-marked-outline', name: '复选框轮廓' },
      { class: 'mdi mdi-radiobox-marked', name: '单选框' },
      { class: 'mdi mdi-calendar', name: '日历' },
      { class: 'mdi mdi-calendar-range', name: '日期范围' },
      { class: 'mdi mdi-clock', name: '时钟' },
      { class: 'mdi mdi-clock-outline', name: '时钟轮廓' },
      { class: 'mdi mdi-upload', name: '上传' },
      { class: 'mdi mdi-download', name: '下载' },
      { class: 'mdi mdi-attachment', name: '附件' },
      { class: 'mdi mdi-paperclip', name: '回形针' }
    ]
  },
  {
    key: 'business',
    label: '商务',
    icons: [
      { class: 'mdi mdi-credit-card', name: '信用卡' },
      { class: 'mdi mdi-credit-card-outline', name: '信用卡轮廓' },
      { class: 'mdi mdi-currency-usd', name: '美元' },
      { class: 'mdi mdi-currency-cny', name: '人民币' },
      { class: 'mdi mdi-bank', name: '银行' },
      { class: 'mdi mdi-wallet', name: '钱包' },
      { class: 'mdi mdi-wallet-outline', name: '钱包轮廓' },
      { class: 'mdi mdi-shopping', name: '购物' },
      { class: 'mdi mdi-shopping-outline', name: '购物轮廓' },
      { class: 'mdi mdi-cart', name: '购物车' },
      { class: 'mdi mdi-cart-outline', name: '购物车轮廓' },
      { class: 'mdi mdi-store', name: '商店' },
      { class: 'mdi mdi-office-building', name: '办公楼' },
      { class: 'mdi mdi-briefcase', name: '公文包' },
      { class: 'mdi mdi-briefcase-outline', name: '公文包轮廓' }
    ]
  },
  {
    key: 'tech',
    label: '科技',
    icons: [
      { class: 'mdi mdi-web', name: '网页' },
      { class: 'mdi mdi-wifi', name: 'WiFi' },
      { class: 'mdi mdi-bluetooth', name: '蓝牙' },
      { class: 'mdi mdi-cellphone', name: '手机' },
      { class: 'mdi mdi-laptop', name: '笔记本' },
      { class: 'mdi mdi-desktop-classic', name: '台式机' },
      { class: 'mdi mdi-monitor', name: '显示器' },
      { class: 'mdi mdi-database', name: '数据库' },
      { class: 'mdi mdi-server', name: '服务器' },
      { class: 'mdi mdi-cloud', name: '云' },
      { class: 'mdi mdi-cloud-outline', name: '云轮廓' },
      { class: 'mdi mdi-code-braces', name: '代码' },
      { class: 'mdi mdi-console', name: '控制台' },
      { class: 'mdi mdi-bug', name: '错误' }
    ]
  },
  {
    key: 'transport',
    label: '交通',
    icons: [
      { class: 'mdi mdi-car', name: '汽车' },
      { class: 'mdi mdi-car-outline', name: '汽车轮廓' },
      { class: 'mdi mdi-truck', name: '卡车' },
      { class: 'mdi mdi-bus', name: '公交车' },
      { class: 'mdi mdi-train', name: '火车' },
      { class: 'mdi mdi-airplane', name: '飞机' },
      { class: 'mdi mdi-ship-wheel', name: '轮船' },
      { class: 'mdi mdi-bicycle', name: '自行车' },
      { class: 'mdi mdi-motorbike', name: '摩托车' },
      { class: 'mdi mdi-map', name: '地图' },
      { class: 'mdi mdi-map-marker', name: '地图标记' },
      { class: 'mdi mdi-map-marker-outline', name: '地图标记' },
      { class: 'mdi mdi-navigation', name: '导航' },
      { class: 'mdi mdi-compass', name: '指南针' }
    ]
  }
]

// 监听搜索输入，自动切换到"全部"标签
watch(searchQuery, (newQuery) => {
  if (newQuery && newQuery.trim()) {
    activeCategory.value = 'all'
  }
})

// 选择图标
function selectIcon(iconClass: string) {
  emit('update:modelValue', iconClass)
  // 选择图标后自动关闭弹出框
  closePopover()
}

// 清除图标
function clearIcon() {
  emit('update:modelValue', '')
  closePopover()
}

// 关闭弹出框
function closePopover() {
  if (popoverRef.value) {
    popoverRef.value.hide()
  }
}
</script>

<style scoped>
.icon-picker-input {
  cursor: pointer;
}

.selected-icon {
  color: #667eea;
  font-size: 16px;
}

.icon-picker-content {
  width: 100%;
}

.icon-picker-header {
  margin-bottom: 16px;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 10px;
  padding: 12px 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  /* min-height: 60px; */
  position: relative;
  overflow: hidden;
}

.icon-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.icon-item:hover {
  border-color: rgba(102, 126, 234, 0.4);
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.icon-item:hover::before {
  left: 100%;
}

.icon-item.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  color: #667eea;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
}

.icon-item i {
  font-size: 22px;
  margin-bottom: 6px;
  color: rgb(86 9 209 / 90%);
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.icon-item:hover i,
.icon-item.active i {
  color: #667eea;
  transform: scale(1.1);
  text-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.icon-name {
  font-size: 11px;
  text-align: center;
  line-height: 1.2;
  word-break: break-all;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 500;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.icon-item:hover .icon-name,
.icon-item.active .icon-name {
  color: #667eea;
  font-weight: 600;
  text-shadow: 0 1px 4px rgba(102, 126, 234, 0.2);
}

.icon-picker-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.2);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.no-results i {
  font-size: 56px;
  margin-bottom: 20px;
  opacity: 0.4;
  color: rgba(102, 126, 234, 0.5);
}

.no-results p {
  margin: 0;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.no-results-tip {
  font-size: 13px !important;
  margin-top: 12px !important;
  opacity: 0.6;
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>

<style>
.icon-picker-popover {
  padding: 20px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 16px 40px rgba(102, 126, 234, 0.15) !important;
}

.icon-picker-popover .el-tabs__nav-wrap::after {
  display: none;
}

.icon-picker-popover .el-tabs__header {
  margin-bottom: 12px;
}

/* 标签页样式定制 */
.icon-picker-popover .el-tabs__nav {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  height: 30px;
}

.icon-picker-popover .el-tabs__item {
  color: rgb(86 9 209 / 90%);
  font-weight: 500;
  border-radius: 8px;
  margin: 0 2px;
  transition: all 0.3s ease;
  border: none;
  height: 30px;
}

.icon-picker-popover .el-tabs__item:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.icon-picker-popover .el-tabs__item.is-active {
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  height: 30px;
}

.icon-picker-popover .el-tabs__active-bar {
  display: none;
}

/* 搜索框样式 */
.icon-picker-popover .el-input__wrapper {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  transition: all 0.3s ease !important;
}

.icon-picker-popover .el-input__wrapper:hover {
  border-color: rgba(102, 126, 234, 0.5) !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

.icon-picker-popover .el-input__wrapper.is-focus {
  border-color: #667eea !important;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
}

.icon-picker-popover .el-input__inner {
  color: rgb(86 9 209 / 90%) !important;
  background: transparent !important;
}

.icon-picker-popover .el-input__inner::placeholder {
  color: rgb(86 9 209 / 90%) !important;
}

.icon-picker-popover .el-input__prefix-inner {
  color: rgb(86 9 209 / 90%) !important;
}

/* 按钮样式 */
.icon-picker-popover .el-button {
  border-radius: 10px !important;
  font-weight: 500 !important;
  transition: all 0.3s ease !important;
}

.icon-picker-popover .el-button--default {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  color: rgba(255, 255, 255, 0.8) !important;
}

.icon-picker-popover .el-button--default:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(102, 126, 234, 0.5) !important;
  color: #667eea !important;
}

.icon-picker-popover .el-button--primary {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
}

.icon-picker-popover .el-button--primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4) !important;
}

/* 滚动条样式 */
.icon-picker-popover .el-scrollbar__bar {
  background: rgba(102, 126, 234, 0.2) !important;
  border-radius: 4px !important;
}

.icon-picker-popover .el-scrollbar__thumb {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border-radius: 4px !important;
}
</style> 