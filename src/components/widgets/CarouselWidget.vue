<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    <div v-if="widget.presetMode" class="preset-mode-info">
      <el-tag size="small" type="info">{{ currentModeDescription }}</el-tag>
    </div>
    <el-carousel
      v-model="currentIndex"
      :height="widget.height"
      :direction="widget.direction"
      :autoplay="widget.autoplay"
      :interval="widget.interval"
      :indicator-position="widget.indicatorPosition"
      :arrow="widget.arrow"
      :type="widget.carouselType"
      :loop="widget.loop"
      :pause-on-hover="widget.pauseOnHover"
      :motion-blur="widget.motionBlur"
      class="carousel-widget"
      :data-auto-height="widget.height === 'auto'"
      @change="onSlideChange"
    >
      <el-carousel-item
        v-for="(item, index) in widget.slides"
        :key="item.id || index"
        :name="item.name || String(index)"
        class="carousel-item"
      >
        <!-- 图片类型 -->
        <div v-if="item.slideType === 'image'" class="slide-content image-slide">
          <img 
            :src="item.src || item.content" 
            :alt="item.alt || item.title"
            class="slide-image"
            @error="onImageError"
          />
          <div v-if="item.title || item.description" class="slide-overlay">
            <h3 v-if="item.title" class="slide-title">{{ item.title }}</h3>
            <p v-if="item.description" class="slide-description">{{ item.description }}</p>
            <el-button 
              v-if="item.buttonText" 
              :type="item.buttonType || 'primary'"
              class="slide-button"
              @click.stop="onButtonClick(item)"
            >
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>

        <!-- 视频类型 -->
        <div v-else-if="item.slideType === 'video'" class="slide-content video-slide">
          <video 
            :src="item.src || item.content"
            :poster="item.poster"
            :controls="item.showControls"
            :autoplay="item.autoplay"
            :loop="item.loop"
            :muted="item.muted"
            class="slide-video"
          >
            您的浏览器不支持视频播放
          </video>
          <div v-if="item.title || item.description" class="slide-overlay">
            <h3 v-if="item.title" class="slide-title">{{ item.title }}</h3>
            <p v-if="item.description" class="slide-description">{{ item.description }}</p>
          </div>
        </div>

        <!-- 自定义内容类型 -->
        <div v-else class="slide-content custom-slide" :style="getSlideStyle(item)">
          <div class="slide-inner">
            <h3 v-if="item.title" class="slide-title">{{ item.title }}</h3>
            <p v-if="item.description" class="slide-description">{{ item.description }}</p>
            <div v-if="item.content" class="slide-text" v-html="item.content"></div>
            <el-button 
              v-if="item.buttonText" 
              :type="item.buttonType || 'primary'"
              class="slide-button"
              @click.stop="onButtonClick(item)"
            >
              {{ item.buttonText }}
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    
    <!-- 自定义指示器（如果需要） -->
    <div v-if="widget.showCustomIndicator" class="custom-indicators">
      <span
        v-for="(_item, index) in widget.slides"
        :key="index"
        class="custom-indicator"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
      >
        {{ index + 1 }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'CarouselWidget',
  label: '走马灯',
  icon: 'mdi mdi-view-carousel',
  category: 'data',

  defaultProps: {
    label: '走马灯',
    required: false,
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false,
    showCustomIndicator: false,
    presetMode: '',
    slides: [
      {
        id: '1',
        slideType: 'image',
        title: '教育科技创新',
        description: '推动教育数字化转型，构建智慧教育新生态',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20241213/FodSdP5QbaOQyrrQQVM7PRPu5epG/20240201225937_2027.png',
        alt: '教育科技',
        buttonText: '了解更多',
        buttonType: 'primary',
        link: '#'
      },
      {
        id: '2',
        slideType: 'image', 
        title: '智慧校园建设',
        description: '打造现代化智慧校园，提升教育教学质量',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20241213/FqFmGtMXfZG2ph-zUmFJrtOiDT0F/20240106103712_7331.png',
        alt: '智慧校园',
        buttonText: '立即体验',
        buttonType: 'success',
        link: '#'
      },
      {
        id: '3',
        slideType: 'image',
        title: '民族商业发展',
        description: '广西右江民族商业发展新篇章',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20250331/FjpSZqYx-ah0WW6ImKgNBgDtLbre/%E5%B9%BF%E8%A5%BF%E5%8F%B3%E6%B1%9F%E6%B0%91%E6%97%8F%E5%95%86%E4%B8%9A.jpg',
        alt: '民族商业',
        buttonText: '查看详情',
        buttonType: 'info',
        link: '#'
      },
      {
        id: '4',
        slideType: 'image',
        title: '美丽校园风光',
        description: '内花园美景，打造绿色生态校园环境',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20250616/Fjwl7tlmV96G-S6ltuwJb0XP53hS/%E5%86%85%E8%8A%B1%E5%9B%AD.jpg',
        alt: '校园风光',
        buttonText: '参观校园',
        buttonType: 'success',
        link: '#'
      },
      {
        id: '5',
        slideType: 'image',
        title: '成人教育典礼',
        description: '成人仪式庄严举行，见证青春成长时刻',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20250320/FkBsHWaZ7-ZbdFNgxKNNwlWPakYr/%E6%88%90%E4%BA%BA%E4%BB%AA%E5%BC%8F%E5%90%88%E5%BD%B11.jpg',
        alt: '成人典礼',
        buttonText: '了解活动',
        buttonType: 'warning',
        link: '#'
      },
      {
        id: '6',
        slideType: 'image',
        title: '技行川渝·智造未来',
        description: '技能大赛展示青年风采，智造未来创新发展',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20250417/FgF9HT_atbtUKSBSdTi3TzAwtdj8/%E2%80%9C%E6%8A%80%E8%A1%8C%E5%B7%9D%E6%B8%9D%E2%80%A2%E6%99%BA%E9%80%A0%E6%9C%AA%E6%9D%A5%E2%80%9D.jpg',
        alt: '技能大赛',
        buttonText: '参与大赛',
        buttonType: 'danger',
        link: '#'
      },
      {
        id: '7',
        slideType: 'image',
        title: '班主任技能大赛',
        description: '提升班主任专业技能，促进教育教学发展',
        src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20250403/FktYKQdXJ3eztY5zx091HY2d7Eu9/banzhurendasai.png',
        alt: '班主任大赛',
        buttonText: '报名参赛',
        buttonType: 'primary',
        link: '#'
      }
    ]
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'required', label: '必填', type: 'switch' },
    { key: 'height', label: '高度', type: 'input', placeholder: '如: 300px, 50vh' },
    {
      key: 'direction',
      label: '方向',
      type: 'select',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' }
      ]
    },
    { key: 'autoplay', label: '自动播放', type: 'switch' },
    { key: 'interval', label: '播放间隔(ms)', type: 'number', min: 1000, max: 10000, step: 500 },
    {
      key: 'indicatorPosition',
      label: '指示器位置',
      type: 'select',
      options: [
        { label: '默认', value: '' },
        { label: '外部', value: 'outside' },
        { label: '隐藏', value: 'none' }
      ]
    },
    {
      key: 'arrow',
      label: '切换箭头',
      type: 'select',
      options: [
        { label: '悬停显示', value: 'hover' },
        { label: '始终显示', value: 'always' },
        { label: '永不显示', value: 'never' }
      ]
    },
    {
      key: 'carouselType',
      label: '类型',
      type: 'select',
      clearable: true,
      options: [
        { label: '默认', value: '' },
        { label: '卡片', value: 'card' }
      ]
    },
    { key: 'loop', label: '循环播放', type: 'switch' },
    { key: 'pauseOnHover', label: '悬停暂停', type: 'switch' },
    { key: 'motionBlur', label: '动态模糊', type: 'switch' },
    { key: 'showCustomIndicator', label: '自定义指示器', type: 'switch' },
    {
      key: 'presetMode',
      label: '预设模式',
      type: 'select',
      clearable: true,
      options: [
        { label: '自定义', value: '' },
        { label: '基础用法', value: 'basic' },
        { label: '动态模糊', value: 'motionBlur' },
        { label: '外部指示器', value: 'outsideIndicator' },
        { label: '隐藏指示器', value: 'noIndicator' },
        { label: '始终显示箭头', value: 'alwaysArrow' },
        { label: '隐藏箭头', value: 'noArrow' },
        { label: '自动高度', value: 'autoHeight' },
        { label: '卡片模式', value: 'cardMode' },
        { label: '垂直排列', value: 'vertical' },
        { label: '垂直卡片', value: 'verticalCard' }
      ]
    },
    {
      key: 'slides',
      label: '轮播项',
      type: 'array',
      minItems: 1,
      itemSchema: [
        { key: 'title', label: '标题', type: 'input', width: '25%', defaultValue: '新轮播项' },
        { 
          key: 'slideType', 
          label: '类型', 
          type: 'select',
          width: '15%',
          defaultValue: 'image',
          options: [
            { label: '图片', value: 'image' },
            { label: '视频', value: 'video' },
            { label: '自定义', value: 'custom' }
          ]
        },
        { key: 'src', label: '资源链接', type: 'input', width: '30%', defaultValue: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20241213/FodSdP5QbaOQyrrQQVM7PRPu5epG/20240201225937_2027.png' },
        { key: 'description', label: '描述', type: 'input', width: '25%', defaultValue: '描述信息' }
      ]
    }
  ]
}
</script>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

