<template>
  <div class="not-found-container">
    <!-- 顶部品牌区域 -->
    <div class="brand-section">
      <BrandLogo mode="complete" theme="dark" />
    </div>

    <!-- 主要内容区域 -->
    <div class="content-section">
      <div class="error-content glass-card">
        <div class="error-illustration">
          <div class="error-code">404</div>
          <div class="error-icon">
            <i class="mdi mdi-emoticon-sad-outline"></i>
          </div>
        </div>
        
        <div class="error-message">
          <h1>页面走丢了</h1>
          <p>抱歉，您访问的页面不存在或已被删除</p>
          <div class="error-details">
            <div class="detail-item">
              <i class="mdi mdi-information-outline"></i>
              <span>可能的原因：页面已移动、删除或URL输入错误</span>
            </div>
            <div class="detail-item">
              <i class="mdi mdi-lightbulb-outline"></i>
              <span>建议：检查URL拼写或使用下方导航返回</span>
            </div>
          </div>
        </div>

        <div class="navigation-actions">
          <div class="primary-actions">
            <el-button type="primary" size="large" @click="goHome">
              <i class="mdi mdi-home"></i>
              返回首页
            </el-button>
            <el-button size="large" @click="goBack">
              <i class="mdi mdi-arrow-left"></i>
              返回上页
            </el-button>
          </div>
          
          <div class="quick-links">
            <h4>快速导航</h4>
            <div class="link-grid">
              <div class="link-item" @click="navigateTo('/forms')">
                <i class="mdi mdi-file-document"></i>
                <span>表单管理</span>
              </div>
              <div class="link-item" @click="navigateTo('/templates')">
                <i class="mdi mdi-file-document-multiple"></i>
                <span>模板市场</span>
              </div>
              <div class="link-item" @click="navigateTo('/dashboard')">
                <i class="mdi mdi-chart-box"></i>
                <span>数据分析</span>
              </div>
              <div class="link-item" @click="navigateTo('/forms/create')">
                <i class="mdi mdi-plus-circle"></i>
                <span>创建表单</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 帮助信息 -->
      <div class="help-section glass-card">
        <div class="help-header">
          <h3>
            <i class="mdi mdi-help-circle-outline"></i>
            需要帮助？
          </h3>
        </div>
        <div class="help-content">
          <div class="help-item">
            <div class="help-icon">
              <i class="mdi mdi-book-open-page-variant"></i>
            </div>
            <div class="help-text">
              <h4>查看帮助文档</h4>
              <p>了解更多功能和使用方法</p>
            </div>
            <el-button text @click="openHelp">
              查看 <i class="mdi mdi-arrow-right"></i>
            </el-button>
          </div>
          
          <div class="help-item">
            <div class="help-icon">
              <i class="mdi mdi-message-text"></i>
            </div>
            <div class="help-text">
              <h4>联系客服</h4>
              <p>获得专业的技术支持</p>
            </div>
            <el-button text @click="contactSupport">
              联系 <i class="mdi mdi-arrow-right"></i>
            </el-button>
          </div>
          
          <div class="help-item">
            <div class="help-icon">
              <i class="mdi mdi-bug"></i>
            </div>
            <div class="help-text">
              <h4>反馈问题</h4>
              <p>帮助我们改进产品</p>
            </div>
            <el-button text @click="reportIssue">
              反馈 <i class="mdi mdi-arrow-right"></i>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-item item-1"></div>
      <div class="decoration-item item-2"></div>
      <div class="decoration-item item-3"></div>
      <div class="decoration-item item-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import BrandLogo from '../components/BrandLogo.vue'
const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}

const openHelp = () => {
  window.open('https://docs.visual-form-studio.com', '_blank')
}

const contactSupport = () => {
  ElMessage.info('客服功能开发中，您可以通过邮箱联系我们')
}

const reportIssue = () => {
  ElMessage.info('问题反馈功能开发中')
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.brand-section {
  text-align: center;
  margin-bottom: 30px;
}

.content-section {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.error-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 16px 64px rgba(31, 38, 135, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-illustration {
  margin-bottom: 32px;
  position: relative;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
  line-height: 1;
}

.error-icon {
  font-size: 48px;
  color: #94a3b8;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-10px);
  }
  70% {
    transform: translateY(-5px);
  }
  90% {
    transform: translateY(-2px);
  }
}

.error-message {
  margin-bottom: 40px;
}

.error-message h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.error-message p {
  font-size: 18px;
  color: #718096;
  margin: 0 0 24px 0;
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  text-align: left;
}

.detail-item i {
  color: #667eea;
  font-size: 16px;
  flex-shrink: 0;
}

.navigation-actions {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.primary-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.quick-links h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-item:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.link-item i {
  font-size: 24px;
  color: #667eea;
}

.link-item span {
  font-size: 12px;
  color: #4a5568;
  font-weight: 500;
}

.feature-recommendation {
  max-width: 100%;
}

.help-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.help-header h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.help-header h3 i {
  color: #667eea;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.03);
  border: 1px solid rgba(102, 126, 234, 0.08);
  transition: all 0.3s ease;
}

.help-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: rgba(102, 126, 234, 0.15);
}

.help-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.help-icon i {
  font-size: 24px;
  color: white;
}

.help-text {
  flex: 1;
}

.help-text h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.help-text p {
  margin: 0;
  font-size: 13px;
  color: #718096;
}

.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.decoration-item {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.decoration-item.item-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.decoration-item.item-2 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 15%;
  animation-delay: 2s;
}

.decoration-item.item-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.decoration-item.item-4 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 10%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .not-found-container {
    padding: 15px;
  }
  
  .error-content {
    padding: 32px 24px;
  }
  
  .error-code {
    font-size: 80px;
  }
  
  .error-message h1 {
    font-size: 24px;
  }
  
  .error-message p {
    font-size: 16px;
  }
  
  .primary-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .link-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .help-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .help-text {
    order: 1;
  }
  
  .decoration-item {
    display: none;
  }
}

@media (max-width: 480px) {
  .error-details {
    align-items: flex-start;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .link-grid {
    grid-template-columns: 1fr;
  }
}
</style> 