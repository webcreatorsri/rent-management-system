import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Paper,
  Box,
  Chip,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { getRentRecords } from '../../services/firebaseServices';
import { format } from 'date-fns';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

const TenantDetails = ({ open, onClose, tenant }) => {
  const [rentHistory, setRentHistory] = useState([]);

  useEffect(() => {
    if (tenant) {
      fetchRentHistory();
    }
  }, [tenant]);

  const fetchRentHistory = async () => {
    const result = await getRentRecords();
    if (result.success) {
      const tenantRent = result.data.filter(
        record => record.tenantId === tenant.id
      );
      setRentHistory(tenantRent);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Tenant Details - {tenant.name}
        <Chip
          label={tenant.status}
          color={getStatusColor(tenant.status)}
          size="small"
          sx={{ ml: 2 }}
        />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{tenant.name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{tenant.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{tenant.phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Emergency Contact</Typography>
                  <Typography variant="body1">{tenant.emergencyContact || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Rental Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Apartment</Typography>
                  <Typography variant="body1">#{tenant.apartmentNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Monthly Rent</Typography>
                  <Typography variant="body1">₹{tenant.rentAmount}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Move-in Date</Typography>
                  <Typography variant="body1">
                    {tenant.moveInDate ? format(new Date(tenant.moveInDate), 'dd/MM/yyyy') : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Tenure</Typography>
                  <Typography variant="body1">
                    {tenant.moveInDate ? 
                      `${Math.floor((new Date() - new Date(tenant.moveInDate)) / (1000 * 60 * 60 * 24 * 30))} months` 
                      : 'N/A'
                    }
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Rent Payment History</Typography>
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                onClick={() => {/* Add record payment function */}}
              >
                Record Payment
              </Button>
            </Box>
            
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rentHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {record.paymentDate ? format(new Date(record.paymentDate), 'dd/MM/yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {record.month ? format(new Date(record.month + '-01'), 'MMM yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>₹{record.amount}</TableCell>
                      <TableCell>{record.paymentMethod}</TableCell>
                      <TableCell>
                        <Chip
                          label="Paid"
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.notes || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {rentHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No payment records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TenantDetails;