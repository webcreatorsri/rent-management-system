import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper, // Added Paper import
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  LinearProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { addRentRecord, getRentRecords, getTenants } from '../services/firebaseServices';
import { format } from 'date-fns';

const Rent = () => {
  const [rentRecords, setRentRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    tenantName: '',
    apartmentNumber: '',
    month: '',
    amount: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [rentRes, tenantsRes] = await Promise.all([
      getRentRecords(),
      getTenants()
    ]);
    
    if (rentRes.success) setRentRecords(rentRes.data);
    if (tenantsRes.success) setTenants(tenantsRes.data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Auto-fill tenant name when tenant is selected
    if (name === 'tenantId') {
      const selectedTenant = tenants.find(t => t.id === value);
      if (selectedTenant) {
        setFormData(prev => ({
          ...prev,
          tenantName: selectedTenant.name,
          apartmentNumber: selectedTenant.apartmentNumber,
          amount: selectedTenant.rentAmount || ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addRentRecord(formData);
    if (result.success) {
      setOpenDialog(false);
      setFormData({
        tenantId: '',
        tenantName: '',
        apartmentNumber: '',
        month: '',
        amount: '',
        paymentMethod: 'cash',
        notes: ''
      });
      fetchData();
    }
  };

  const getPaymentStatus = (record) => {
    const today = new Date();
    const dueDate = new Date(record.month);
    return today > dueDate ? 'Overdue' : 'Paid';
  };

  const getStatusColor = (status) => {
    return status === 'Overdue' ? 'error' : 'success';
  };

  // Generate month options for the next 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    return format(date, 'yyyy-MM');
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Rent Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Record Payment
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Apartment</TableCell>
                <TableCell>Month</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rentRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.paymentDate && format(new Date(record.paymentDate), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{record.tenantName}</TableCell>
                  <TableCell>{record.apartmentNumber}</TableCell>
                  <TableCell>
                    {record.month && format(new Date(record.month + '-01'), 'MMM yyyy')}
                  </TableCell>
                  <TableCell>₹{record.amount}</TableCell>
                  <TableCell>{record.paymentMethod}</TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentStatus(record)}
                      color={getStatusColor(getPaymentStatus(record))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Rent Payment</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Select Tenant"
              name="tenantId"
              value={formData.tenantId}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name} (Apt #{tenant.apartmentNumber})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Tenant Name"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled
            />

            <TextField
              fullWidth
              label="Apartment Number"
              name="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={handleInputChange}
              margin="normal"
              required
              disabled
            />

            <TextField
              fullWidth
              select
              label="Month"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              {monthOptions.map((month) => (
                <MenuItem key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              select
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Record Payment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Rent;