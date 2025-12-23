"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TodaySummary() {
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchTodayTotal = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const today = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
          .from("expenses")
          .select("amount")
          .eq("user_id", user.id)
          .eq("date", today);

        if (error) throw error;

        const sum = data?.reduce((acc, item) => acc + Number(item.amount), 0) || 0;
        setTotal(sum);
      } catch (error) {
        console.error("Error fetching today's total:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayTotal();

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
          fetchTodayTotal();
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
        <CardTitle className="text-lg md:text-xl">今日消费</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-2xl md:text-3xl font-bold">加载中...</div>
        ) : (
          <div className="text-2xl md:text-3xl font-bold">
            ¥{total.toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

