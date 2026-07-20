import { Link } from 'react-router-dom';
import { ShieldAlert, SearchX } from 'lucide-react';

interface StatusPageProps {
  code: '403' | '404';
}

const CONTENT = {
  '403': {
    icon: ShieldAlert,
    title: 'Access Denied',
    description: "You don't have permission to view this page with your current account role.",
  },
  '404': {
    icon: SearchX,
    title: 'Page Not Found',
    description: "The page you're looking for doesn't exist or has been moved.",
  },
};

export default function StatusPage({ code }: StatusPageProps) {
  const { icon: Icon, title, description } = CONTENT[code];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <Icon size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
      <p className="text-sm font-medium text-slate-400 dark:text-slate-500">{code}</p>
      <h1 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
