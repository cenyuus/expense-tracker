"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { StatsCharts } from "@/components/stats-charts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { useRouter } from "next/navigation";

interface ExpenseData {
  date: string;
  amount: number;
  payment_method: string;
}

export default function StatsPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("day");
  const [data, setData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    max: 0,
    mostUsedMethod: "",
  });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      fetchData();
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      let startDate: string;
      const endDate = new Date().toISOString().split("T")[0];

      switch (period) {
        case "day":
          startDate = endDate;
          break;
        case "week":
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split("T")[0];
          break;
        case "month":
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          startDate = monthAgo.toISOString().split("T")[0];
          break;
        case "year":
          const yearAgo = new Date();
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          startDate = yearAgo.toISOString().split("T")[0];
          break;
      }

      const { data: expenses, error } = await supabase
        .from("expenses")
        .select("date, amount, payment_method")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) throw error;

      const expensesData = (expenses || []) as ExpenseData[];
      setData(expensesData);

      // 计算统计信息
      if (expensesData.length > 0) {
        const total = expensesData.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        );
        const dates = new Set(expensesData.map((item) => item.date));
        const average = total / dates.size;
        const max = Math.max(...expensesData.map((item) => Number(item.amount)));

        const methodCount = new Map<string, number>();
        expensesData.forEach((item) => {
          methodCount.set(
            item.payment_method,
            (methodCount.get(item.payment_method) || 0) + Number(item.amount)
          );
        });
        const mostUsedMethod = Array.from(methodCount.entries()).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] || "";

        setStats({
          total: total,
          average: average,
          max: max,
          mostUsedMethod: mostUsedMethod,
        });
      } else {
        setStats({ total: 0, average: 0, max: 0, mostUsedMethod: "" });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">消费统计</h1>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" className="h-10 md:h-11">
                返回
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* 时间维度切换 */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="grid w-full grid-cols-4 h-10 md:h-11">
            <TabsTrigger value="day" className="text-sm md:text-base">
              天
            </TabsTrigger>
            <TabsTrigger value="week" className="text-sm md:text-base">
              周
            </TabsTrigger>
            <TabsTrigger value="month" className="text-sm md:text-base">
              月
            </TabsTrigger>
            <TabsTrigger value="year" className="text-sm md:text-base">
              年
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 统计卡片 */}
        {!loading && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">
                  总消费
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  ¥{stats.total.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">
                  平均每日
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  ¥{stats.average.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">
                  最高单笔
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold">
                  ¥{stats.max.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm md:text-base font-medium text-muted-foreground">
                  最常用支付
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-xl font-bold truncate">
                  {stats.mostUsedMethod || "无"}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 图表 */}
        {loading ? (
          <div className="text-center text-muted-foreground py-12">
            加载中...
          </div>
        ) : (
          <StatsCharts data={data} period={period} />
        )}
      </div>
    </div>
  );
}

