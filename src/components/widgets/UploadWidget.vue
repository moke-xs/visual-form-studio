<template>
  <div @click.stop="onClick" class="widget-content">
    <div class="widget-label" v-if="widget.label">
      {{ widget.label }}
      <span v-if="widget.required" class="required-mark">*</span>
    </div>
    
    <!-- 预设模式信息 -->
    <div v-if="widget.presetMode && widget.presetMode !== 'custom'" class="preset-mode-info">
      <small>当前模式：{{ getPresetModeLabel(widget.presetMode) }}</small>
    </div>

    <!-- 基础上传 -->
    <el-upload
      v-if="widget.uploadMode === 'basic'"
      :action="widget.action"
      :multiple="widget.multiple"
      :limit="widget.limit"
      :file-list="widget.fileList"
      :list-type="widget.listType"
      :auto-upload="widget.autoUpload"
      :disabled="widget.disabled"
      :accept="widget.accept"
      :show-file-list="widget.showFileList"
      :drag="widget.drag"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :on-remove="onRemove"
      :on-exceed="onExceed"
      class="upload-widget"
    >
      <!-- 拖拽上传区域 -->
      <div v-if="widget.drag" class="upload-drag-area">
        <el-icon class="upload-icon"><i class="mdi mdi-cloud-upload-outline"></i></el-icon>
        <div class="upload-text">
          <div class="upload-title">{{ widget.dragText || '将文件拖到此处，或点击上传' }}</div>
          <div class="upload-hint">{{ widget.dragHint || '支持单个或批量上传' }}</div>
        </div>
      </div>
      <!-- 普通上传按钮 -->
      <el-button v-else :type="widget.buttonType">
        <el-icon><i :class="getUploadIcon()"></i></el-icon>
        {{ widget.buttonText || '点击上传' }}
      </el-button>
      
      <!-- 提示文字 -->
      <template #tip v-if="widget.showTip">
        <div class="upload-tip">
          {{ widget.tipText || '只能上传jpg/png文件，且不超过500kb' }}
        </div>
      </template>
    </el-upload>

    <!-- 头像上传 -->
    <el-upload
      v-else-if="widget.uploadMode === 'avatar'"
      :action="widget.action"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="onAvatarSuccess"
      class="avatar-uploader"
    >
      <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
      <el-icon v-else class="avatar-uploader-icon">
        <i class="mdi mdi-plus"></i>
      </el-icon>
    </el-upload>

    <!-- 照片墙 -->
    <el-upload
      v-else-if="widget.uploadMode === 'picture-card'"
      :action="widget.action"
      :file-list="widget.fileList"
      list-type="picture-card"
      :limit="widget.limit"
      :multiple="widget.multiple"
      :on-preview="onPreview"
      :on-remove="onRemove"
      :before-upload="beforeUpload"
      class="picture-card-uploader"
    >
      <el-icon><i class="mdi mdi-plus"></i></el-icon>
    </el-upload>

    <!-- 手动上传 -->
    <el-upload
      v-else-if="widget.uploadMode === 'manual'"
      ref="uploadRef"
      :action="widget.action"
      :limit="widget.limit"
      :auto-upload="false"
      :file-list="widget.fileList"
      :before-upload="beforeUpload"
      class="manual-uploader"
    >
      <template #trigger>
        <el-button type="primary">{{ widget.selectText || '选择文件' }}</el-button>
      </template>
      <el-button class="ml-3" type="success" @click="submitUpload">
        {{ widget.uploadText || '上传到服务器' }}
      </el-button>
      <template #tip>
        <div class="upload-tip">
          {{ widget.tipText || '限制1个文件，新文件将覆盖旧文件' }}
        </div>
      </template>
    </el-upload>

    <!-- 图片预览对话框 -->
    <el-dialog v-model="previewVisible" title="图片预览" width="600px" class="glass-dialog">
      <img w-full :src="previewImageUrl" alt="预览图片" style="width: 100%; height: auto;" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