defineOptions({ name: 'CarouselWidget' })

const props = defineProps<{
  widget: any
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  slideChange: [index: number, item: any]
  buttonClick: [item: any]
}>()

// 当前轮播索引
const currentIndex = ref(0)

// 预设模式描述
const presetModeDescriptions: Record<string, string> = {
  basic: '基础用法 - 默认配置的走马灯',
  motionBlur: '动态模糊 - 切换时带有动态模糊效果',
  outsideIndicator: '外部指示器 - 指示器显示在外部',
  noIndicator: '隐藏指示器 - 不显示指示器',
  alwaysArrow: '始终显示箭头 - 箭头一直可见',
  noArrow: '隐藏箭头 - 不显示切换箭头',
  autoHeight: '自动高度 - 根据内容自动调整高度',
  cardMode: '卡片模式 - 3D卡片效果展示',
  vertical: '垂直排列 - 垂直方向滚动',
  verticalCard: '垂直卡片 - 垂直方向的卡片模式'
}

// 当前模式描述
const currentModeDescription = computed(() => {
  return props.widget.presetMode ? presetModeDescriptions[props.widget.presetMode] || '自定义模式' : '自定义模式'
})

// 预设模式配置
const presetConfigs: Record<string, any> = {
  basic: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  motionBlur: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: true
  },
  outsideIndicator: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: 'outside',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  noIndicator: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: 'none',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  alwaysArrow: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 5000,
    indicatorPosition: '',
    arrow: 'always',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  noArrow: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'never',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  autoHeight: {
    height: 'auto',
    direction: 'horizontal',
    autoplay: true,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  cardMode: {
    height: '200px',
    direction: 'horizontal',
    autoplay: true,
    interval: 4000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: 'card',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  vertical: {
    height: '200px',
    direction: 'vertical',
    autoplay: false,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: '',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  },
  verticalCard: {
    height: '400px',
    direction: 'vertical',
    autoplay: false,
    interval: 3000,
    indicatorPosition: '',
    arrow: 'hover',
    carouselType: 'card',
    loop: true,
    pauseOnHover: true,
    motionBlur: false
  }
}

// 应用预设模式
function applyPresetMode(mode: string) {
  if (!mode || !presetConfigs[mode]) return
  
  const config = presetConfigs[mode]
  Object.keys(config).forEach(key => {
    if (props.widget[key] !== undefined) {
      props.widget[key] = config[key]
    }
  })
  
  // 为特定模式设置合适的轮播项数量和内容
  if (mode === 'cardMode' || mode === 'verticalCard') {
    // 卡片模式建议使用更多轮播项来展示效果
    if (props.widget.slides.length < 6) {
      const additionalSlides = [
        {
          id: '8',
          slideType: 'image',
          title: '创新教学方法',
          description: '探索新的教学模式，提升教学效果',
          src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20241213/FodSdP5QbaOQyrrQQVM7PRPu5epG/20240201225937_2027.png',
          alt: '创新教学',
          buttonText: '了解详情',
          buttonType: 'success',
          link: '#'
        },
        {
          id: '9',
          slideType: 'image',
          title: '学生风采展示',
          description: '展示学生的优秀作品和成就',
          src: 'https://cdn-portal-img.30edu.com.cn/e2219081-f9af-439e-91e1-3fb5d6df22bd/20241213/FqFmGtMXfZG2ph-zUmFJrtOiDT0F/20240106103712_7331.png',
          alt: '学生风采',
          buttonText: '查看作品',
          buttonType: 'warning',
          link: '#'
        }
      ]
      props.widget.slides.push(...additionalSlides.slice(0, 6 - props.widget.slides.length))
    }
  }
  
  // 为自动高度模式设置不同高度的内容
  if (mode === 'autoHeight') {
    props.widget.slides.forEach((slide: any, index: number) => {
      if (index === 0) {
        slide.title = '高度 100px 内容'
        slide.description = '这是一个较短的内容示例'
      } else if (index === 1) {
        slide.title = '高度 200px 内容'
        slide.description = '这是一个中等长度的内容示例，包含更多的文字描述，用于展示自动高度的效果。'
      } else if (index === 2) {
        slide.title = '高度 300px 内容'
        slide.description = '这是一个较长的内容示例，包含大量的文字描述和详细信息，用于展示自动高度功能如何根据内容自动调整轮播项的高度，提供更好的用户体验。'
      }
    })
  }
  
  console.log(`已应用预设模式: ${mode}`, config)
}

// 监听预设模式变化
watch(() => props.widget.presetMode, (newMode) => {
  if (newMode) {
    applyPresetMode(newMode)
  }
}, { immediate: false })

function onClick() {
  emit('select', props.widget.id)
}

// 轮播切换事件
function onSlideChange(index: number) {
  currentIndex.value = index
  const currentItem = props.widget.slides[index]
  emit('slideChange', index, currentItem)
  console.log('轮播切换到:', index, currentItem?.title)
}

// 按钮点击事件
function onButtonClick(item: any) {
  emit('buttonClick', item)
  console.log('轮播按钮点击:', item.title, item.link)
  
  // 如果有链接，可以在这里处理跳转
  if (item.link && item.link !== '#') {
    window.open(item.link, '_blank')
  }
}

// 图片加载错误处理
function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4='
}

