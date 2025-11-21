<h1 align="center">Hamlet Admin</h1>

<div align="center">

Next.js + MaterialUI（MUI）实现的若依(ruoyi)系的现代化企业级中后台前端解决方案。element-ui，antd已经审美疲劳，可以的体验下Material-UI（MUI）的设计风格
<br />
支持 React 19 / 18，Next.js 15+，Materail UI，zustand。

[![React](https://img.shields.io/badge/React-19.x%20%7C%2018.x-blue?style=flat-square)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=flat-square)](https://nextjs.org/)
[![Material%20UI](https://img.shields.io/badge/Material--UI-7+-lightgrey?style=flat-square)](https://mui.com/)
[![Zustand](https://img.shields.io/badge/Zustand-purple?style=flat-square)](https://zustand.docs.pmnd.rs/getting-started/introduction/)
[![License](https://img.shields.io/github/license/DLand-Team/moderate-react-admin?style=flat-square)](./LICENSE)

</div>

# 在线演示

- 在线预览 （准备中）
- 文档地址

# 核心特性

- **接口对接 ruoyi-vue-plus**
  用户管理、角色管理、部门管理、岗位管理、字典管理、参数设置、通知公告、日志管理、文件管理、客户端管理、菜单管理等核心功能已对接，无需配置，开箱即用。

- **真正的业务分层**
  代码分层明确，业务与 UI 解耦，结构清晰，易于维护与扩展。

- **NextJS 完美适配**
  支持 App 模式下的 配套 Tab 窗口，体验和element-ui，antd接近

- **Node.js 赋能开发**
  支持约定式路由，可视化生成路由与状态仓库，大幅提升开发效率。

- **状态管理**
  轻量级的状态管理库Zustand，使用非常简单，目标是提供一个无需复杂 API 和概念的全局状态管理解决方案

  - **简单易用**：不需要 reducer、action 或复杂的概念。
  - **高效**：支持按需订阅状态，避免不必要的重渲染。
  - **灵活**：可以与 React、React Native 和其他框架一起使用。
  - **无依赖**：没有第三方依赖，体积小。

- 表单校验zod

  TypeScript 优先的模式声明和验证库Zod

# 技术选型

- React 18 / React 19
- Next.js 15
- Material UI（MUI）
- Zustand
- Zod
- App Router
- TypeScript

# 快速开始

## 本地运行

### 配置修改

`.env.development`文件里的NEXT_PUBLIC_API_BASE_URL改成自己的后端地址

```
NEXT_PUBLIC_API_BASE_URL = 'http://ip:端口/dev-api'
```

### 前端启动

```bash
# 安装依赖
npm i

# 启动服务
npm run dev
```

### 后端说明

本地开发推荐启动 ruoyi-vue-plus 项目进行接口对接。

# 项目结构说明

- `api/`：项目的请求接口目录

- `app/`：主应用目录，所有前端页面

- `components/`：页面组件

- `stores/`：状态管理相关目录（zustand）。

- `styles/`：样式相关目录。

# 功能截图

## PC端

### 首页

![图片描述](./public/assets/1.home.png)

### 用户管理

![图片描述](./public/assets/2.user.png)

### 角色管理

![图片描述](./public/assets/3.role.png)

### 部门管理

![图片描述](./public/assets/4.dept.png)

### 岗位管理

![图片描述](./public/assets/5.position.png)

### 字典管理

![图片描述](./public/assets/6.dict.png)

### 参数配置

![图片描述](./public/assets/7.config.png)

### 公告管理

![图片描述](./public/assets/8.notice.png)

### 日志管理

![图片描述](./public/assets/9.log.png)

### 文件管理

![图片描述](./public/assets/10.file.png)

### 客户端管理

![图片描述](./public/assets/11.client.png)

### 个人信息

![图片描述](./public/assets/12.profile.png)

## 手机端

### 登录

![图片描述](./public/assets/mobile-1.png)

### 用户管理，角色管理，通知公告

![图片描述](./public/assets/mobile-2.png)
