import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Alert
} from '@mui/material';
import {
  People as PeopleIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  EventAvailable as EventIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getTenants, getApartments, getRentRecords, testFirestoreConnection } from '../services/firebaseServices';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalApartments: 0,
    occupiedApartments: 0,
    rentCollected: 0,
    pendingRent: 0
  });
  const [recentRent, setRecentRent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [tenantsRes, apartmentsRes, rentRes] = await Promise.all([
        getTenants(),
        getApartments(),
        getRentRecords()
      ]);

      console.log('Dashboard data:', { tenantsRes, apartmentsRes, rentRes });

      const tenants = tenantsRes.success ? tenantsRes.data : [];
      const apartments = apartmentsRes.success ? apartmentsRes.data : [];
      const rentRecords = rentRes.success ? rentRes.data : [];

      const occupied = apartments.filter(apt => apt.status === 'occupied').length;
      const totalRent = rentRecords.reduce((sum, record) => sum + (parseFloat(record.amount) || 0), 0);

      setStats({
        totalTenants: tenants.length,
        totalApartments: apartments.length,
        occupiedApartments: occupied,
        rentCollected: totalRent,
        pendingRent: 0
      });

      setRecentRent(rentRecords.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const result = await testFirestoreConnection();
    setTestResult(result);
    setTesting(false);
    
    // Refresh data after test
    if (result.success) {
      fetchDashboardData();
    }
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>
      
      {testResult && (
        <Alert 
          severity={testResult.success ? "success" : "error"} 
          sx={{ mb: 2 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.success ? 'Firestore connection successful!' : testResult.error}
          {testResult.results && (
            <Box component="div" sx={{ mt: 1, fontSize: '0.875rem' }}>
              {Object.entries(testResult.results).map(([collection, result]) => (
                <div key={collection}>{collection}: {result}</div>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleTestConnection}
          disabled={testing}
          sx={{ mr: 2 }}
        >
          {testing ? 'Testing...' : 'Test Firestore Connection'}
        </Button>
        <Button
          variant="outlined"
          onClick={() => console.log('Stats:', stats)}
        >
          Debug Stats
        </Button>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon color="primary" />}
            title="Total Tenants"
            value={stats.totalTenants}
            subtitle="Active tenants"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HomeIcon color="secondary" />}
            title="Apartments"
            value={stats.totalApartments}
            subtitle={`${stats.occupiedApartments} occupied`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<MoneyIcon color="success" />}
            title="Rent Collected"
            value={`₹${stats.rentCollected.toLocaleString()}`}
            subtitle="This month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventIcon color="warning" />}
            title="Pending Rent"
            value={`₹${stats.pendingRent.toLocaleString()}`}
            subtitle="Due this month"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Rent Payments
            </Typography>
            {recentRent.length > 0 ? (
              recentRent.map((record) => (
                <Box key={record.id} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body1">
                    <strong>{record.tenantName}</strong> paid ₹{record.amount} for {record.month}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {record.paymentDate && format(new Date(record.paymentDate), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="textSecondary">No recent payments</Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Add new tenant, apartment, or record rent payment from their respective sections.
            </Typography>
            <Button
              variant="contained"
              onClick={fetchDashboardData}
              size="small"
              sx={{ mr: 1 }}
            >
              Refresh Data
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;