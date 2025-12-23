# Supabase 配置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击 "Start your project" 或 "Sign in"
3. 使用 GitHub 账号登录（推荐）或邮箱注册
4. 点击 "New Project" 创建新项目
5. 填写项目信息：
   - **Name**: expense-tracker（或你喜欢的名称）
   - **Database Password**: 设置一个强密码（**请记住这个密码**，后续可能需要）
   - **Region**: 选择离你最近的区域（如 `Southeast Asia (Singapore)`）
   - **Pricing Plan**: 选择 Free 计划即可
6. 点击 "Create new project"
7. 等待项目创建完成（通常需要 1-2 分钟）

## 步骤 2: 获取项目配置信息

项目创建完成后，进入项目 Dashboard：

1. 点击左侧菜单的 **Settings**（设置图标）
2. 点击 **API** 子菜单
3. 在 **Project API keys** 部分，你会看到：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public** key: 一长串字符串（以 `eyJ...` 开头）

## 步骤 3: 配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
cd /Users/cenyu/projects/expense-tracker
```

创建文件并填入配置：

```bash
# 方式 1: 使用命令行创建（Mac/Linux）
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=你的_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
EOF

# 方式 2: 手动创建
# 复制 .env.example 为 .env.local，然后编辑
cp .env.example .env.local
# 然后用编辑器打开 .env.local 填入配置
```

**示例格式**（请替换为你的实际值）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 步骤 4: 初始化数据库

### 方法 1: 使用 Supabase SQL Editor（推荐）

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query** 创建新查询
3. 打开项目中的 `sql/init.sql` 文件，复制全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 或按 `Cmd/Ctrl + Enter` 执行
6. 如果成功，你会看到 "Success. No rows returned" 或类似的成功消息

### 方法 2: 使用 Supabase CLI（可选）

如果你安装了 Supabase CLI：

```bash
# 安装 Supabase CLI（如果还没安装）
npm install -g supabase

# 登录 Supabase
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 执行 SQL 文件
supabase db push sql/init.sql
```

## 步骤 5: 验证配置

1. 确保 `.env.local` 文件已正确配置
2. 启动开发服务器：

```bash
npm run dev
```

3. 打开浏览器访问 `http://localhost:3000`
4. 如果配置正确，你应该能看到登录页面
5. 点击"注册"创建一个测试账户

## 步骤 6: 测试功能

1. **注册账户**：

   - 在登录页面点击"注册"
   - 输入邮箱和密码（至少 6 位）
   - 注册成功后会自动登录

2. **记录消费**：

   - 在主页面填写消费信息
   - 点击"提交"
   - 查看"今日消费"是否更新

3. **查看统计**：
   - 点击"统计"按钮
   - 切换不同的时间维度（天/周/月/年）
   - 查看图表是否正常显示

## 常见问题

### Q: 找不到 Project URL 和 anon key？

A: 确保你在项目的 Settings > API 页面，而不是其他设置页面。

### Q: 执行 SQL 时出错？

A:

- 确保你复制了完整的 SQL 代码
- 检查是否有语法错误
- 如果表已存在，可以删除后重新执行，或修改 SQL 使用 `CREATE TABLE IF NOT EXISTS`

### Q: 登录后还是跳转到登录页？

A:

- 检查 `.env.local` 文件是否正确配置
- 确保环境变量名称正确（`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- 重启开发服务器（`npm run dev`）

### Q: 图表不显示？

A:

- 确保有数据（先记录一些消费）
- 检查浏览器控制台是否有错误
- 确保 ECharts 依赖已正确安装

## 需要提供的信息

如果你需要我帮你配置，请提供：

1. **Project URL**: `https://xxxxx.supabase.co`
2. **anon public key**: `eyJ...` 开头的字符串

⚠️ **安全提示**：

- 不要将 `.env.local` 文件提交到 Git（已在 .gitignore 中）
- `anon public key` 是公开的，但建议不要随意分享
- 如果泄露了 key，可以在 Supabase Dashboard 中重新生成

## 下一步

配置完成后，你可以：

1. 开始使用应用记录消费
2. 查看统计和分析
3. 部署到 Vercel 或其他平台（记得在部署平台也配置环境变量）
