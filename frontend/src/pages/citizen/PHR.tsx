
import { useSearchParams } from 'react-router-dom';
import { Activity, Pill, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VitalsTab from '../../components/phr/VitalsTab';
import MedicationsTab from '../../components/phr/MedicationsTab';
import LabReportsTab from '../../components/phr/LabReportsTab';

export default function PHR() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'vitals';

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'reports', label: 'Lab Reports', icon: FlaskConical },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personal Health Records</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Manage your vitals, medications, and lab reports.
        </p>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-teal-500 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-teal-500 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === 'vitals' && <VitalsTab />}
            {currentTab === 'medications' && <MedicationsTab />}
            {currentTab === 'reports' && <LabReportsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
