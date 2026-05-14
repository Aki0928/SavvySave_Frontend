import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../services/api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  Chip,
  Container,
  CircularProgress,
  Alert,
  LinearProgress,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  ArrowUpward,
  ArrowDownward,
  Receipt,
  WarningAmberRounded,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

import type { SvgIconComponent } from "@mui/icons-material";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

type TrendType = "up" | "down";

type ViewMode = "weekly" | "monthly" | "yearly";

type TransactionFilter = "all" | "income" | "expense";

interface AuthUser {
  id?: string | number;
}

interface DashboardParams {
  range: ViewMode;
  date: string;
}

interface DashboardSummary {
  balance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  incomeTrend: number;
  expenseTrend: number;
}

type AuthContextValue = {
  user?: AuthUser | null;
};

interface CashFlowChartItem {
  date: string;
  income: number;
  expenses: number;
}

interface CategoryStat {
  name: string;
  total: number;
}

interface DashboardChartData {
  chart?: CashFlowChartItem[];
  categoryStats?: CategoryStat[];
}

interface RecentTransaction {
  id: string | number;
  type: "income" | "expense";
  category: string;
  amount: number;
  timestamp: string;
  note?: string | null;
}

interface DashboardData {
  summary: DashboardSummary;
  chartData: DashboardChartData;
  recentTransactions?: RecentTransaction[];
}

