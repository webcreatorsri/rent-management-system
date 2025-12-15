import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon
} from '@mui/icons-material';
import { getTenants, getApartments, getRentRecords } from '../services/firebaseServices';
import { format } from 'date-fns';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [rentRecords, setRentRecords] = useState([]);
  const [filters, setFilters] = useState({
    month: format(new Date(), 'yyyy-MM'),
    status: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, apartmentsRes, rentRes] = await Promise.all([
        getTenants(),
        getApartments(),
        getRentRecords()
      ]);

      if (tenantsRes.success) setTenants(tenantsRes.data);
      if (apartmentsRes.success) setApartments(apartmentsRes.data);
      if (rentRes.success) setRentRecords(rentRes.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const generateOccupancyReport = () => {
    const totalApartments = apartments.length;
    const occupied = apartments.filter(apt => apt.status === 'occupied').length;
    const vacant = apartments.filter(apt => apt.status === 'vacant').length;
    const maintenance = apartments.filter(apt => apt.status === 'under_maintenance').length;

    return {
      totalApartments,
      occupied,
      vacant,
      maintenance,
      occupancyRate: totalApartments > 0 ? ((occupied / totalApartments) * 100).toFixed(1) : 0
    };
  };

  const generateRentCollectionReport = () => {
    const currentMonth = filters.month;
    const monthRecords = rentRecords.filter(record => record.month === currentMonth);
    
    const totalExpected = tenants.reduce((sum, tenant) => sum + (parseFloat(tenant.rentAmount) || 0), 0);
    const totalCollected = monthRecords.reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0);
    const pending = totalExpected - totalCollected;
    const collectionRate = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : 0;

    return {
      totalExpected,
      totalCollected,
      pending,
      collectionRate,
      paidTenants: monthRecords.length,
      pendingTenants: tenants.length - monthRecords.length
    };
  };

  const generateTenantReport = () => {
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const inactiveTenants = tenants.filter(t => t.status === 'inactive').length;
    
    // Average rent
    const totalRent = tenants.reduce((sum, tenant) => sum + (parseFloat(tenant.rentAmount) || 0), 0);
    const averageRent = tenants.length > 0 ? totalRent / tenants.length : 0;

    return {
      totalTenants: tenants.length,
      activeTenants,
      inactiveTenants,
      averageRent: averageRent.toFixed(0)
    };
  };

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRentReport = () => {
    const currentMonth = filters.month;
    const monthRecords = rentRecords.filter(record => record.month === currentMonth);
    
    const reportData = monthRecords.map(record => ({
      'Tenant Name': record.tenantName,
      'Apartment': record.apartmentNumber,
      'Amount': `₹${record.amount}`,
      'Payment Date': record.paymentDate ? format(new Date(record.paymentDate), 'dd/MM/yyyy') : 'N/A',
      'Payment Method': record.paymentMethod,
      'Status': record.isPaid ? 'Paid' : 'Pending'
    }));

    exportToCSV(reportData, `rent_report_${currentMonth}.csv`);
  };

  const handleExportOccupancyReport = () => {
    const occupancyData = apartments.map(apartment => ({
      'Apartment Number': apartment.apartmentNumber,
      'Type': apartment.type,
      'Floor': apartment.floor,
      'Status': apartment.status,
      'Monthly Rent': `₹${apartment.rentAmount}`,
      'Bedrooms': apartment.bedrooms,
      'Bathrooms': apartment.bathrooms,
      'Square Feet': apartment.squareFeet
    }));

    exportToCSV(occupancyData, 'occupancy_report.csv');
  };

  if (loading) {
    return <LinearProgress />;
  }

  const occupancyReport = generateOccupancyReport();
  const rentReport = generateRentCollectionReport();
  const tenantReport = generateTenantReport();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Month"
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              size="small"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthValue = format(date, 'yyyy-MM');
                const monthLabel = format(date, 'MMMM yyyy');
                return (
                  <MenuItem key={monthValue} value={monthValue}>
                    {monthLabel}
                  </MenuItem>
                );
              })}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              size="small"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="paid">Paid Only</MenuItem>
              <MenuItem value="pending">Pending Only</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportRentReport}
              sx={{ mr: 1 }}
            >
              Export Rent Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportOccupancyReport}
            >
              Export Occupancy Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Occupancy Rate
              </Typography>
              <Typography variant="h4">
                {occupancyReport.occupancyRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {occupancyReport.occupied} of {occupancyReport.totalApartments} occupied
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rent Collection
              </Typography>
              <Typography variant="h4">
                {rentReport.collectionRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ₹{rentReport.totalCollected.toLocaleString()} of ₹{rentReport.totalExpected.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tenants
              </Typography>
              <Typography variant="h4">
                {tenantReport.activeTenants}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {tenantReport.totalTenants} total tenants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg. Rent
              </Typography>
              <Typography variant="h4">
                ₹{tenantReport.averageRent}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Per apartment
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Rent Collection Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Rent Collection Details - {format(new Date(filters.month + '-01'), 'MMMM yyyy')}
              </Typography>
              <IconButton onClick={handleExportRentReport}>
                <DownloadIcon />
              </IconButton>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Tenant</TableCell>
                    <TableCell>Apartment</TableCell>
                    <TableCell>Rent Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenants.map((tenant) => {
                    const payment = rentRecords.find(
                      record => record.tenantId === tenant.id && record.month === filters.month
                    );
                    
                    return (
                      <TableRow key={tenant.id}>
                        <TableCell>{tenant.name}</TableCell>
                        <TableCell>#{tenant.apartmentNumber}</TableCell>
                        <TableCell>₹{tenant.rentAmount}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              color: payment ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}
                          >
                            {payment ? 'Paid' : 'Pending'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {payment?.paymentDate 
                            ? format(new Date(payment.paymentDate), 'dd/MM/yyyy')
                            : '—'
                          }
                        </TableCell>
                        <TableCell>{payment?.paymentMethod || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Occupancy Status
              </Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  Occupied: <strong>{occupancyReport.occupied}</strong>
                </Typography>
                <Typography variant="body2">
                  Vacant: <strong>{occupancyReport.vacant}</strong>
                </Typography>
                <Typography variant="body2">
                  Under Maintenance: <strong>{occupancyReport.maintenance}</strong>
                </Typography>
              </Box>
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle2" color="textSecondary">
                Financial Summary
              </Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  Expected: <strong>₹{rentReport.totalExpected.toLocaleString()}</strong>
                </Typography>
                <Typography variant="body2">
                  Collected: <strong>₹{rentReport.totalCollected.toLocaleString()}</strong>
                </Typography>
                <Typography variant="body2">
                  Pending: <strong>₹{rentReport.pending.toLocaleString()}</strong>
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Tenant Status
              </Typography>
              <Box mt={1}>
                <Typography variant="body2">
                  Total Tenants: <strong>{tenantReport.totalTenants}</strong>
                </Typography>
                <Typography variant="body2">
                  Active: <strong>{tenantReport.activeTenants}</strong>
                </Typography>
                <Typography variant="body2">
                  Inactive: <strong>{tenantReport.inactiveTenants}</strong>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;