<template>
  <div class="register-page">
    <div class="register-container">
      <!-- 品牌LOGO区域 -->
      <div class="brand-section">
        <BrandLogo :show-tagline="true" dark />
      </div>
      
      <!-- 注册表单区域 -->
      <div class="register-form">
        <h2>创建新账户</h2>
        <p>加入我们，开始创建您的表单</p>
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" class="register-form-content" @submit.prevent="handleRegister">
          <el-form-item prop="userName">
            <el-input v-model="registerForm.userName" placeholder="请输入用户名" size="large" clearable>
              <template #prefix>
                <i class="mdi mdi-account-outline"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="email">
            <el-input v-model="registerForm.email" placeholder="请输入邮箱" size="large" clearable>
              <template #prefix>
                <i class="mdi mdi-email-outline"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" size="large" show-password clearable>
              <template #prefix>
                <i class="mdi mdi-lock-outline"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large" show-password clearable>
              <template #prefix>
                <i class="mdi mdi-lock-check-outline"></i>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="register-button" :loading="loading" @click="handleRegister">
              <i class="mdi mdi-account-plus" v-if="!loading"></i>
              {{ loading ? '注册中...' : '立即注册' }}
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="auth-links">
          <router-link to="/auth/login" class="auth-link">
            已有账户？立即登录
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '../../store/auth'

import BrandLogo from '../../components/BrandLogo.vue'

const router = useRouter()
const authStore = useAuthStore()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)

const registerForm = reactive<any>({
  userName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const registerRules: FormRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名不能少于3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不能少于6个字符', trigger: 'blur' },
    { pattern: /[a-z]/, message: '密码需包含小写字母', trigger: 'blur' },
    { pattern: /[A-Z]/, message: '密码需包含大写字母', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: (_rule: any, value: string, callback: any) => {
      if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  try {
    await registerFormRef.value.validate()
    loading.value = true
    await authStore.register({
      userName: registerForm.userName,
      email: registerForm.email,
      password: registerForm.password,
      ConfirmPassword: registerForm.confirmPassword
    } as any)
    // 注册成功后跳转到登录页
    router.push('/auth/login')
  } catch (error) {
    // 错误提示已由store处理
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-page {
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
  
  .register-container {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(102, 126, 234, 0.2);
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.15);
    text-align: center;
    min-width: 400px;
    max-width: 450px;
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
    
    .register-form {
      h2 {
        color: #2c3e50;
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      p {
        margin-bottom: 16px;
        color: #5a6c7d;
        font-size: 14px;
      }
      
      .register-form-content {
        margin-top: 24px;
        .el-form-item {
          margin-bottom: 20px;
        }
        .register-button {
          border-radius: 12px !important;
          font-weight: 500 !important;
          padding: 12px 32px !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 2px solid transparent !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3) !important;
          width: 100% !important;
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
      .auth-links {
        margin-top: 24px;
        
        .auth-link {
          color: #667eea;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s ease;
          
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