interface DashboardApi {
  getDashboard: (
    params: DashboardParams,
    config?: { signal?: AbortSignal },
  ) => Promise<DashboardData>;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: SvgIconComponent;
  trend?: TrendType;
  trendValue?: string;
  gradient: string;
  subtitle?: string;
  warning?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  gradient,
  subtitle,
  warning = false,
}: StatCardProps) => (
  <Card
    sx={{
      height: "100%",
      background: gradient,
      color: "white",
      position: "relative",
      overflow: "hidden",
      borderRadius: 1,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "transform 0.2s",
      "&:hover": {
        transform: "translateY(-2px)",
      },
    }}
  >
    {warning && (
      <Box
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          width: 40,
          height: 40,
          bgcolor: "rgba(255,0,0,0.2)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      />
    )}

    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 0.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(4px)",
            width: 32,
            height: 32,
            borderRadius: 1,
          }}
          variant="rounded"
        >
          <Icon sx={{ fontSize: 18 }} />
        </Avatar>

        {trend && (
          <Chip
            size="small"
            icon={
              trend === "up" ? (
                <ArrowUpward
                  sx={{
                    fontSize: 10,
                    color: "inherit !important",
                  }}
                />
              ) : (
                <ArrowDownward
                  sx={{
                    fontSize: 10,
                    color: "inherit !important",
                  }}
                />
              )
            }
            label={trendValue}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              height: 18,
              fontSize: "0.6rem",
              fontWeight: 600,
              borderRadius: 0.5,
              border: "none",
            }}
          />
        )}
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: "0.7rem",
            opacity: 0.85,
            letterSpacing: 0.5,
          }}
        >
          {title.toUpperCase()}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            my: 0.25,
            fontSize: "1.25rem",
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              opacity: 0.8,
              fontSize: "0.65rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            {warning && <WarningAmberRounded sx={{ fontSize: 12 }} />}
            {subtitle}
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const auth = useAuth() as unknown as AuthContextValue;
  const user = auth?.user;
  const dashboardApi = api as unknown as DashboardApi;

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionFilter, setTransactionFilter] =
    useState<TransactionFilter>("all");

  const [viewMode, setViewMode] = useState<ViewMode>("weekly");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const dateString = currentDate.toISOString().split("T")[0];

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      try {
        setError(null);

        if (!dashboardData) {
          setInitialLoading(true);
        } else {
          setIsUpdating(true);
        }

        const params: DashboardParams = {
          range: viewMode,
          date: dateString,
        };

        const data = await dashboardApi.getDashboard(params, {
          signal: controller.signal,
        });

        setDashboardData(data);
      } catch (err: unknown) {
        const isAbortError =
          err instanceof DOMException && err.name === "AbortError";

        if (!isAbortError) {
          console.error("Error:", err);
          setError("Failed to load data.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
          setIsUpdating(false);
        }
      }
    };

    if (user?.id) {
      fetchDashboardData();
    }

    return () => controller.abort();
  }, [user?.id, viewMode, dateString]);

  const handleNavigate = (direction: -1 | 1) => {
    const newDate = new Date(currentDate);

    if (viewMode === "weekly") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else if (viewMode === "monthly") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }

    setCurrentDate(newDate);
  };

  const getDateLabel = (): string => {
    if (viewMode === "weekly") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);

      start.setDate(diff);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return `${start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`;
    }

    if (viewMode === "monthly") {
      return currentDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }

    return currentDate.getFullYear().toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (initialLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!dashboardData) return null;

  const { summary, chartData, recentTransactions = [] } = dashboardData;

  const filteredRecentTransactions = recentTransactions.filter((transaction) =>
    transactionFilter === "all" ? true : transaction.type === transactionFilter,
  );

  const isOverspending =
    summary.currentMonthExpenses > summary.currentMonthIncome;

  const healthScore = Math.min(
    100,
    Math.max(
      0,
      100 -
        (summary.currentMonthExpenses / (summary.currentMonthIncome || 1)) *
          100,
    ),
  );

  const COLORS = [
    "#6366f1",
    "#ec4899",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#06b6d4",
  ];

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 0, sm: 2 },
        px: { xs: 0, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: { xs: 1, sm: 2 },
          gap: { xs: 1, sm: 0 },
          px: { xs: 2, sm: 0 },
          pt: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "background.paper",
            p: 0.75,
            px: 2,
            borderRadius: 2,
            boxShadow: 1,
            transform: { xs: "scale(0.9)", sm: "none" },
            transformOrigin: "left center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              fontSize: "0.7rem",
            }}
          >
            HEALTH SCORE
          </Typography>

          <Box sx={{ width: 80 }}>
            <LinearProgress
              variant="determinate"
              value={healthScore}
              sx={{
                height: 4,
                borderRadius: 1,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  bgcolor:
                    healthScore > 70
                      ? "#10b981"
                      : healthScore > 30
                        ? "#f59e0b"
                        : "#ef4444",
                  borderRadius: 1,
                },
              }}
            />
          </Box>

          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              fontSize: "0.8rem",
              color:
                healthScore > 70
                  ? "success.main"
                  : healthScore > 30
                    ? "warning.main"
                    : "error.main",
            }}
          >
            {Math.round(healthScore)}%
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Balance"
            value={formatCurrency(summary.balance)}
            icon={AccountBalanceWallet}
            gradient="linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)"
            trend="up"
            trendValue="+2.4%"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Monthly Income"
            value={formatCurrency(summary.currentMonthIncome)}
            icon={TrendingUp}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            trend={summary.incomeTrend >= 0 ? "up" : "down"}
            trendValue={`${Math.abs(summary.incomeTrend).toFixed(0)}%`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(summary.currentMonthExpenses)}
            icon={TrendingDown}
            gradient={
              isOverspending
                ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                : "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
            }
            trend={summary.expenseTrend >= 0 ? "up" : "down"}
            trendValue={`${Math.abs(summary.expenseTrend).toFixed(0)}%`}
            warning={isOverspending}
            subtitle={isOverspending ? "Exceeds Income!" : "Within budget"}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Savings Rate"
            value={`${healthScore.toFixed(0)}%`}
            icon={Receipt}
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
            subtitle="Of income saved"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 12 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: 1.5,
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              overflow: "hidden",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                  gap: 1,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    Cash Flow
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleNavigate(-1)}
                      sx={{ p: 0.5 }}
                    >
                      <ChevronLeft fontSize="small" />
                    </IconButton>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      {getDateLabel()}
                    </Typography>

                    <IconButton
                      size="small"
                      onClick={() => handleNavigate(1)}
                      sx={{ p: 0.5 }}
                    >
                      <ChevronRight fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(
                    _event: React.MouseEvent<HTMLElement>,
                    newMode: ViewMode | null,
                  ) => {
                    if (newMode) setViewMode(newMode);
                  }}
                  size="small"
                  sx={{
                    height: 24,
                    "& .MuiToggleButton-root": {
                      fontSize: "0.65rem",
                      px: 1,
                      py: 0,
                      textTransform: "none",
                      fontWeight: 600,
                    },
                  }}
                >
                  <ToggleButton value="weekly">Week</ToggleButton>
                  <ToggleButton value="monthly">Month</ToggleButton>
                  <ToggleButton value="yearly">Year</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box
                sx={{
                  height: { xs: 180, sm: 240 },
                  minWidth: 0,
                  opacity: isUpdating ? 0.5 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData.chart || []}
                    margin={{
                      top: 10,
                      right: 0,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorIncome"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="colorExpense"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ef4444"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ef4444"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                      }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                        fill: "#94a3b8",
                      }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        fontSize: "11px",
                        padding: "8px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorIncome)"
                    />

                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke={isOverspending ? "#ef4444" : "#f43f5e"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Card
              sx={{
                flex: 1,
                borderRadius: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    mb: 1,
                  }}
                >
                  Spending Breakdown
                </Typography>

                <Box
                  sx={{
                    height: { xs: "auto", sm: 160 },
                    display: "flex",
                    flexDirection: {
                      xs: "column",
                      sm: "row",
                    },
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "100%", sm: "50%" },
                      height: 160,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.categoryStats || []}
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="total"
                        >
                          {chartData.categoryStats?.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              strokeWidth={0}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box
                    sx={{
                      width: { xs: "100%", sm: "50%" },
                      display: "flex",
                      flexDirection: {
                        xs: "row",
                        sm: "column",
                      },
                      flexWrap: {
                        xs: "wrap",
                        sm: "nowrap",
                      },
                      justifyContent: "center",
                      gap: 1,
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    {chartData.categoryStats?.slice(0, 3).map((cat, index) => (
                      <Box
                        key={cat.name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          width: {
                            xs: "45%",
                            sm: "100%",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: COLORS[index % COLORS.length],
                          }}
                        />

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              display: "block",
                              lineHeight: 1,
                              fontSize: "0.7rem",
                            }}
                          >
                            {cat.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.65rem",
                            }}
                          >
                            {formatCurrency(cat.total)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              height: "100%",
            }}
          >
            <Card
              sx={{
                flex: 1.5,
                borderRadius: 1.5,
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box
                  sx={{
                    p: 1,
                    px: 2,
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    minHeight: 48,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    Recent
                  </Typography>

                  <ToggleButtonGroup
                    value={transactionFilter}
                    exclusive
                    onChange={(
                      _event: React.MouseEvent<HTMLElement>,
                      newVal: TransactionFilter | null,
                    ) => {
                      if (newVal) {
                        setTransactionFilter(newVal);
                      }
                    }}
                    size="small"
                    sx={{
                      height: 24,
                      "& .MuiToggleButton-root": {
                        fontSize: "0.65rem",
                        px: 1,
                        py: 0,
                        fontWeight: 600,
                        borderRadius: 1,
                        border: "1px solid rgba(0,0,0,0.05)",
                        textTransform: "none",
                      },
                    }}
                  >
                    <ToggleButton value="all">All</ToggleButton>

                    <ToggleButton
                      value="income"
                      sx={{
                        "&.Mui-selected": {
                          bgcolor: "success.light",
                          color: "success.dark",
                          "&:hover": {
                            bgcolor: "success.light",
                          },
                        },
                      }}
                    >
                      In
                    </ToggleButton>

                    <ToggleButton
                      value="expense"
                      sx={{
                        "&.Mui-selected": {
                          bgcolor: "error.light",
                          color: "error.dark",
                          "&:hover": {
                            bgcolor: "error.light",
                          },
                        },
                      }}
                    >
                      Out
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <List sx={{ p: 0, maxHeight: 220, overflow: "auto" }}>
                  {filteredRecentTransactions
                    .slice(0, 10)
                    .map((transaction) => (
                      <ListItem
                        key={transaction.id}
                        sx={{
                          py: 0.5,
                          px: { xs: 1, sm: 2 },
                          borderBottom: "1px solid #f8fafc",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "60%",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              width: 40,
                              fontSize: "0.65rem",
                              fontWeight: 500,
                            }}
                          >
                            {new Date(transaction.timestamp).toLocaleDateString(
                              undefined,
                              {
                                month: "numeric",
                                day: "numeric",
                              },
                            )}
                          </Typography>

                          <Box
                            sx={{
                              ml: 1,
                              overflow: "hidden",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {transaction.category}
                            </Typography>

                            {transaction.note && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.65rem",
                                  display: "block",
                                  lineHeight: 1,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {transaction.note}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            color:
                              transaction.type === "income"
                                ? "success.main"
                                : "error.main",
                            fontFamily: "monospace",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </ListItem>
                    ))}

                  {filteredRecentTransactions.length === 0 && (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        No recent transactions
                      </Typography>
                    </Box>
                  )}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
