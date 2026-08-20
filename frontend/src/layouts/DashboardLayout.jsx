import React, { useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Topbar from '../components/Topbar.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import WorkspaceHeader from '../components/WorkspaceHeader.jsx';
import { AnimatePresence, motion } from 'framer-motion';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -5, filter: 'blur(2px)' }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
