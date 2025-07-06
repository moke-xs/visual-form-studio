import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../store/auth'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  
  // 表单管理相关路由
  {
    path: '/forms',
    name: 'FormList',
    component: () => import('../pages/forms/FormList.vue'),
    meta: {
      title: '表单管理',
      requiresAuth: true
    }
  },
  {
    path: '/forms/create',
    name: 'FormCreate',
    component: () => import('../pages/forms/FormCreate.vue'),
    meta: {
      title: '创建表单',
      requiresAuth: true
    }
  },
  {
    path: '/forms/:id/edit',
    name: 'FormEdit',
    component: () => import('../pages/forms/FormEdit.vue'),
    meta: {
      title: '编辑表单',
      requiresAuth: true
    }
  },
  {
    path: '/forms/:id/preview',
    name: 'FormPreview',
    component: () => import('../pages/forms/FormPreview.vue'),
    meta: {
      title: '预览表单',
      requiresAuth: true
    }
  },
  {
    path: '/forms/:id/permission',
    name: 'FormPermission',
    component: () => import('../pages/forms/FormPermission.vue'),
    meta: {
      title: '表单权限设置',
      requiresAuth: true
    }
  },
  {
    path: '/forms/:id/stats',
    name: 'FormStats',
    component: () => import('../pages/forms/FormStats.vue'),
    meta: {
      title: '表单访问统计',
      requiresAuth: true
    }
  },
  {
    path: '/forms/:id/analyze',
    name: 'FormAnalyze',
    component: () => import('../pages/forms/FormAnalyze.vue'),
    meta: {
      title: '表单分析',
      requiresAuth: true
    }
  },
  {
    path: '/forms/:id/move',
    name: 'FormMove',
    component: () => import('../pages/forms/FormMove.vue'),
    meta: {
      title: '移动表单',
      requiresAuth: true
    }
  },
  
  // 设计器路由（现有功能）
  {
    path: '/designer/:id?',
    name: 'Designer',
    component: () => import('../components/Designer.vue'),
    meta: {
      title: '表单设计器',
      requiresAuth: true
    }
  },
  

  
  // 数据管理路由
  {
    path: '/data/:formId',
    name: 'DataList',
    component: () => import('../pages/data/DataList.vue'),
    meta: {
      title: '数据管理',
      requiresAuth: true
    }
  },
  {
    path: '/data/:formId/:dataId',
    name: 'DataDetail',
    component: () => import('../pages/data/DataDetail.vue'),
    meta: {
      title: '数据详情',
      requiresAuth: true
    }
  },
  
  // 模板管理路由
  {
    path: '/templates',
    name: 'TemplateList',
    component: () => import('../pages/templates/TemplateList.vue'),
    meta: {
      title: '模板管理',
      requiresAuth: true
    }
  },
  
  // 仪表板路由
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/dashboard/Overview.vue'),
    meta: {
      title: '仪表板',
      requiresAuth: true
    }
  },
  
  // 认证相关路由
  {
    path: '/auth',
    redirect: '/auth/login'
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('../pages/auth/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('../pages/auth/Register.vue'),
    meta: {
      title: '注册'
    }
  },
  
  // 表单填写页面（公开访问）
  {
    path: '/fill/:formKey',
    name: 'FormFill',
    component: () => import('../pages/forms/FormFill.vue'),
    meta: {
      title: '填写表单'
    }
  },
  
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFound.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  document.title = to.meta?.title ? `${to.meta.title} - 表单管理系统` : '表单管理系统'
  
  // 检查是否需要认证
  if (to.meta?.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      // 未登录，跳转到登录页
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 如果有token但没有用户信息，尝试获取用户信息
    const authStore = useAuthStore()
    if (!authStore.user && token) {
      try {
        console.log('路由守卫：尝试获取用户信息...')
        await authStore.fetchUserProfile()
        console.log('路由守卫：用户信息获取成功')
      } catch (error) {
        console.error('路由守卫：获取用户信息失败:', error)
        // 获取用户信息失败，清除token并跳转登录页
        authStore.clearAuth()
        next({
          name: 'Login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }
  
  // 如果已登录用户访问登录页，重定向到首页
  if (to.name === 'Login' || to.name === 'Register') {
    const token = localStorage.getItem('token')
    if (token) {
      next({ name: 'FormList' })
      return
    }
  }
  
  next()
})

export default router 