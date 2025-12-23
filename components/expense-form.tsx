"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const TIME_PERIODS = ["上午", "中午", "下午", "晚上"] as const;
const PAYMENT_METHODS = [
  "兴业银行信用卡",
  "浦发红沙宣",
  "inmotion香港信用卡",
  "招商储蓄卡",
  "花呗",
] as const;

export function ExpenseForm() {
  const router = useRouter();
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [timePeriod, setTimePeriod] = useState<string>("上午");
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("兴业银行信用卡");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("请先登录");
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("请输入有效的金额");
      }

      const { error: insertError } = await supabase.from("expenses").insert({
        user_id: user.id,
        date,
        time_period: timePeriod,
        item_name: itemName.trim(),
        amount: amountNum,
        payment_method: paymentMethod,
      });

      if (insertError) throw insertError;

      // 重置表单
      setItemName("");
      setAmount("");
      setTimePeriod("上午");
      setPaymentMethod("兴业银行信用卡");

      // 触发自定义事件通知其他组件刷新数据
      window.dispatchEvent(new CustomEvent("expense-added"));

      // 刷新页面以更新今日汇总
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">记录消费</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-base">
                日期
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timePeriod" className="text-base">
                时间段
              </Label>
              <Select
                id="timePeriod"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-base"
              >
                {TIME_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemName" className="text-base">
              商品名称
            </Label>
            <Input
              id="itemName"
              type="text"
              placeholder="例如：午餐"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base">
                金额（元）
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-base">
                支付方式
              </Label>
              <Select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-base"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base md:h-12 md:text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "提交中..." : "提交"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

