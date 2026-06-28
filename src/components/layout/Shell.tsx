import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Shell() {
  return (
    <div className="flex min-h-screen bg-green-950">
      <Sidebar />
      {/* Main content pushes right of sidebar; sidebar is 56px collapsed, 224px expanded */}
      <main className="flex-1 ml-14 md:ml-56 min-h-screen overflow-y-auto transition-all duration-200">
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
