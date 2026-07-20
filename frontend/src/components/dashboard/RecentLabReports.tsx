import { FlaskConical, FileText, TrendingDown, TrendingUp, Minus, ExternalLink } from 'lucide-react';
import type { LabReport } from '../../types/health';
import { WidgetCard, SectionHeader, EmptyState, StatusBadge } from './DashboardShared';

interface RecentLabReportsProps {
  reports: LabReport[];
}

function getReportSummary(report: LabReport): { abnormal: number; total: number } {
  const total = report.results.length;
  const abnormal = report.results.filter((r) => r.status !== 'normal').length;
  return { abnormal, total };
}

const resultStatusIcon: Record<string, React.ElementType> = {
  high: TrendingUp,
  low: TrendingDown,
  normal: Minus,
  critical: TrendingUp,
};

export function RecentLabReports({ reports }: RecentLabReportsProps) {
  return (
    <WidgetCard>
      <div className="mb-4">
        <SectionHeader
          title="Recent Lab Reports"
          subtitle="Latest investigation results"
          action={
            <a href="/phr" className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400">
              View All →
            </a>
          }
        />
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<FlaskConical size={40} />}
          title="No lab reports yet"
          description="Upload your lab results to track them here"
        />
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => {
            const { abnormal, total } = getReportSummary(report);
            const dateStr = new Date(report.conductedAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <li
                key={report._id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-lg p-1.5 ${abnormal > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                      <FileText
                        size={15}
                        className={abnormal > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {report.title}
                      </p>
                      {report.lab && (
                        <p className="text-[11px] text-slate-400">{report.lab}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.fileUrl && (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-teal-600"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{dateStr}</span>
                  <div className="flex items-center gap-2">
                    {total > 0 && (
                      <span className="text-[11px] text-slate-400">{total} parameters</span>
                    )}
                    {abnormal > 0 ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {abnormal} abnormal
                      </span>
                    ) : (
                      total > 0 && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          All normal
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Show up to 3 abnormal results */}
                {report.results.filter((r) => r.status !== 'normal').length > 0 && (
                  <div className="mt-2 space-y-1">
                    {report.results
                      .filter((r) => r.status !== 'normal')
                      .slice(0, 3)
                      .map((result, i) => {
                        const Icon = resultStatusIcon[result.status] || Minus;
                        return (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 dark:text-slate-400">{result.parameter}</span>
                            <div className="flex items-center gap-1">
                              <Icon size={10} className={result.status === 'high' || result.status === 'critical' ? 'text-red-500' : 'text-blue-500'} />
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {result.value} {result.unit}
                              </span>
                              <StatusBadge status={result.status} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}
