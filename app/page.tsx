import { TodaySummary } from "@/components/today-summary";
import { ExpenseForm } from "@/components/expense-form";
import { LogoutButton } from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen px-4 py-6 md:py-12">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* 顶部导航 */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">记账本</h1>
          <div className="flex gap-2">
            <Link href="/stats">
              <Button variant="outline" className="h-10 md:h-11">
                统计
              </Button>
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* 今日消费汇总 */}
        <TodaySummary />

        {/* 记账表单 */}
        <ExpenseForm />
      </div>
    </div>
  );
}
