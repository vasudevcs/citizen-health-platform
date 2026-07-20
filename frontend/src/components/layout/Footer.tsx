export function Footer() {
  return (
    <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400 dark:border-slate-800 sm:flex-row">
      <p>© {new Date().getFullYear()} Citizen Health & Social Wellbeing Platform</p>
      <div className="flex gap-4">
        <a href="/privacy" className="hover:underline">Privacy Policy</a>
        <a href="/terms" className="hover:underline">Terms of Service</a>
        <a href="/accessibility" className="hover:underline">Accessibility</a>
        <a href="/help" className="hover:underline">Help Center</a>
      </div>
    </footer>
  );
}
