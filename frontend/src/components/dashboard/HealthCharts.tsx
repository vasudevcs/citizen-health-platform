import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VitalTrendPoint } from '../../types/health';
import { WidgetCard, SectionHeader, EmptyState } from './DashboardShared';
import { Activity } from 'lucide-react';

// ─── Format date for X axis ───────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

// ─── Blood Pressure Chart ─────────────────────────────────────────────────────
interface BPChartProps {
  data: VitalTrendPoint[];
}

export function BloodPressureChart({ data }: BPChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.recordedAt),
    systolic: d.value.primary,
    diastolic: d.value.secondary,
  }));

  return (
    <WidgetCard>
      <SectionHeader title="Blood Pressure" subtitle="30-day trend (mmHg)" />
      {data.length === 0 ? (
        <EmptyState
          icon={<Activity size={40} />}
          title="No blood pressure data"
          description="Log your readings to see trends"
        />
      ) : (
        <div className="mt-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} dot={false} name="Systolic" />
              <Line type="monotone" dataKey="diastolic" stroke="#a78bfa" strokeWidth={2} dot={false} name="Diastolic" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}

// ─── Blood Sugar Chart ────────────────────────────────────────────────────────
interface BSChartProps {
  data: VitalTrendPoint[];
}

export function BloodSugarChart({ data }: BSChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.recordedAt),
    value: d.value.primary,
  }));

  return (
    <WidgetCard>
      <SectionHeader title="Blood Sugar" subtitle="30-day trend (mg/dL)" />
      {data.length === 0 ? (
        <EmptyState
          icon={<Activity size={40} />}
          title="No blood sugar data"
          description="Log your glucose readings"
        />
      ) : (
        <div className="mt-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#bsGrad)" name="Blood Sugar" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}

// ─── Heart Rate Chart ─────────────────────────────────────────────────────────
interface HRChartProps {
  data: VitalTrendPoint[];
}

export function HeartRateChart({ data }: HRChartProps) {
  const chartData = data.map((d) => ({
    date: formatDate(d.recordedAt),
    value: d.value.primary,
  }));

  return (
    <WidgetCard>
      <SectionHeader title="Heart Rate" subtitle="30-day trend (bpm)" />
      {data.length === 0 ? (
        <EmptyState
          icon={<Activity size={40} />}
          title="No heart rate data"
          description="Log your heart rate readings"
        />
      ) : (
        <div className="mt-4 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} fill="url(#hrGrad)" name="Heart Rate" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  );
}
