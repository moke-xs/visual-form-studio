
# 表单数据API文档

## 概述

本文档包含了AILearnCube项目中所有已完成的表单数据相关API接口，包括表单管理、数据提交、数据查看等功能。
[效果图](https://raw.githubusercontent.com/moke-xs/visual-form-studio/refs/heads/master/%E5%BE%AE%E4%BF%A1%E6%88%AA%E5%9B%BE_20250706101850.png)
## 基础信息

- **基础URL**: `http://localhost:5000`
- **认证方式**: JWT Bearer Token（除标注为公开访问的接口外）
- **内容类型**: `application/json`

## 1. 表单管理接口

### 1.1 获取表单列表

**接口**: `GET /api/Forms`  
**权限**: 需要登录  
**描述**: 获取当前用户创建的表单列表

**请求参数**:
```
GET /api/Forms?page=1&pageSize=20&status=1&keyword=调查
```

**查询参数**:
- `page` (int, 可选): 页码，默认1
- `pageSize` (int, 可选): 每页数量，默认20
- `status` (int, 可选): 状态筛选 (0=草稿, 1=已发布, 2=已归档, 3=已禁用)
- `keyword` (string, 可选): 关键词搜索

**请求头**:
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "用户信息调查表",
        "description": "请填写您的个人信息",
        "category": "调查问卷",
        "formKey": "user-survey-2025",
        "status": 1,
        "viewCount": 15,
        "submitCount": 8,
        "createdAt": "2025-07-02T08:00:00Z",
        "updatedAt": "2025-07-02T10:30:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1,
    "statistics": {
      "totalForms": 1,
      "draftCount": 0,
      "publishedCount": 1,
      "archivedCount": 0,
      "disabledCount": 0,
      "totalSubmissions": 8,
      "totalCreated": 1
    }
  }
}
```

### 1.2 获取表单详情

**接口**: `GET /api/Forms/{id}`  
**权限**: 需要登录  
**描述**: 获取指定表单的详细信息

**请求参数**:
```
GET /api/Forms/1
```

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "用户信息调查表",
    "description": "请填写您的个人信息",
    "configJson": "{\"theme\":\"light\"}",
    "settingsJson": "{\"allowAnonymous\":true}",
    "category": "调查问卷",
    "status": 1,
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "formKey": "user-survey-2025",
    "customCss": "",
    "viewCount": 15,
    "submitCount": 8,
    "createdAt": "2025-07-02T08:00:00Z",
    "updatedAt": "2025-07-02T10:30:00Z",
    "templateId": null,
    "templateName": null,
    "fields": [
      {
        "id": 1,
        "fieldName": "name",
        "fieldType": "text",
        "fieldLabel": "姓名",
        "fieldOptions": "",
        "defaultValue": "",
        "validationRules": "required",
        "placeholder": "请输入您的姓名",
        "helpText": "",
        "isRequired": true,
        "isVisible": true,
        "sortOrder": 1
      }
    ]
  }
}
```

### 1.3 创建表单

**接口**: `POST /api/Forms`  
**权限**: 需要登录  
**描述**: 创建新表单

**请求体**:
```json
{
  "name": "用户信息调查表",
  "description": "请填写您的个人信息",
  "configJson": "{\"theme\":\"light\"}",
  "settingsJson": "{\"allowAnonymous\":true}",
  "category": "调查问卷",
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "formKey": "user-survey-2025",
  "customCss": "",
  "templateId": null,
  "fields": [
    {
      "fieldName": "name",
      "fieldType": "text",
      "fieldLabel": "姓名",
      "fieldOptions": "",
      "defaultValue": "",
      "validationRules": "required",
      "placeholder": "请输入您的姓名",
      "helpText": "",
      "isRequired": true,
      "isVisible": true,
      "sortOrder": 1
    }
  ]
}
```

**返回结果**:
```json
{
  "code": 200,
  "message": "表单创建成功",
  "data": {
    "id": 1,
    "name": "用户信息调查表",
    "formKey": "user-survey-2025",
    // ... 其他字段
  }
}
```

