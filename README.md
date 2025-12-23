# 记账应用

一个简约风格的记账应用，支持日常消费记录和天/周/月/年维度的消费统计可视化。

## 功能特性

- 📝 记录日常消费（日期、时间段、商品名称、金额、支付方式）
- 📊 今日消费实时汇总
- 📈 多维度统计可视化（天/周/月/年）
- 📱 完全响应式设计，支持手机和电脑端
- 🔐 用户认证系统（Supabase Auth）

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **UI**: Tailwind CSS + shadcn/ui
- **图表**: Apache ECharts
- **语言**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

#### 方式 1: 使用配置脚本（推荐）

```bash
./setup-env.sh
```

脚本会引导你输入 Supabase 配置信息。

#### 方式 2: 手动配置

1. **创建 Supabase 项目**：
   - 访问 [Supabase](https://supabase.com) 并登录
   - 点击 "New Project" 创建新项目
   - 填写项目信息并创建

2. **获取配置信息**：
   - 在项目 Dashboard 中，进入 **Settings** > **API**
   - 复制 **Project URL** 和 **anon public** key

3. **创建环境变量文件**：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> 📖 详细配置说明请查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 3. 初始化数据库

在 Supabase SQL Editor 中执行 `sql/init.sql` 文件中的 SQL 语句来创建表结构和 RLS 策略。

### 4. 运行开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
expense-tracker/
├── app/                    # Next.js App Router 页面
│   ├── auth/              # 认证相关页面
│   ├── stats/              # 统计页面
│   └── page.tsx           # 主页面（记账表单）
├── components/            # React 组件
│   ├── ui/                # shadcn/ui 基础组件
│   ├── expense-form.tsx   # 记账表单组件
│   ├── today-summary.tsx  # 今日汇总组件
│   └── stats-charts.tsx   # 统计图表组件
├── lib/                   # 工具函数和配置
│   ├── supabase/          # Supabase 客户端配置
│   └── utils.ts           # 工具函数
└── sql/                   # 数据库初始化脚本
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量（Supabase URL 和 Key）
4. 部署完成

### 其他平台

确保设置以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 使用说明

1. **注册/登录**: 首次使用需要注册账户
2. **记录消费**: 在主页面填写消费信息并提交
3. **查看统计**: 点击"统计"按钮查看消费分析和图表

## 响应式设计

- **移动端** (≤768px): 单列布局，优化的触摸交互
- **平板端** (768px-1024px): 适中的布局和间距
- **桌面端** (≥1024px): 充分利用屏幕空间

## License

MIT