export const widgetMeta = {
  type: 'UploadWidget',
  label: '上传',
  icon: 'mdi mdi-cloud-upload-outline',
  category: 'form',

  defaultProps: {
    label: '文件上传',
    required: false,
    action: 'https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15',
    multiple: false,
    limit: 3,
    fileList: [],
    listType: 'text',
    autoUpload: true,
    disabled: false,
    accept: '',
    showFileList: true,
    drag: false,
    uploadMode: 'basic',
    buttonType: 'primary',
    buttonText: '点击上传',
    dragText: '将文件拖到此处，或点击上传',
    dragHint: '支持单个或批量上传',
    showTip: true,
    tipText: '只能上传jpg/png文件，且不超过500kb',
    selectText: '选择文件',
    uploadText: '上传到服务器',
    maxSize: 500,
    allowedTypes: ['image/jpeg', 'image/png'],
    presetMode: 'basic'
  },
  propertySchema: [
    { key: 'label', label: '标题', type: 'input', placeholder: '控件标题' },
    { key: 'required', label: '必填', type: 'switch' },
    {
      key: 'presetMode',
      label: '预设模式',
      type: 'select',
      options: [
        { label: '自定义', value: 'custom' },
        { label: '基础上传', value: 'basic' },
        { label: '拖拽上传', value: 'drag' },
        { label: '头像上传', value: 'avatar' },
        { label: '照片墙', value: 'picture-card' },
        { label: '手动上传', value: 'manual' },
        { label: '多文件上传', value: 'multiple' },
        { label: '文件类型限制', value: 'file-types' }
      ]
    },
    {
      key: 'uploadMode',
      label: '上传模式',
      type: 'select',
      options: [
        { label: '基础上传', value: 'basic' },
        { label: '头像上传', value: 'avatar' },
        { label: '照片墙', value: 'picture-card' },
        { label: '手动上传', value: 'manual' }
      ]
    },
    { key: 'action', label: '上传地址', type: 'input', placeholder: '文件上传的服务器地址' },
    { key: 'multiple', label: '多选', type: 'switch' },
    { key: 'limit', label: '文件数量限制', type: 'number', min: 1, max: 20 },
    {
      key: 'listType',
      label: '文件列表类型',
      type: 'select',
      options: [
        { label: '文本', value: 'text' },
        { label: '图片', value: 'picture' },
        { label: '照片墙', value: 'picture-card' }
      ]
    },
    { key: 'autoUpload', label: '自动上传', type: 'switch' },
    { key: 'disabled', label: '禁用', type: 'switch' },
    { key: 'accept', label: '接受文件类型', type: 'input', placeholder: '如：.jpg,.png,.pdf' },
    { key: 'showFileList', label: '显示文件列表', type: 'switch' },
    { key: 'drag', label: '拖拽上传', type: 'switch' },
    {
      key: 'buttonType',
      label: '按钮类型',
      type: 'select',
      options: [
        { label: '主要', value: 'primary' },
        { label: '成功', value: 'success' },
        { label: '警告', value: 'warning' },
        { label: '危险', value: 'danger' },
        { label: '信息', value: 'info' }
      ]
    },
    { key: 'buttonText', label: '按钮文字', type: 'input', placeholder: '上传按钮显示文字' },
    { key: 'dragText', label: '拖拽提示', type: 'input', placeholder: '拖拽区域主要文字' },
    { key: 'dragHint', label: '拖拽说明', type: 'input', placeholder: '拖拽区域说明文字' },
    { key: 'showTip', label: '显示提示', type: 'switch' },
    { key: 'tipText', label: '提示文字', type: 'input', placeholder: '上传提示信息' },
    { key: 'selectText', label: '选择文字', type: 'input', placeholder: '手动上传选择按钮文字' },
    { key: 'uploadText', label: '上传文字', type: 'input', placeholder: '手动上传提交按钮文字' },
    { key: 'maxSize', label: '文件大小限制(KB)', type: 'number', min: 1, max: 10240 },
    {
      key: 'allowedTypes',
      label: '允许的文件类型',
      type: 'array',
      minItems: 1,
      itemSchema: [
        { 
          key: 'type', 
          label: '类型', 
          type: 'select',
          width: '100%',
          defaultValue: 'image/jpeg',
          options: [
            { label: 'JPEG图片', value: 'image/jpeg' },
            { label: 'PNG图片', value: 'image/png' },
            { label: 'GIF图片', value: 'image/gif' },
            { label: 'PDF文档', value: 'application/pdf' },
            { label: 'Word文档', value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
            { label: 'Excel表格', value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
            { label: 'ZIP压缩包', value: 'application/zip' },
            { label: '文本文件', value: 'text/plain' }
          ]
        }
      ]
    }
  ]
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadProps, UploadFile } from 'element-plus'

defineOptions({ name: 'UploadWidget' })

const props = defineProps<{
  widget: any
  selected: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

// 响应式数据
const avatarUrl = ref('')
const previewVisible = ref(false)
const previewImageUrl = ref('')
const uploadRef = ref()

// 监听预设模式变化
watch(() => props.widget.presetMode, (newMode) => {
  if (!newMode || newMode === 'custom') return
  
  const presets = {
    basic: {
      uploadMode: 'basic',
      multiple: false,
      limit: 1,
      drag: false,
      showFileList: true,
      buttonText: '点击上传',
      tipText: '只能上传jpg/png文件，且不超过500kb'
    },
    drag: {
      uploadMode: 'basic',
      multiple: true,
      limit: 5,
      drag: true,
      showFileList: true,
      dragText: '将文件拖到此处，或点击上传',
      dragHint: '支持单个或批量上传'
    },
    avatar: {
      uploadMode: 'avatar',
      multiple: false,
      limit: 1,
      showFileList: false,
      accept: '.jpg,.jpeg,.png,.gif',
      maxSize: 200,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    },
    'picture-card': {
      uploadMode: 'picture-card',
      multiple: true,
      limit: 9,
      listType: 'picture-card',
      accept: '.jpg,.jpeg,.png,.gif'
    },
    manual: {
      uploadMode: 'manual',
      multiple: false,
      limit: 1,
      autoUpload: false,
      selectText: '选择文件',
      uploadText: '上传到服务器'
    },
    multiple: {
      uploadMode: 'basic',
      multiple: true,
      limit: 10,
      showFileList: true,
      buttonText: '选择多个文件'
    },
    'file-types': {
      uploadMode: 'basic',
      multiple: false,
      limit: 1,
      accept: '.pdf,.doc,.docx,.xls,.xlsx',
      allowedTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      tipText: '只能上传PDF、Word、Excel文件'
    }
  }
  
  const preset = presets[newMode as keyof typeof presets]
  if (preset) {
    Object.assign(props.widget, preset)
  }
}, { immediate: true })

function onClick() {
  emit('select', props.widget.id)
}

// 获取预设模式标签
function getPresetModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    basic: '基础上传',
    drag: '拖拽上传',
    avatar: '头像上传',
    'picture-card': '照片墙',
    manual: '手动上传',
    multiple: '多文件上传',
    'file-types': '文件类型限制'
  }
  return labels[mode] || mode
}

// 获取上传图标
function getUploadIcon() {
  return props.widget.drag ? 'mdi mdi-cloud-upload-outline' : 'mdi mdi-upload-outline'
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 文件类型校验
  if (props.widget.allowedTypes && props.widget.allowedTypes.length > 0) {
    const allowedTypes = props.widget.allowedTypes.map((item: any) => 
      typeof item === 'string' ? item : item.type
    )
    if (!allowedTypes.includes(rawFile.type)) {
      ElMessage.error('文件类型不符合要求！')
      return false
    }
  }
  
  // 文件大小校验
  if (props.widget.maxSize && rawFile.size / 1024 > props.widget.maxSize) {
    ElMessage.error(`文件大小不能超过 ${props.widget.maxSize}KB！`)
    return false
  }
  
  return true
}

// 上传成功
const onSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  ElMessage.success('上传成功！')
  console.log('上传成功:', response, uploadFile)
}