### 1.4 更新表单

**接口**: `PUT /api/Forms/{id}`  
**权限**: 需要登录  
**描述**: 更新表单信息

**请求体**: 同创建表单

**返回结果**:
```json
{
  "code": 200,
  "message": "表单更新成功",
  "data": {
    // 更新后的表单详情
  }
}
```

### 1.5 删除表单

**接口**: `DELETE /api/Forms/{id}`  
**权限**: 需要登录  
**描述**: 删除表单

**返回结果**:
```json
{
  "code": 200,
  "message": "表单删除成功",
  "data": null
}
```

### 1.6 复制表单

**接口**: `POST /api/Forms/{id}/copy`  
**权限**: 需要登录  
**描述**: 复制现有表单

**请求体**:
```json
{
  "newFormName": "用户信息调查表-副本",
  "targetFolderId": null,
  "copyData": false,
  "description": "复制的表单"
}
```

**返回结果**:
```json
{
  "code": 200,
  "message": "复制成功",
  "data": {
    "newFormId": 2,
    "newFormName": "用户信息调查表-副本",
    "newFormKey": "user-survey-2025-copy"
  }
}
```

### 1.7 更新表单状态

**接口**: `PUT /api/Forms/{id}/status`  
**权限**: 需要登录  
**描述**: 更新表单状态

**请求体**:
```json
{
  "status": 1
}
```

**状态值**:
- 0: 草稿
- 1: 已发布
- 2: 已归档
- 3: 已禁用

**返回结果**:
```json
{
  "code": 200,
  "message": "表单状态更新成功",
  "data": null
}
```

### 1.8 保存表单为模板

**接口**: `POST /api/Forms/{id}/save-as-template`  
**权限**: 需要登录  
**描述**: 将表单保存为模板

**请求体**:
```json
{
  "name": "用户信息调查模板",
  "description": "用于收集用户基本信息的模板",
  "category": "调查问卷"
}
```

**返回结果**:
```json
{
  "code": 200,
  "message": "表单已保存为模板",
  "data": null
}
```

### 1.9 根据FormKey获取表单信息（公开访问）

**接口**: `GET /api/Forms/key/{formKey}`  
**权限**: 无需登录（公开访问）  
**描述**: 根据FormKey获取表单信息，用于填写表单页面

**请求参数**:
```
GET /api/Forms/key/user-survey-2025
```

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "用户信息调查表",
    "description": "请填写您的个人信息",
    "configJson": "{\"theme\":\"light\"}",
    "settingsJson": "{\"allowAnonymous\":true}",
    "category": "调查问卷",
    "status": 1,
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "formKey": "user-survey-2025",
    "customCss": "",
    "viewCount": 16,
    "submitCount": 8,
    "createdAt": "2025-07-02T08:00:00Z",
    "updatedAt": "2025-07-02T10:30:00Z",
    "templateId": null,
    "templateName": null,
    "fields": [
      {
        "id": 1,
        "fieldName": "name",
        "fieldType": "text",
        "fieldLabel": "姓名",
        "fieldOptions": "",
        "defaultValue": "",
        "validationRules": "required",
        "placeholder": "请输入您的姓名",
        "helpText": "",
        "isRequired": true,
        "isVisible": true,
        "sortOrder": 1
      }
    ]
  }
}
```

## 2. 表单数据提交接口

### 2.1 登录用户提交表单

**接口**: `POST /api/FormData/forms/{formId}/submit`  
**权限**: 需要登录  
**描述**: 登录用户提交表单数据

**请求体**:
```json
{
  "fieldValues": {
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "age": 25,
    "gender": "男",
    "interests": ["阅读", "运动"],
    "comments": "这是一条测试提交"
  }
}
```

**返回结果**:
```json
{
  "code": 200,
  "message": "表单提交成功",
  "data": {
    "id": 1,
    "formId": 1,
    "formName": "用户信息调查表",
    "fieldValues": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "age": 25,
      "gender": "男",
      "interests": ["阅读", "运动"],
      "comments": "这是一条测试提交"
    },
    "submittedAt": "2025-07-02T10:30:00Z",
    "submittedBy": 1,
    "submitterName": "张三",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### 2.2 匿名用户提交表单

**接口**: `POST /api/FormData/submit/{formKey}`  
**权限**: 无需登录（公开访问）  
**描述**: 匿名用户提交表单数据

**请求体**: 同登录用户提交

**返回结果**: 同登录用户提交（但submittedBy为null，submitterName为"匿名用户"）

## 3. 表单数据查看接口

### 3.1 获取表单数据列表

**接口**: `GET /api/FormData/forms/{formId}/data`  
**权限**: 需要登录  
**描述**: 获取指定表单的所有提交数据列表

**请求参数**:
```
GET /api/FormData/forms/1/data?page=1&pageSize=20&startDate=2025-07-01&endDate=2025-07-31
```

**查询参数**:
- `page` (int, 可选): 页码，默认1
- `pageSize` (int, 可选): 每页数量，默认20
- `startDate` (DateTime, 可选): 开始日期
- `endDate` (DateTime, 可选): 结束日期

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "formId": 1,
        "formName": "用户信息调查表",
        "submittedAt": "2025-07-02T10:30:00Z",
        "submittedBy": 1,
        "submitterName": "张三",
        "ipAddress": "192.168.1.100"
      },
      {
        "id": 2,
        "formId": 1,
        "formName": "用户信息调查表",
        "submittedAt": "2025-07-02T11:15:00Z",
        "submittedBy": null,
        "submitterName": "匿名用户",
        "ipAddress": "192.168.1.101"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### 3.2 获取单条数据详情

**接口**: `GET /api/FormData/forms/{formId}/data/{dataId}`  
**权限**: 需要登录  
**描述**: 查看某条提交数据的详细内容，包括所有字段值

**请求参数**:
```
GET /api/FormData/forms/1/data/1
```

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "formId": 1,
    "formName": "用户信息调查表",
    "fieldValues": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "age": 25,
      "gender": "男",
      "interests": ["阅读", "运动"],
      "comments": "这是一条测试提交"
    },
    "submittedAt": "2025-07-02T10:30:00Z",
    "submittedBy": 1,
    "submitterName": "张三",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### 3.3 获取表单统计信息

**接口**: `GET /api/FormData/forms/{formId}/statistics`  
**权限**: 需要登录  
**描述**: 获取表单的统计信息，如提交总数、唯一提交者数量等

