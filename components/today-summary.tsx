"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TodaySummary() {
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];

        // 获取今日消费
        const { data: todayData, error: todayError } = await supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", user.id)
          .eq("date", today);

        if (todayError) throw todayError;

        // 获取本月消费
        const { data: monthData, error: monthError } = await supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", user.id)
          .gte("date", firstDayOfMonth)
          .lte("date", today);

        if (monthError) throw monthError;

        const todaySum = todayData?.reduce((acc, item) => acc + Number(item.amount), 0) || 0;
        const monthSum = monthData?.reduce((acc, item) => acc + Number(item.amount), 0) || 0;
        
        setTodayTotal(todaySum);
        setMonthTotal(monthSum);
      } catch (error) {
        console.error("Error fetching totals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTotals();

    // 订阅数据变化
    const channel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        () => {
          fetchTotals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">消费汇总</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-2xl md:text-3xl font-bold">加载中...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <div className="text-sm md:text-base text-muted-foreground mb-1">今日消费</div>
              <div className="text-2xl md:text-3xl font-bold">
                ¥{todayTotal.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm md:text-base text-muted-foreground mb-1">此月已消费</div>
              <div className="text-2xl md:text-3xl font-bold">
                ¥{monthTotal.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

