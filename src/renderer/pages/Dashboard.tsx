import React, { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  extension: string;
}

interface SortingStats {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
}

declare global {
  interface Window {
    electron: {
      getDesktopPath: () => Promise<string>;
      scanDesktop: () => Promise<FileInfo[]>;
      sortFiles: (rules: any[]) => Promise<void>;
      getRules: () => Promise<any[]>;
    };
  }
}

export default function Dashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [desktopFiles, setDesktopFiles] = useState<FileInfo[]>([]);
  const [stats, setStats] = useState<SortingStats>({
    totalFiles: 0,
    processedFiles: 0,
    skippedFiles: 0,
  });

  const scanDesktop = async () => {
    setIsScanning(true);
    try {
      const files = await window.electron.scanDesktop();
      setDesktopFiles(files);
      setStats(prev => ({ ...prev, totalFiles: files.length }));
    } catch (error) {
      console.error('Failed to scan desktop:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const startSorting = async () => {
    setIsSorting(true);
    try {
      const rules = await window.electron.getRules();
      await window.electron.sortFiles(rules);
      await scanDesktop();
    } catch (error) {
      console.error('Failed to sort files:', error);
    } finally {
      setIsSorting(false);
    }
  };

  useEffect(() => {
    scanDesktop();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and organize your desktop files
        </p>
      </div>

      {/* Action buttons */}
      <div className="mb-8 flex space-x-4">
        <button
          onClick={scanDesktop}
          disabled={isScanning}
          className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <ArrowPathIcon
            className={`mr-2 h-5 w-5 text-gray-400 ${
              isScanning ? 'animate-spin' : ''
            }`}
          />
          Scan Desktop
        </button>

        <button
          onClick={startSorting}
          disabled={isSorting || desktopFiles.length === 0}
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isSorting ? 'Sorting...' : 'Sort Files'}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {[
          { label: 'Total Files', value: stats.totalFiles },
          { label: 'Processed', value: stats.processedFiles },
          { label: 'Skipped', value: stats.skippedFiles },
        ].map((stat) => (
          <div
            key={stat.label}
            className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
          >
            <dt className="truncate text-sm font-medium text-gray-500">
              {stat.label}
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {stat.value}
            </dd>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Desktop Files
          </h3>
          <div className="mt-4 max-h-96 overflow-auto">
            <ul className="divide-y divide-gray-200">
              {desktopFiles.map((file, index) => (
                <li key={index} className="py-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 truncate text-sm">
                      <p className="font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-gray-500 truncate text-xs">
                        {file.isDirectory ? 'Folder' : `File${file.extension}`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 