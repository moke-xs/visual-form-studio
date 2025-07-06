<template>
  <div class="home-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <BrandLogo :show-tagline="true" />
        </div>
        <div class="header-right">
          <el-button @click="goToLogin" v-if="!isLoggedIn">
            <i class="mdi mdi-login"></i>
            登录
          </el-button>
          <el-button @click="goToRegister" v-if="!isLoggedIn">
            <i class="mdi mdi-account-plus"></i>
            注册
          </el-button>
          <el-button @click="goToDashboard" v-if="isLoggedIn">
            <i class="mdi mdi-view-dashboard"></i>
            进入系统
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 欢迎区域 -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">欢迎使用表单管理系统</h1>
          <p class="welcome-subtitle">
            快速创建、设计和管理您的在线表单，收集数据从未如此简单
          </p>
          <div class="welcome-actions">
            <el-button type="primary" size="large" @click="goToDemo">
              <i class="mdi mdi-play"></i>
              查看演示
            </el-button>
            <el-button size="large" @click="goToLogin" v-if="!isLoggedIn">
              <i class="mdi mdi-rocket"></i>
              开始使用
            </el-button>
          </div>
        </div>
      </div>

      <!-- 功能特色 -->
      <div class="features-section">
        <h2 class="section-title">主要功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="mdi mdi-palette"></i>
            </div>
            <h3>可视化设计器</h3>
            <p>拖拽式表单设计，支持多种组件类型，所见即所得</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="mdi mdi-share"></i>
            </div>
            <h3>便捷分享</h3>
            <p>一键生成分享链接，支持公开填写，无需注册</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="mdi mdi-chart-bar"></i>
            </div>
            <h3>数据分析</h3>
            <p>实时统计和数据分析，了解表单使用情况</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="mdi mdi-database"></i>
            </div>
            <h3>数据管理</h3>
            <p>完整的表单数据管理，支持导出和批量操作</p>
          </div>
        </div>
      </div>

      <!-- 演示区域 -->
      <div class="demo-section" v-if="showDemo">
        <h2 class="section-title">表单填写演示</h2>
        <div class="demo-content">
          <div class="demo-info">
            <h3>体验表单填写</h3>
            <p>点击下方按钮体验表单填写功能，无需登录即可使用</p>
            <div class="demo-actions">
              <el-button type="primary" @click="openDemoForm">
                <i class="mdi mdi-file-document"></i>
                填写演示表单
              </el-button>
              <el-button @click="hideDemo">
                <i class="mdi mdi-close"></i>
                关闭演示
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <div class="page-footer">
      <div class="footer-content">
        <p>&copy; 2024 表单管理系统. 让数据收集更简单.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BrandLogo from '../components/BrandLogo.vue'

const router = useRouter()
const showDemo = ref(false)

// 计算属性
const isLoggedIn = computed(() => {
  return !!localStorage.getItem('token')
})

// 方法
const goToLogin = () => {
  router.push('/auth/login')
}

const goToRegister = () => {
  router.push('/auth/register')
}

const goToDashboard = () => {
  router.push('/forms')
}

const goToDemo = () => {
  showDemo.value = true
}

const hideDemo = () => {
  showDemo.value = false
}

const openDemoForm = () => {
  // 打开演示表单
  const demoFormKey = 'demo-feedback-001'
  window.open(`/fill/${demoFormKey}`, '_blank')
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-right {
    display: flex;
    gap: 12px;
  }
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  width: 100%;
}

.welcome-section {
  text-align: center;
  margin-bottom: 80px;
  
  .welcome-content {
    max-width: 800px;
    margin: 0 auto;
    
    .welcome-title {
      font-size: 48px;
      font-weight: 700;
      color: white;
      margin: 0 0 24px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .welcome-subtitle {
      font-size: 20px;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 40px 0;
      line-height: 1.6;
    }
    
    .welcome-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

.features-section {
  margin-bottom: 80px;
  
  .section-title {
    text-align: center;
    font-size: 36px;
    font-weight: 600;
    color: white;
    margin: 0 0 48px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
    
    .feature-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 32px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 48px rgba(31, 38, 135, 0.3);
      }
      
      .feature-icon {
        font-size: 48px;
        color: #667eea;
        margin-bottom: 20px;
      }
      
      h3 {
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 16px 0;
      }
      
      p {
        color: #7f8c8d;
        line-height: 1.6;
        margin: 0;
      }
    }
  }
}

.demo-section {
  .section-title {
    text-align: center;
    font-size: 36px;
    font-weight: 600;
    color: white;
    margin: 0 0 32px 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .demo-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .demo-info {
      max-width: 600px;
      margin: 0 auto;
      
      h3 {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0 0 16px 0;
      }
      
      p {
        color: #7f8c8d;
        line-height: 1.6;
        margin: 0 0 24px 0;
      }
      
      .demo-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}

.page-footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    text-align: center;
    
    p {
      color: #7f8c8d;
      margin: 0;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 24px 16px;
  }
  
  .welcome-title {
    font-size: 32px !important;
  }
  
  .welcome-subtitle {
    font-size: 16px !important;
  }
  
  .section-title {
    font-size: 28px !important;
  }
  
  .features-grid {
    grid-template-columns: 1fr !important;
    gap: 24px !important;
  }
  
  .feature-card {
    padding: 24px !important;
  }
  
  .demo-content {
    padding: 24px !important;
  }
}
</style> 