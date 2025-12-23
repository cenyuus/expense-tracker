"use client";

import { useEffect, useRef, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface ExpenseData {
  date: string;
  amount: number;
  payment_method: string;
}

interface StatsChartsProps {
  data: ExpenseData[];
  period: "day" | "week" | "month" | "year";
}

export function StatsCharts({ data, period }: StatsChartsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 处理数据聚合
  const processData = () => {
    if (!data || data.length === 0) return { trendData: [], pieData: [] };

    // 按日期聚合
    const dateMap = new Map<string, number>();
    const paymentMap = new Map<string, number>();

    data.forEach((item) => {
      // 趋势数据
      const dateKey = item.date;
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + Number(item.amount));

      // 支付方式数据
      const method = item.payment_method;
      paymentMap.set(method, (paymentMap.get(method) || 0) + Number(item.amount));
    });

    // 排序日期
    const sortedDates = Array.from(dateMap.keys()).sort();
    const trendData = sortedDates.map((date) => ({
      date,
      amount: dateMap.get(date) || 0,
    }));

    // 支付方式数据
    const pieData = Array.from(paymentMap.entries()).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));

    return { trendData, pieData };
  };

  const { trendData, pieData } = processData();

  // 折线图配置
  const lineOption: EChartsOption = {
    title: {
      text: "消费趋势",
      left: "center",
      textStyle: {
        fontSize: isMobile ? 16 : 18,
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const param = Array.isArray(params) ? params[0] : params;
        return `${param.axisValue}<br/>¥${param.value.toFixed(2)}`;
      },
    },
    grid: {
      left: isMobile ? "10%" : "5%",
      right: isMobile ? "10%" : "5%",
      bottom: isMobile ? "15%" : "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: trendData.map((item) => item.date),
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
        rotate: isMobile ? 45 : 0,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`,
        fontSize: isMobile ? 10 : 12,
      },
    },
    series: [
      {
        data: trendData.map((item) => item.amount),
        type: "line",
        smooth: true,
        itemStyle: {
          color: "#3b82f6",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.05)" },
            ],
          },
        },
      },
    ],
  };

  // 饼图配置
  const pieOption: EChartsOption = {
    title: {
      text: "支付方式占比",
      left: "center",
      textStyle: {
        fontSize: isMobile ? 16 : 18,
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: ¥{c} ({d}%)",
    },
    legend: {
      orient: isMobile ? "horizontal" : "vertical",
      left: isMobile ? "center" : "left",
      bottom: isMobile ? 0 : "auto",
      textStyle: {
        fontSize: isMobile ? 10 : 12,
      },
    },
    series: [
      {
        name: "支付方式",
        type: "pie",
        radius: isMobile ? "50%" : "60%",
        center: isMobile ? ["50%", "45%"] : ["50%", "50%"],
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          fontSize: isMobile ? 10 : 12,
        },
      },
    ],
  };

  // 柱状图配置
  const barOption: EChartsOption = {
    title: {
      text: "消费金额统计",
      left: "center",
      textStyle: {
        fontSize: isMobile ? 16 : 18,
      },
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const param = Array.isArray(params) ? params[0] : params;
        return `${param.axisValue}<br/>¥${param.value.toFixed(2)}`;
      },
    },
    grid: {
      left: isMobile ? "10%" : "5%",
      right: isMobile ? "10%" : "5%",
      bottom: isMobile ? "15%" : "10%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: trendData.map((item) => item.date),
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
        rotate: isMobile ? 45 : 0,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => `¥${value.toFixed(0)}`,
        fontSize: isMobile ? 10 : 12,
      },
    },
    series: [
      {
        data: trendData.map((item) => item.amount),
        type: "bar",
        itemStyle: {
          color: "#10b981",
        },
      },
    ],
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        暂无数据
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="w-full" style={{ height: isMobile ? "300px" : "400px" }}>
        <ReactECharts
          option={lineOption}
          style={{ height: "100%", width: "100%" }}
          opts={{ renderer: "svg" }}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="w-full" style={{ height: isMobile ? "300px" : "400px" }}>
          <ReactECharts
            option={pieOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "svg" }}
          />
        </div>
        <div className="w-full" style={{ height: isMobile ? "300px" : "400px" }}>
          <ReactECharts
            option={barOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "svg" }}
          />
        </div>
      </div>
    </div>
  );
}

