#!/bin/bash

# Supabase 环境变量配置脚本

echo "=========================================="
echo "Supabase 环境变量配置"
echo "=========================================="
echo ""

# 检查 .env.local 是否已存在
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local 文件已存在"
    read -p "是否要覆盖？(y/n): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "已取消"
        exit 0
    fi
fi

echo ""
echo "请按照以下步骤获取配置信息："
echo "1. 访问 https://supabase.com 并登录"
echo "2. 创建新项目或选择现有项目"
echo "3. 进入 Settings > API"
echo "4. 复制 Project URL 和 anon public key"
echo ""

read -p "请输入 Project URL (例如: https://xxxxx.supabase.co): " SUPABASE_URL
read -p "请输入 anon public key (以 eyJ 开头): " SUPABASE_ANON_KEY

# 验证输入
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ 错误: URL 和 Key 不能为空"
    exit 1
fi

# 创建 .env.local 文件
cat > .env.local << EOF
# Supabase 配置
# 从 Supabase 项目设置中获取这些值
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF

echo ""
echo "✅ 环境变量配置完成！"
echo ""
echo "下一步："
echo "1. 在 Supabase Dashboard 的 SQL Editor 中执行 sql/init.sql"
echo "2. 运行 npm run dev 启动开发服务器"
echo ""

