import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  HomeIcon,
  Cog6ToothIcon,
  ClockIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));
const History = React.lazy(() => import('./pages/History'));
const Rules = React.lazy(() => import('./pages/Rules'));

const navigation = [
  { name: 'Dashboard', icon: HomeIcon, path: '/' },
  { name: 'Rules', icon: FolderIcon, path: '/rules' },
  { name: 'History', icon: ClockIcon, path: '/history' },
  { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
];

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg">
            <div className="flex h-16 items-center justify-center border-b">
              <h1 className="text-xl font-bold text-gray-900">DeskSort</h1>
            </div>
            <nav className="mt-5 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="group flex items-center px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon
                    className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            <React.Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <div className="text-gray-500">Loading...</div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </React.Suspense>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App; 