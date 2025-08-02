import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Rule {
  id?: number;
  category: string;
  extensions: string;
  destination: string;
  enabled: boolean;
}

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Rule>({
    category: '',
    extensions: '',
    destination: '',
    enabled: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const loadedRules = await window.electron.getRules();
      setRules(loadedRules);
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  };

  const handleSelectDirectory = async () => {
    try {
      const path = await window.electron.selectDirectory();
      if (path) {
        setNewRule(prev => ({ ...prev, destination: path }));
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const handleSaveRule = async () => {
    try {
      if (newRule.category && newRule.extensions && newRule.destination) {
        await window.electron.saveRule(newRule);
        setNewRule({
          category: '',
          extensions: '',
          destination: '',
          enabled: true,
        });
        await loadRules();
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    try {
      await window.electron.deleteRule(ruleId);
      await loadRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleToggleRule = async (rule: Rule) => {
    try {
      await window.electron.updateRule({
        ...rule,
        enabled: !rule.enabled,
      });
      await loadRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Sorting Rules</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define how files should be organized
        </p>
      </div>

      {/* Add new rule form */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-medium text-gray-900">Add New Rule</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              value={newRule.category}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, category: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              placeholder="e.g., Documents"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Extensions
            </label>
            <input
              type="text"
              value={newRule.extensions}
              onChange={(e) =>
                setNewRule((prev) => ({ ...prev, extensions: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              placeholder="e.g., .pdf,.doc,.txt"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Destination
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                value={newRule.destination}
                readOnly
                className="block w-full rounded-none rounded-l-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                placeholder="Select destination folder"
              />
              <button
                type="button"
                onClick={handleSelectDirectory}
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Browse
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveRule}
            disabled={
              !newRule.category || !newRule.extensions || !newRule.destination
            }
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Rules list */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <ul className="divide-y divide-gray-200">
          {rules.map((rule) => (
            <li key={rule.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {rule.category}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Extensions: {rule.extensions}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Destination: {rule.destination}
                  </p>
                </div>
                <div className="ml-4 flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      rule.enabled ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => rule.id && handleDeleteRule(rule.id)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {rules.length === 0 && (
            <li className="p-4 text-center text-gray-500">
              No rules defined yet. Add your first rule above.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 