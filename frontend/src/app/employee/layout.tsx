import Sidebar from '@/components/Sidebar';
import BackgroundTracker from '@/components/BackgroundTracker';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#f8fafc] min-h-screen">
      <Sidebar />
      <BackgroundTracker />
      <main className="flex-1 ml-64 p-0">
        {children}
      </main>
    </div>
  );
}
