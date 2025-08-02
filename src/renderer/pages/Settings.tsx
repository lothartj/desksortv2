import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [desktopPath, setDesktopPath] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const path = await window.electron.getDesktopPath();
      setDesktopPath(path);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure application settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Desktop Path */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Desktop Location
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Your desktop is located at:</p>
            </div>
            <div className="mt-3">
              <input
                type="text"
                readOnly
                value={desktopPath}
                className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              About DeskSort
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                DeskSort is a professional desktop organization tool that helps you
                keep your files organized automatically. It supports various file
                types and custom sorting rules.
              </p>
            </div>
            <div className="mt-3 text-sm">
              <p>Version: 1.0.0</p>
              <p className="mt-1">
                Built with Electron, React, and SQLite
              </p>
            </div>
          </div>
        </div>

        {/* Future Settings */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Additional Settings
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>More settings will be available in future updates:</p>
              <ul className="mt-2 list-disc pl-5">
                <li>Automatic sorting schedule</li>
                <li>Backup and restore rules</li>
                <li>Custom file type definitions</li>
                <li>Advanced sorting patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 