// 跳转到指定轮播项
function goToSlide(index: number) {
  currentIndex.value = index
}

// 获取轮播项样式
function getSlideStyle(item: any) {
  const style: any = {}
  
  if (item.backgroundColor) {
    style.backgroundColor = item.backgroundColor
  }
  if (item.textColor) {
    style.color = item.textColor
  }
  if (item.backgroundImage) {
    style.backgroundImage = `url(${item.backgroundImage})`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
  }
  
  return style
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

.preset-mode-info {
  margin-bottom: 8px;
}

.carousel-widget {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-item {
  width: 100%;
  height: 100%;
}

.slide-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图片轮播样式 */
.image-slide {
  position: relative;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-slide:hover .slide-image {
  transform: scale(1.05);
}

/* 视频轮播样式 */
.video-slide {
  background: #000;
}

.slide-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 自定义内容样式 */
.custom-slide {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px 20px;
}

.slide-inner {
  max-width: 600px;
  margin: 0 auto;
}

/* 覆盖层样式 */
.slide-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 40px 30px 30px;
  text-align: center;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.carousel-item:hover .slide-overlay {
  transform: translateY(0);
}

.slide-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.slide-description {
  font-size: 16px;
  margin: 0 0 20px 0;
  opacity: 0.9;
  line-height: 1.5;
}

.slide-text {
  font-size: 16px;
  line-height: 1.6;
  margin: 20px 0;
}

.slide-button {
  margin-top: 15px;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

.slide-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* 自定义指示器 */
.custom-indicators {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
}

.custom-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e4e7ed;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
  font-weight: bold;
}

.custom-indicator:hover {
  background: #c0c4cc;
  transform: scale(1.1);
}

.custom-indicator.active {
  background: #409eff;
  color: white;
  transform: scale(1.2);
}

/* 自动高度模式样式 */
.carousel-widget[data-auto-height="true"] .carousel-item {
  min-height: 100px;
}

.carousel-widget[data-auto-height="true"] .slide-content {
  min-height: 100px;
  align-items: flex-start;
  padding: 20px;
}

.carousel-widget[data-auto-height="true"] .slide-content.image-slide {
  padding: 0;
}

.carousel-widget[data-auto-height="true"] .slide-overlay {
  position: relative;
  transform: none;
  background: rgba(0, 0, 0, 0.7);
  margin-top: 10px;
  border-radius: 8px;
}

/* Element Plus 样式覆盖 */
/* :deep(.el-carousel__indicator) {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  transition: all 0.3s ease;
}

:deep(.el-carousel__indicator.is-active) {
  background-color: #409eff;
  transform: scale(1.2);
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 255, 255, 0.8);
  color: #409eff;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  transition: all 0.3s ease;
}

:deep(.el-carousel__arrow:hover) {
  background-color: #409eff;
  color: white;
  transform: scale(1.1);
}

:deep(.el-carousel__container) {
  border-radius: 8px;
  overflow: hidden;
} */
</style> 