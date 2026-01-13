// frontend/src/pages/admin/components/ExportButtons.jsx
import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress,
  Box
} from '@mui/material';
import {
  Download,
  TableChart,
  People,
  MenuBook
} from '@mui/icons-material';
import axiosInstance from '../../../utils/axiosInstance';

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
      const response = await axiosInstance.get(`/admin/export/${type}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log(`${type} exported successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export ${type}. Please try again.`);
    } finally {
      setExporting('');
      handleClose();
    }
  };

  return (
    <Box>
      <Tooltip title="Export Data">
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={handleClick}
          disabled={exporting !== ''}
        >
          {exporting ? <CircularProgress size={24} /> : 'Export'}
        </Button>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <People fontSize="small" />
            Export Users
            {exporting === 'users' && <CircularProgress size={16} />}
          </Box>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleExport('courses')}
          disabled={exporting === 'courses'}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MenuBook fontSize="small" />
            Export Courses
            {exporting === 'courses' && <CircularProgress size={16} />}
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ExportButtons;