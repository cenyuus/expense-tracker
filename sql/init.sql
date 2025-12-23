-- 创建消费记录表
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_period VARCHAR(10) NOT NULL CHECK (time_period IN ('上午', '中午', '下午', '晚上')),
  item_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('兴业银行信用卡', '浦发红沙宣', 'inmotion香港信用卡', '招商储蓄卡')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_created ON expenses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- 创建更新时间自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 启用 RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能查看和操作自己的数据
CREATE POLICY "Users can view own expenses"
ON expenses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
ON expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
ON expenses
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
ON expenses
FOR DELETE
USING (auth.uid() = user_id);

