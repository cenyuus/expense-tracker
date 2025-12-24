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

interface ExpenseRecord {
  id: string;
  date: string;
  time_period: string;
  item_name: string;
  amount: number;
  payment_method: string;
}

export default function StatsPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">(
    "day"
  );
  const [data, setData] = useState<ExpenseData[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
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
          // 计算本周周一（周一到周日为一周）
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
          const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 如果是周日，往前6天；否则往前(dayOfWeek-1)天
          const monday = new Date(today);
          monday.setDate(today.getDate() + mondayOffset);
          startDate = monday.toISOString().split("T")[0];
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

      // 获取用于图表的数据
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

      // 获取完整的消费记录用于列表展示
      const { data: records, error: recordsError } = await supabase
        .from("expenses")
        .select("id, date, time_period, item_name, amount, payment_method")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (recordsError) throw recordsError;
      setExpenseRecords((records || []) as ExpenseRecord[]);

      // 计算统计信息
      if (expensesData.length > 0) {
        const total = expensesData.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        );
        const dates = new Set(expensesData.map((item) => item.date));
        const average = total / dates.size;

        setStats({
          total: total,
          average: average,
        });
      } else {
        setStats({ total: 0, average: 0 });
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
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as typeof period)}
        >
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* 消费记录列表 */}
        {!loading && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                {period === "day" && "一天的消费记录"}
                {period === "week" && "一周的消费记录"}
                {period === "month" && "一月的消费记录"}
                {period === "year" && "一年的消费记录"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expenseRecords.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  暂无消费记录
                </div>
              ) : (
                <div className="space-y-2">
                  {expenseRecords.map((expense) => {
                    const date = new Date(expense.date);
                    const formattedDate = `${
                      date.getMonth() + 1
                    }月${date.getDate()}日`;
                    return (
                      <div
                        key={expense.id}
                        className="grid grid-cols-[100px_60px_1fr_110px_140px] md:grid-cols-[120px_70px_1fr_130px_160px] items-center gap-3 md:gap-4 py-2.5 px-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors text-sm md:text-base"
                      >
                        <div className="font-medium">{formattedDate}</div>
                        <div className="text-muted-foreground">
                          {expense.time_period}
                        </div>
                        <div className="truncate min-w-0">
                          {expense.item_name}
                        </div>
                        <div className="font-semibold text-right">
                          ¥{Number(expense.amount).toFixed(2)}
                        </div>
                        <div className="text-muted-foreground text-right truncate">
                          {expense.payment_method}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