// 头像上传成功
const onAvatarSuccess: UploadProps['onSuccess'] = (uploadFile) => {
  avatarUrl.value = URL.createObjectURL(uploadFile.raw!)
  ElMessage.success('头像上传成功！')
}

// 上传失败
const onError: UploadProps['onError'] = (error) => {
  ElMessage.error('上传失败！')
  console.error('上传失败:', error)
}

// 移除文件
const onRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log('移除文件:', file, uploadFiles)
}

// 超出限制
const onExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    `当前限制选择 ${props.widget.limit} 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
      files.length + uploadFiles.length
    } 个文件`
  )
}

// 预览图片
const onPreview = (uploadFile: UploadFile) => {
  previewImageUrl.value = uploadFile.url!
  previewVisible.value = true
}

// 手动提交上传
const submitUpload = () => {
  uploadRef.value!.submit()
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
  color: #666;
  font-size: 12px;
}

/* 上传组件样式 */
.upload-widget :deep(.el-upload) {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.upload-widget :deep(.el-upload:hover) {
  border-color: rgba(102, 126, 234, 0.4);
}

/* 拖拽上传区域 */
.upload-drag-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
}

.upload-drag-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.6s ease;
}

.upload-drag-area:hover {
  border-color: rgba(102, 126, 234, 0.5);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.upload-drag-area:hover::before {
  left: 100%;
}

.upload-icon {
  font-size: 56px;
  color: rgba(102, 126, 234, 0.7);
  margin-bottom: 20px;
  animation: uploadIconPulse 2s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes uploadIconPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.upload-text {
  text-align: center;
  position: relative;
  z-index: 1;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  line-height: 1.4;
}

.upload-hint {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  opacity: 0.8;
}

.upload-tip {
  color: #666;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 3px solid rgba(102, 126, 234, 0.4);
  line-height: 1.4;
}

/* 头像上传样式 */
.avatar-uploader :deep(.el-upload) {
  border: 2px dashed rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-uploader-icon {
  font-size: 36px;
  color: rgba(102, 126, 234, 0.6);
  width: 178px;
  height: 178px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: uploadIconPulse 2s ease-in-out infinite;
}

/* 照片墙样式 */
.picture-card-uploader :deep(.el-upload--picture-card) {
  border-radius: 16px;
  border: 2px dashed rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.picture-card-uploader :deep(.el-upload--picture-card:hover) {
  border-color: rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.picture-card-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  border-radius: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.picture-card-uploader :deep(.el-upload-list--picture-card .el-upload-list__item:hover) {
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

/* 手动上传样式 */
.manual-uploader {
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.manual-uploader :deep(.el-button) {
  border-radius: 12px;
  margin-right: 12px;
}

/* Element Plus Upload 组件深度样式定制 */
:deep(.el-upload-list) {
  margin-top: 16px;
}

:deep(.el-upload-list__item) {
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.15);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.08);
  margin-bottom: 8px;
}

:deep(.el-upload-list__item:hover) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.12);
}

:deep(.el-button) {
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

:deep(.el-button:active) {
  transform: translateY(0);
}
</style> 