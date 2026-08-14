import React, { useContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const workspace = { STUDENT: 'workspace-student', COMPANY: 'workspace-company', PLACEMENT_MANAGER: 'workspace-manager', ADMIN: 'workspace-admin' }[user?.role] || 'workspace-student';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`app-shell ${workspace} flex h-screen overflow-hidden`}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 w-full overflow-hidden lg:pl-64">
        <Topbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
          <div className="max-w-7xl mx-auto page-reveal role-glow">
            <WorkspaceHeader />
            <div className="mt-7">
            <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
