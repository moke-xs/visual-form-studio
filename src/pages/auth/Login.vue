<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 品牌LOGO区域 -->
      <div class="brand-section">
        <BrandLogo :show-tagline="true" dark />
      </div>
      
      <!-- 登录表单区域 -->
      <div class="login-form">
        <h2>欢迎回来</h2>
        <p>登录您的账户继续使用</p>
        
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form-content"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="userNameOrEmail" class="form-item">
            <el-input
              v-model="loginForm.userNameOrEmail"
              placeholder="请输入用户名或邮箱"
              size="large"
              class="glass-input"
              clearable
            >
              <template #prefix>
                <i class="mdi mdi-account-outline"></i>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password" class="form-item">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              class="glass-input"
              show-password
              clearable
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <i class="mdi mdi-lock-outline"></i>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item class="form-item">
            <div class="login-options">
              <el-checkbox v-model="loginForm.rememberMe">
                记住我
              </el-checkbox>
              <el-button text class="forgot-password">
                忘记密码？
              </el-button>
            </div>
          </el-form-item>
          
          <el-form-item class="form-item">
            <el-button 
              type="primary" 
              size="large" 
              class="login-button"
              :loading="loading"
              @click="handleLogin"
            >
              <i class="mdi mdi-login" v-if="!loading"></i>
              {{ loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="demo-account">
          <p class="demo-title">演示账户</p>
          <div class="demo-info">
            <span>邮箱：admin@ailearnCube.com</span>
            <span>密码：Admin@123456</span>
          </div>
          <el-button text @click="fillDemoAccount" class="demo-button">
            <i class="mdi mdi-account-check"></i>
            使用演示账户
          </el-button>
        </div>
        
        <div class="auth-links">
          <router-link to="/auth/register" class="auth-link">
            还没有账户？立即注册
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../../store/auth'
import type { LoginParams } from '../../types/auth'
import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 登录表单数据
const loginForm = reactive<LoginParams>({
  userNameOrEmail: 'admin@ailearnCube.com',
  password: 'Admin@123456',
  rememberMe: false
})

// 表单验证规则
const loginRules: FormRules = {
  userNameOrEmail: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' },
    { min: 3, message: '用户名或邮箱长度不能少于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    await authStore.login(loginForm)
    
    // 获取重定向地址
    const redirect = route.query.redirect as string
    
    // 跳转到目标页面或默认页面
    await router.push(redirect || '/forms')
    
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 填充演示账户
const fillDemoAccount = () => {
  loginForm.userNameOrEmail = 'admin@ailearnCube.com'
  loginForm.password = 'Admin@123456'
  loginForm.rememberMe = true
}
</script>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f6fa;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.1;
    z-index: 0;
  }
  
  .login-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
    text-align: center;
    min-width: 420px;
    max-width: 480px;
    position: relative;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 25px 70px rgba(102, 126, 234, 0.2);
      border-color: rgba(102, 126, 234, 0.3);
    }
    
    .brand-section {
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);
    }
    
    .login-form {
      h2 {
        color: #2c3e50;
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
      }
      
      p {
        margin-bottom: 16px;
        color: #5a6c7d;
        font-size: 14px;
        font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
      }
      
      .login-form-content {
        margin-top: 24px;
        
        .form-item {
          margin-bottom: 20px;
          
          :deep(.el-form-item__content) {
            flex-direction: column;
            align-items: stretch;
          }
          
          .glass-input {
            :deep(.el-input__wrapper) {
              background: rgba(255, 255, 255, 0.9) !important;
              backdrop-filter: blur(8px);
              border: 1px solid rgba(102, 126, 234, 0.2) !important;
              border-radius: 12px !important;
              box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1) !important;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
              height: 40px !important;
              
              &:hover {
                border-color: rgba(102, 126, 234, 0.4) !important;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15) !important;
              }
              
              &.is-focus {
                border-color: #667eea !important;
                box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
              }
            }
            
            :deep(.el-input__inner) {
              color: #2c3e50 !important;
              font-weight: 500 !important;
              font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
            }
            
            :deep(.el-input__prefix) {
              color: #667eea !important;
            }
          }
        }
        
        .login-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          :deep(.el-checkbox) {
            .el-checkbox__label {
              color: #5a6c7d;
              font-size: 14px;
              font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
            }
            
            .el-checkbox__input.is-checked .el-checkbox__inner {
              background-color: #667eea !important;
              border-color: #667eea !important;
            }
          }
          
          .forgot-password {
            color: #667eea !important;
            font-size: 14px !important;
            padding: 0 !important;
            font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
            
            &:hover {
              color: #5a6fd8 !important;
            }
          }
        }
        
        .login-button {
          border-radius: 12px !important;
          font-weight: 500 !important;
          padding: 12px 32px !important;
          height: 40px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 2px solid transparent !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3) !important;
          width: 100% !important;
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
          
          &:hover:not(.is-loading) {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
          }
          
          &.is-loading {
            opacity: 0.8;
          }
        }
      }
      
      .demo-account {
        margin: 24px 0;
        padding: 16px;
        background: rgba(102, 126, 234, 0.05);
        border: 1px solid rgba(102, 126, 234, 0.1);
        border-radius: 12px;
        
        .demo-title {
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
          margin: 0 0 8px 0;
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
        }
        
        .demo-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 12px;
          
          span {
            font-size: 12px;
            color: #5a6c7d;
            font-family: 'Courier New', monospace;
            background: rgba(255, 255, 255, 0.6);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
        
        .demo-button {
          color: #667eea !important;
          font-size: 13px !important;
          padding: 4px 8px !important;
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif !important;
          
          &:hover {
            color: #5a6fd8 !important;
            background: rgba(102, 126, 234, 0.1) !important;
          }
        }
      }
      
      .auth-links {
        margin-top: 24px;
        
        .auth-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
          font-family: 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', Arial, sans-serif;
          
          &:hover {
            color: #5a6fd8;
            text-decoration: underline;
          }
        }
      }
    }
  }
}
</style> 