import React, { useState } from 'react';
import { Download, Users, BookOpen, ChevronDown } from 'lucide-react';
import axiosInstance from '../../../utils/axiosInstance';

const ExportButtons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState('');

  const handleExport = async (type) => {
    setExporting(type);
    
    try {
      const response = await axiosInstance.get(`/admin/export/${type}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log(`${type} exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export ${type}. Please try again.`);
    } finally {
      setExporting('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting !== ''}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 text-sm"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded shadow-lg border min-w-[160px]">
          <button
            onClick={() => handleExport('users')}
            disabled={exporting === 'users'}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left text-sm"
          >
            <Users className="w-4 h-4" />
            Users
          </button>
          <button
            onClick={() => handleExport('courses')}
            disabled={exporting === 'courses'}
            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 text-left text-sm"
          >
            <BookOpen className="w-4 h-4" />
            Courses
          </button>
        </div>
      )}

      {exporting && (
        <div className="absolute -bottom-8 left-0 text-xs text-gray-600">
          Exporting {exporting}...
        </div>
      )}
    </div>
  );
};

export default ExportButtons;