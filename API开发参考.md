# 表单数据管理API开发参考

## 概述
本文档为后端开发人员提供表单数据管理功能的API接口规范，用于支持前端数据管理页面的完整功能。

## 核心接口

### 1. 获取表单数据列表
**接口地址：** `GET /api/FormData/forms/{formId}/data`

**权限要求：** 需要登录（需要JWT Token）

**请求头：**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**路径参数：**
- `formId`: 表单ID

**查询参数：**
- `Page`: 页码（默认：1）
- `PageSize`: 每页数量（默认：20）
- `StartDate`: 开始日期（可选，筛选提交时间，格式：YYYY-MM-DD）
- `EndDate`: 结束日期（可选，筛选提交时间，格式：YYYY-MM-DD）
- `Status`: 状态筛选（可选，normal/flagged/deleted）
- `SubmittedBy`: 提交者ID（可选）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "formId": 11,
        "formName": "用户信息调查表",
        "submittedAt": "2025-01-02T10:30:00Z",
        "submittedBy": 1,
        "submitterName": "张三",
        "ipAddress": "192.168.1.100",
        "status": "normal",
        "fieldValues": {
          "name": "张三",
          "email": "zhangsan@example.com",
          "phone": "13800138000",
          "gender": "男",
          "age": 25,
          "interests": ["读书", "旅游"],
          "rating": 4,
          "feedback": "很好用的表单"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### 2. 获取表单数据统计
**接口地址：** `GET /api/FormData/forms/{formId}/statistics`

**权限要求：** 需要登录（需要JWT Token）

**路径参数：**
- `formId`: 表单ID

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 50,
    "today": 5,
    "week": 25,
    "month": 120,
    "uniqueSubmitters": 35,
    "avgSubmissionsPerDay": 4.2
  }
}
```

### 3. 获取表单数据详情
**接口地址：** `GET /api/FormData/forms/{formId}/data/{dataId}`

**权限要求：** 需要登录（需要JWT Token）

**路径参数：**
- `formId`: 表单ID
- `dataId`: 数据ID

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "formId": 11,
    "formName": "用户信息调查表",
    "submittedAt": "2025-01-02T10:30:00Z",
    "submittedBy": 1,
    "submitterName": "张三",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "submissionId": "sub_123456",
    "status": "normal",
    "fieldValues": {
      "name": "张三",
      "email": "zhangsan@example.com",
      "phone": "13800138000",
      "gender": "男",
      "age": 25,
      "interests": ["读书", "旅游"],
      "rating": 4,
      "feedback": "很好用的表单"
    },
    "createdAt": "2025-01-02T10:30:00Z",
    "updatedAt": "2025-01-02T10:30:00Z"
  }
}
```

### 4. 删除表单数据
**接口地址：** `DELETE /api/FormData/forms/{formId}/data/{dataId}`

**权限要求：** 需要登录（需要JWT Token）

**路径参数：**
- `formId`: 表单ID
- `dataId`: 数据ID

**响应示例：**
```json
{
  "code": 200,
  "message": "删除成功"
}
```

### 5. 批量删除表单数据
**接口地址：** `POST /api/FormData/forms/{formId}/data/batch-delete`

**权限要求：** 需要登录（需要JWT Token）

**路径参数：**
- `formId`: 表单ID

**请求体：**
```json
{
  "dataIds": [1, 2, 3, 4, 5]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": {
    "deletedCount": 5
  }
}
```

### 6. 标记表单数据
**接口地址：** `PUT /api/FormData/forms/{formId}/data/{dataId}/flag`

**权限要求：** 需要登录（需要JWT Token）

**路径参数：**
- `formId`: 表单ID
- `dataId`: 数据ID

**请求体：**
```json
{
  "flag": true
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "标记成功"
}
```

### 7. 导出表单数据
**接口地址：** `POST /api/FormData/forms/{formId}/export`

**权限要求：** 需要登录（需要JWT Token）

**路径参数：**
- `formId`: 表单ID

**请求体：**
```json
{
  "format": "excel",
  "range": "all",
  "fields": ["name", "email", "phone"],
  "dataIds": [1, 2, 3]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "导出成功",
  "data": {
    "downloadUrl": "https://example.com/downloads/form_data_11_2025-01-02.xlsx",
    "expiresAt": "2025-01-03T10:30:00Z"
  }
}
```

## 数据模型

### FormDataListItem
```typescript
interface FormDataListItem {
  id: number
  formId: number
  formName: string
  submittedAt: string
  submittedBy?: number
  submitterName?: string
  ipAddress?: string
  fieldValues?: Record<string, any>
  status?: string
}
```

### FormDataStatistics
```typescript
interface FormDataStatistics {
  total: number
  today: number
  week: number
  month: number
  uniqueSubmitters: number
  avgSubmissionsPerDay: number
}
```

### FormDataDetail
```typescript
interface FormDataDetail extends FormDataListItem {
  fieldValues: Record<string, any>
  userAgent?: string
  submissionId?: string
  createdAt: string
  updatedAt: string
}
```

## 注意事项

1. **权限验证**：所有接口都需要验证用户是否有权限访问该表单的数据
2. **分页处理**：列表接口必须支持分页，避免大数据量导致性能问题
3. **字段名转换**：前端发送的字段名会自动转换为大写（如page→Page），后端需要处理
4. **日期格式**：使用ISO 8601格式的日期时间
5. **匿名提交**：匿名用户的`submittedBy`为null，`submitterName`显示为"匿名用户"
6. **数据状态**：支持normal（正常）、flagged（已标记）、deleted（已删除）三种状态

## 开发优先级

1. **高优先级**：获取数据列表、获取统计数据
2. **中优先级**：获取数据详情、删除数据
3. **低优先级**：批量操作、标记功能、导出功能

## 测试建议

1. 使用Postman测试所有接口
2. 测试不同权限用户的访问控制
3. 测试大数据量的分页性能
4. 测试各种筛选条件的组合
5. 测试异常情况的错误处理 