import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface SortHistoryItem {
  id: number;
  timestamp: string;
  source_path: string;
  destination_path: string;
  category: string;
  extensions: string;
  success: boolean;
  error_message?: string;
}

export default function History() {
  const [history, setHistory] = useState<SortHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await window.electron.getSortHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sort History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View recent file sorting operations
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          {history.length === 0 ? (
            <div className="text-center text-gray-500">
              No sorting operations have been performed yet.
            </div>
          ) : (
            <div className="flow-root">
              <ul className="-mb-8">
                {history.map((item, itemIdx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {itemIdx !== history.length - 1 ? (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              item.success
                                ? 'bg-green-100'
                                : 'bg-red-100'
                            }`}
                          >
                            {item.success ? (
                              <CheckCircleIcon
                                className="h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                            ) : (
                              <XCircleIcon
                                className="h-5 w-5 text-red-500"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {item.category
                                ? `Sorted ${item.category} file using rule for ${item.extensions}`
                                : 'File operation'}
                            </p>
                            <div className="mt-1 text-sm text-gray-900">
                              <p>From: {item.source_path}</p>
                              {item.success && (
                                <p>To: {item.destination_path}</p>
                              )}
                              {!item.success && item.error_message && (
                                <p className="text-red-600">
                                  Error: {item.error_message}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={item.timestamp}>
                              {formatDate(item.timestamp)}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 