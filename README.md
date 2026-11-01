# 墨迹 · 个人博客系统

一个前后端分离的个人博客：React + TypeScript + Vite 前端，Node.js + Express 后端，SQLite 数据库（Node 内置 `node:sqlite`，零安装），JWT 鉴权。

产品需求与验收标准见 [spec.md](./spec.md)。

## 目录结构

```
blog/
├─ spec.md            # 产品需求文档
├─ client/            # 前端（Vite + React + TS + Tailwind）
└─ server/            # 后端（Express + TS + node:sqlite）
   ├─ sql/schema.sql  # 建表脚本（服务启动时自动执行）
   └─ data/blog.db    # SQLite 数据文件（自动创建，已忽略提交）
```

## 环境要求

- Node.js 22.5+（推荐 22 LTS 或更新版本；需支持内置 `node:sqlite`）

无需安装任何数据库：SQLite 由 Node 内置模块提供，首次启动会自动创建 `server/data/blog.db`、建表并预置「技术 / 生活 / 随笔」三个分类。

## 本地启动

不需要手动初始化数据库，也不需要复制配置文件。

### 1. 启动后端

```bash
cd server
npm install
npm run dev               # http://localhost:4000
```

首次启动会输出 `SQLite ready: .../server/data/blog.db`。

### 2. 启动前端

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

`.env` 为可选项（可直接使用默认值）。如需自定义：

| 变量 | 说明 |
| --- | --- |
| `PORT` | 服务端口，默认 4000 |
| `DB_FILE` | SQLite 文件路径，默认 `server/data/blog.db` |
| `JWT_SECRET` | JWT 签名密钥，生产环境务必改为足够长的随机字符串 |
| `CLIENT_ORIGIN` | 允许跨域的前端地址，默认 `http://localhost:5173` |

Vite 已配置 `/api` 代理到 `http://localhost:4000`，无需额外设置跨域。

## 常用命令

| 目录 | 命令 | 说明 |
| --- | --- | --- |
| client | `npm run build` | 类型检查 + 生产构建 |
| client | `npm run preview` | 预览构建产物 |
| server | `npm run build` | 编译到 `dist/` |
| server | `npm start` | 运行编译后的服务 |

## 接口一览

统一前缀 `/api`，响应体为 `{ code, message, data }`，`code = 0` 表示成功。

| 方法 | 路径 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| POST | `/auth/register` | - | 注册（返回 token） |
| POST | `/auth/login` | - | 登录（`account` 支持邮箱或用户名） |
| GET | `/auth/me` | 是 | 当前用户信息 |
| PUT | `/users/me` | 是 | 更新头像 / 简介 |
| GET | `/categories` | - | 分类列表（含文章数） |
| GET | `/articles` | - | 分页、分类筛选、关键词搜索 |
| GET | `/articles/:id` | - | 文章详情（浏览量 +1） |
| POST | `/articles` | 是 | 发布文章 |
| PUT | `/articles/:id` | 是 | 编辑文章（仅作者） |
| DELETE | `/articles/:id` | 是 | 删除文章（仅作者） |

列表查询参数：`page`（默认 1）、`pageSize`（默认 10，最大 50）、`categoryId`、`authorId`、`keyword`。

## 账号与数据

- 密码使用 bcrypt 哈希存储，接口不会返回密码字段。
- JWT 有效期 7 天，前端存放于 `localStorage`。
- 文章内容为 Markdown 原文，前端通过 `react-markdown` 渲染，不解析用户 HTML。