**请求参数**:
```
GET /api/FormData/forms/1/statistics
```

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "formId": 1,
    "formName": "用户信息调查表",
    "totalSubmissions": 25,
    "uniqueSubmitters": 20,
    "latestSubmission": "2025-07-02T15:30:00Z",
    "fieldStatistics": {}
  }
}
```

### 3.4 获取表单所有数据

**接口**: `GET /api/FormData/form/{formId}`  
**权限**: 需要登录  
**描述**: 获取指定表单的所有数据（不分页）

**请求参数**:
```
GET /api/FormData/form/1
```

**返回结果**:
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "formId": 1,
      "formName": "用户信息调查表",
      "fieldValues": {
        "name": "张三",
        "email": "zhangsan@example.com"
      },
      "submittedAt": "2025-07-02T10:30:00Z",
      "submittedBy": 1,
      "submitterName": "张三",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

## 4. 表单数据管理接口

### 4.1 更新表单数据

**接口**: `PUT /api/FormData/forms/{formId}/data/{dataId}`  
**权限**: 需要登录  
**描述**: 更新某条提交数据的内容

**请求体**:
```json
{
  "fieldValues": {
    "name": "李四",
    "email": "lisi@example.com",
    "phone": "13900139000",
    "age": 30,
    "gender": "女",
    "interests": ["音乐", "旅行"],
    "comments": "更新后的评论"
  }
}
```

**返回结果**:
```json
{
  "code": 200,
  "message": "数据更新成功",
  "data": {
    "id": 1,
    "formId": 1,
    "formName": "用户信息调查表",
    "fieldValues": {
      "name": "李四",
      "email": "lisi@example.com"
    },
    "submittedAt": "2025-07-02T10:30:00Z",
    "submittedBy": 1,
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### 4.2 删除表单数据

**接口**: `DELETE /api/FormData/forms/{formId}/data/{dataId}`  
**权限**: 需要登录  
**描述**: 删除某条提交数据

**请求参数**:
```
DELETE /api/FormData/forms/1/data/1
```

**返回结果**:
```json
{
  "code": 200,
  "message": "数据删除成功",
  "data": null
}
```

### 4.3 批量删除表单数据

**接口**: `DELETE /api/FormData/forms/{formId}/data/batch`  
**权限**: 需要登录  
**描述**: 批量删除多条提交数据

**请求体**:
```json
[1, 2, 3, 4, 5]
```

**返回结果**:
```json
{
  "code": 200,
  "message": "成功删除 5 条数据",
  "data": null
}
```

## 5. 使用示例

### 5.1 完整表单流程示例

1. **创建表单**
```bash
curl -X POST "http://localhost:5000/api/Forms" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "用户信息调查表",
    "description": "请填写您的个人信息",
    "formKey": "user-survey-2025",
    "fields": [
      {
        "fieldName": "name",
        "fieldType": "text",
        "fieldLabel": "姓名",
        "isRequired": true,
        "sortOrder": 1
      }
    ]
  }'
```

2. **发布表单**
```bash
curl -X PUT "http://localhost:5000/api/Forms/1/status" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{"status": 1}'
```

3. **获取表单信息（公开访问）**
```bash
curl -X GET "http://localhost:5000/api/Forms/key/user-survey-2025" \
  -H "Content-Type: application/json"
```

4. **提交表单数据（匿名）**
```bash
curl -X POST "http://localhost:5000/api/FormData/submit/user-survey-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "fieldValues": {
      "name": "张三",
      "email": "zhangsan@example.com"
    }
  }'
```

5. **查看提交数据**
```bash
curl -X GET "http://localhost:5000/api/FormData/forms/1/data" \
  -H "Authorization: Bearer {your_jwt_token}" \
  -H "Content-Type: application/json"
```

### 5.2 Postman使用示例

1. **设置环境变量**
   - `baseUrl`: `http://localhost:5000`
   - `token`: 你的JWT Token

2. **创建请求集合**
   - 表单管理
   - 数据提交
   - 数据查看

3. **使用变量**
   - URL: `{{baseUrl}}/api/Forms`
   - Headers: `Authorization: Bearer {{token}}`

## 6. 错误处理

### 6.1 常见错误码

- `400`: 请求参数错误
- `401`: 未授权（需要登录）
- `404`: 资源不存在
- `500`: 服务器内部错误

### 6.2 错误响应格式

```json
{
  "code": 400,
  "message": "字段 姓名 为必填项",
  "data": null
}
```

## 7. 注意事项

1. **认证要求**: 除标注为公开访问的接口外，所有接口都需要JWT Token
2. **日期格式**: 使用ISO 8601格式 (YYYY-MM-DDTHH:mm:ssZ)
3. **字段验证**: 提交数据时会自动验证必填字段
4. **权限控制**: 用户只能访问自己创建的表单和数据
5. **匿名提交**: 匿名用户的submittedBy为null，submitterName显示为"匿名用户"

## 8. 接口统计

- **已完成接口**: 18个
- **表单管理**: 9个接口
- **数据提交**: 2个接口
- **数据查看**: 4个接口
- **数据管理**: 3个接口

所有核心功能都已实现，支持完整的表单创建、发布、填写、查看、管理流程。 
