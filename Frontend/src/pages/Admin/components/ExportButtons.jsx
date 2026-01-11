// frontend/src/pages/admin/components/ExportButtons.jsx
import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Download,
  TableChart,
  People,
  MenuBook
} from '@mui/icons-material';
import { exportUsersCSV, exportCoursesCSV } from '../services/adminApi';

const ExportButtons = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [exporting, setExporting] = useState('');

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      let data;
      let filename;

      if (type === 'users') {
        data = await exportUsersCSV();
        filename = `users_export_${Date.now()}.csv`;
      } else if (type === 'courses') {
        data = await exportCoursesCSV();
        filename = `courses_export_${Date.now()}.csv`;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([data.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Show success message (you can use a toast notification)
      console.log(`${type} exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting('');
      handleClose();
    }
  };

  return (
    <>
      <Tooltip title="Export Data">
        <IconButton
          onClick={handleClick}
          color="primary"
          disabled={exporting !== ''}
        >
          {exporting ? <CircularProgress size={24} /> : <Download />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem 
          onClick={() => handleExport('users')}
          disabled={exporting === 'users'}
        >
          <People sx={{ mr: 1 }} />
          Export Users
          {exporting === 'users' && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleExport('courses')}
          disabled={exporting === 'courses'}
        >
          <MenuBook sx={{ mr: 1 }} />
          Export Courses
          {exporting === 'courses' && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportButtons;