import { useState } from 'react';
import { Pill, Plus } from 'lucide-react';
import { WidgetCard, SectionHeader, EmptyState, Skeleton } from '../../components/dashboard/DashboardShared';
import { usePrescriptions, usePatients } from '../../hooks/useDoctor';
import PrescribeForm from '../../components/doctor/PrescribeForm';

export default function DoctorPrescriptions() {
  const { data: prescriptions = [], isLoading } = usePrescriptions();
  const { data: patients = [] } = usePatients();
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');

  const patientName = (citizenId: string) => patients.find((p) => p._id === citizenId)?.name;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Prescriptions</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Everything you've prescribed across your patients.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
        >
          <Plus size={15} /> New Prescription
        </button>
      </div>

      {showForm && (
        <WidgetCard>
          <SectionHeader title="Select patient" />
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="mt-3 w-full sm:w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select a patient…</option>
            {patients.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </WidgetCard>
      )}
      {showForm && selectedPatient && (
        <PrescribeForm citizenId={selectedPatient} onDone={() => { setShowForm(false); setSelectedPatient(''); }} />
      )}

      <WidgetCard>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : prescriptions.length === 0 ? (
          <EmptyState icon={<Pill size={32} />} title="No prescriptions yet" description="Prescriptions you write will appear here." />
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {prescriptions.map((rx) => (
              <li key={rx._id} className="py-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{rx.name} — {rx.dosage}</p>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${rx.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'}`}>
                    {rx.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {rx.frequency} · for {patientName(rx.citizen) || 'patient'} · started {new Date(rx.startDate).toLocaleDateString()}
                </p>
                {rx.instructions && <p className="text-xs text-slate-400 mt-1">{rx.instructions}</p>}
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>
    </div>
  );
}
