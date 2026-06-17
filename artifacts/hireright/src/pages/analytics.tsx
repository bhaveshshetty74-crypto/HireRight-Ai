import { useGetAnalyticsSummary } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart as BarChartIcon, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function Analytics() {
  const { data: summary, isLoading } = useGetAnalyticsSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">Deep dive into your recruitment performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shortlist Rate</p>
                <div className="text-3xl font-bold mt-2">
                  {summary?.shortlistRate ? `${summary.shortlistRate.toFixed(1)}%` : "0%"}
                </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average AI Score</p>
                <div className="text-3xl font-bold mt-2">
                  {summary?.avgScore ? summary.avgScore.toFixed(0) : "0"}
                </div>
              </div>
              <div className="h-12 w-12 bg-chart-2/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Screened Candidates</p>
                <div className="text-3xl font-bold mt-2">
                  {summary?.totalScreened || 0}
                </div>
              </div>
              <div className="h-12 w-12 bg-chart-3/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              Pipeline by Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {summary?.byStage && summary.byStage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.byStage} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Not enough data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Screening Verdicts</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col">
            {summary?.byVerdict && summary.byVerdict.length > 0 ? (
              <>
                <div className="flex-1 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.byVerdict}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="label"
                      >
                        {summary.byVerdict.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 pt-2">
                  {summary.byVerdict.map((entry, index) => (
                    <div key={entry.label} className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.label} ({entry.count})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Not enough data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
