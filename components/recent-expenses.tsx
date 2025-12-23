"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Expense {
  id: string;
  date: string;
  time_period: string;
  item_name: string;
  amount: number;
  payment_method: string;
}

export function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 计算过去三天的日期范围
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        const startDate = threeDaysAgo.toISOString().split("T")[0];
        const endDate = today.toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("expenses")
          .select("id, date, time_period, item_name, amount, payment_method")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: false })
          .order("created_at", { ascending: false });

        if (error) throw error;

        setExpenses(data || []);
      } catch (error) {
        console.error("Error fetching recent expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentExpenses();

    // 订阅数据变化
    const channel = supabase
      .channel("recent-expenses-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        () => {
          fetchRecentExpenses();
        }
      )
      .subscribe();

    // 监听自定义事件，当有新消费记录添加时刷新数据
    const handleExpenseAdded = () => {
      fetchRecentExpenses();
    };
    window.addEventListener("expense-added", handleExpenseAdded);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("expense-added", handleExpenseAdded);
    };
  }, [supabase]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const twoDaysAgoOnly = new Date(twoDaysAgo.getFullYear(), twoDaysAgo.getMonth(), twoDaysAgo.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return "今天";
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return "昨天";
    } else if (dateOnly.getTime() === twoDaysAgoOnly.getTime()) {
      return "前天";
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">最近消费</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">最近消费</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">暂无消费记录</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl">最近消费</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="grid grid-cols-[80px_50px_1fr_90px_120px] md:grid-cols-[100px_60px_1fr_110px_140px] items-center gap-3 md:gap-4 py-2.5 px-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors text-sm md:text-base"
            >
              <div className="font-medium">{formatDate(expense.date)}</div>
              <div className="text-muted-foreground">{expense.time_period}</div>
              <div className="truncate min-w-0">{expense.item_name}</div>
              <div className="font-semibold text-right">¥{Number(expense.amount).toFixed(2)}</div>
              <div className="text-muted-foreground text-right truncate">
                {expense.payment_method}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

