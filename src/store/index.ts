import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import { widgetMetas } from '../components/widgets'

export const useDesignerStore = defineStore('designer', () => {
  // 画布上的控件列表
  const widgetList = ref<any[]>([])

  // 当前选中控件ID
  const selectedId = ref<string | null>(null)

  // 选中控件对象
  const selectedWidget = computed(() =>
    widgetList.value.find(w => w.id === selectedId.value) || null
  )

  // 添加控件
  function addWidget(type: string) {
    console.log('store.addWidget 被调用，控件类型:', type)
    const meta = widgetMetas.value.find(meta => meta.type === type)
    console.log('找到的 meta:', meta)
    if (!meta) {
      console.log('未找到对应的控件元数据:', type)
      return
    }
    const widget = {
      id: nanoid(),
      ...JSON.parse(JSON.stringify(meta.defaultProps)), // 深拷贝默认属性，避免引用问题
      type // 确保 type 不被 defaultProps 覆盖
    }
    console.log('创建的控件对象:', widget)
    widgetList.value.push(widget)
    selectedId.value = widget.id
    console.log('控件已添加到列表，当前控件数量:', widgetList.value.length)
  }

  // 选中控件
  function selectWidget(id: string) {
    selectedId.value = id || null
  }

  // 删除控件
  function deleteWidget(id: string) {
    console.log('store.deleteWidget 被调用，控件ID:', id)
    const index = widgetList.value.findIndex(w => w.id === id)
    console.log('找到控件索引:', index)
    if (index > -1) {
      console.log('删除前控件数量:', widgetList.value.length)
      widgetList.value.splice(index, 1)
      console.log('删除后控件数量:', widgetList.value.length)
      // 如果删除的是当前选中的控件，清除选中状态
      if (selectedId.value === id) {
        console.log('清除选中状态')
        selectedId.value = null
      }
    } else {
      console.log('未找到要删除的控件')
    }
  }

  // 在指定位置添加控件
  function addWidgetAtIndex(type: string, index: number) {
    console.log('store.addWidgetAtIndex 被调用，控件类型:', type, '插入位置:', index)
    const meta = widgetMetas.value.find(meta => meta.type === type)
    console.log('找到的 meta:', meta)
    if (!meta) {
      console.log('未找到对应的控件元数据:', type)
      return
    }
    const widget = {
      id: nanoid(),
      ...JSON.parse(JSON.stringify(meta.defaultProps)), // 深拷贝默认属性，避免引用问题
      type // 确保 type 不被 defaultProps 覆盖
    }
    console.log('创建的控件对象:', widget)
    
    // 确保索引在有效范围内
    const insertIndex = Math.max(0, Math.min(index, widgetList.value.length))
    widgetList.value.splice(insertIndex, 0, widget)
    selectedId.value = widget.id
    console.log('控件已插入到位置:', insertIndex, '当前控件数量:', widgetList.value.length)
  }

  // 移动控件（拖拽排序）
  function moveWidget(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= widgetList.value.length || 
        toIndex < 0 || toIndex >= widgetList.value.length ||
        fromIndex === toIndex) {
      return
    }
    
    const widget = widgetList.value[fromIndex]
    widgetList.value.splice(fromIndex, 1)
    widgetList.value.splice(toIndex, 0, widget)
    
    console.log(`控件从位置 ${fromIndex} 移动到位置 ${toIndex}`)
  }

  return {
    widgetList,
    selectedId,
    selectedWidget,
    addWidget,
    addWidgetAtIndex,
    selectWidget,
    deleteWidget,
    moveWidget
  }
},
// 这里加上 persist 配置，开启持久化
{
  persist: {
    key: 'designer-store', // 本地存储的 key
    storage: window.localStorage, // 也可以用 sessionStorage
  }
})