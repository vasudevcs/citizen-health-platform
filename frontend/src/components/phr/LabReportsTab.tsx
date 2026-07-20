import { useState } from 'react';
import { FlaskConical, Plus, FileText, ExternalLink, Calendar, Info, Upload, X } from 'lucide-react';
import { useLabReports, useCreateLabReport } from '../../hooks/useCitizen';
import { WidgetCard, SectionHeader, EmptyState, StatusBadge } from '../dashboard/DashboardShared';

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB — must match backend/validations/uploadValidation.js
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is a data: URL — strip the "data:<mime>;base64," prefix
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const createLabReport = useCreateLabReport();
  const [title, setTitle] = useState('');
  const [lab, setLab] = useState('');
  const [conductedAt, setConductedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSharedWithDoctor, setIsSharedWithDoctor] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setFileError('');
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFileError('File must be a PDF, JPEG, PNG, or WebP.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setFileError('File must be 8MB or smaller.');
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !conductedAt) return;
    const filePayload = file
      ? { fileName: file.name, fileType: file.type, fileData: await fileToBase64(file) }
      : undefined;

    createLabReport.mutate(
      {
        title: title.trim(),
        lab: lab.trim() || undefined,
        conductedAt,
        notes: notes.trim() || undefined,
        isSharedWithDoctor,
        file: filePayload,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <WidgetCard className="bg-slate-50 dark:bg-slate-800/50">
      <div className="flex items-center justify-between">
        <SectionHeader title="Upload Lab Report" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel upload"
          className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Report title (e.g. CBC Report)"
          maxLength={150}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={lab}
            onChange={(e) => setLab(e.target.value)}
            placeholder="Lab name (optional)"
            maxLength={150}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
          <input
            type="date"
            value={conductedAt}
            onChange={(e) => setConductedAt(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Notes (optional)"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        />

        <div>
          <label
            htmlFor="lab-report-file"
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:border-teal-400 dark:border-slate-700"
          >
            <Upload size={28} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {file ? file.name : 'Choose a PDF or image to upload'}
            </span>
            <span className="text-xs text-slate-400">PDF, JPEG, PNG, or WebP · up to 8MB</span>
          </label>
          <input
            id="lab-report-file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
          {fileError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fileError}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={isSharedWithDoctor}
            onChange={(e) => setIsSharedWithDoctor(e.target.checked)}
            className="h-4 w-4 rounded accent-teal-600"
          />
          Share this report with my doctor
        </label>

        {createLabReport.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">
            Could not upload the report. Please try again.
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createLabReport.isPending || !title.trim() || !conductedAt}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {createLabReport.isPending ? 'Uploading…' : 'Save Report'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </WidgetCard>
  );
}

export default function LabReportsTab() {
  const { data: reports = [], isLoading } = useLabReports();
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus size={16} />
          {isAdding ? 'Cancel' : 'Upload Report'}
        </button>
      </div>

      {isAdding && <UploadForm onClose={() => setIsAdding(false)} />}

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-slate-500">Loading lab reports...</p>
        ) : reports.length === 0 ? (
          <WidgetCard>
            <EmptyState icon={<FlaskConical size={40} />} title="No lab reports" description="Your uploaded lab reports will appear here." />
          </WidgetCard>
        ) : (
          reports.map((report) => {
            const dateStr = new Date(report.conductedAt).toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const abnormalCount = report.results.filter(r => r.status !== 'normal').length;

            return (
              <WidgetCard key={report._id}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                      <FileText size={24} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{report.title}</h3>
                      <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <Calendar size={14} /> {dateStr} {report.lab && `· ${report.lab}`}
                      </p>
                    </div>
                  </div>
                  
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40"
                    >
                      View Original Document <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                {report.notes && (
                  <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex gap-2 items-start">
                    <Info size={16} className="text-slate-400 mt-0.5" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">{report.notes}</p>
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Test Results</h4>
                    {abnormalCount > 0 ? (
                       <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                         {abnormalCount} Abnormal flag{abnormalCount > 1 ? 's' : ''}
                       </span>
                    ) : (
                       <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                         All Normal
                       </span>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {report.results.map((result, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{result.parameter}</p>
                          {result.referenceRange && (
                            <p className="text-[11px] text-slate-500 mt-0.5">Ref: {result.referenceRange}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-semibold ${result.status !== 'normal' ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                            {result.value} {result.unit}
                          </span>
                          <StatusBadge status={result.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </WidgetCard>
            )
          })
        )}
      </div>
    </div>
  );
}
