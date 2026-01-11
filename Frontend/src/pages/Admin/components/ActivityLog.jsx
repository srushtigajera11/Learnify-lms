// frontend/src/pages/admin/components/ActivityLog.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search,
  Refresh,
  Block,
  CheckCircle,
  Cancel,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fetchActivityLogs } from '../services/adminApi';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    action: '',
    startDate: null,
    endDate: null,
    search: ''
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      };

      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }

      const response = await fetchActivityLogs(params);
      setLogs(response.data.logs);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, rowsPerPage]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(0);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'USER_BLOCKED':
        return <Block color="error" fontSize="small" />;
      case 'USER_UNBLOCKED':
        return <CheckCircle color="success" fontSize="small" />;
      case 'COURSE_APPROVED':
        return <CheckCircle color="success" fontSize="small" />;
      case 'COURSE_REJECTED':
        return <Cancel color="error" fontSize="small" />;
      case 'COURSE_VISIBILITY_CHANGED':
        return <Visibility color="info" fontSize="small" />;
      default:
        return null;
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'USER_BLOCKED': 'error',
      'USER_UNBLOCKED': 'success',
      'COURSE_APPROVED': 'success',
      'COURSE_REJECTED': 'error',
      'COURSE_VISIBILITY_CHANGED': 'info'
    };
    return colors[action] || 'default';
  };

  const formatAction = (action) => {
    return action.toLowerCase().replace(/_/g, ' ');
  };

  return (
    <Card>
      <CardHeader 
        title="Activity Log"
        action={
          <Button
            startIcon={<Refresh />}
            onClick={loadLogs}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />
      
      <CardContent>
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={filters.action}
              label="Action Type"
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="USER_BLOCKED">User Blocked</MenuItem>
              <MenuItem value="USER_UNBLOCKED">User Unblocked</MenuItem>
              <MenuItem value="COURSE_APPROVED">Course Approved</MenuItem>
              <MenuItem value="COURSE_REJECTED">Course Rejected</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>

          <TextField
            placeholder="Search admin or target..."
            size="small"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <Button
            variant="contained"
            onClick={loadLogs}
            disabled={loading}
          >
            Apply Filters
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Admin</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No activity logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {log.adminId?.email || 'System'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getActionIcon(log.action)}
                        label={formatAction(log.action)}
                        color={getActionColor(log.action)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {log.targetName || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default ActivityLog;