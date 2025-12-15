import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { getApartments } from '../../services/firebaseServices';

const TenantForm = ({ open, onClose, onSubmit, initialData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    apartmentId: '',
    apartmentNumber: '',
    rentAmount: '',
    moveInDate: '',
    emergencyContact: '',
    status: 'active',
    ...initialData
  });

  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    const result = await getApartments();
    if (result.success) {
      setApartments(result.data);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'apartmentId') {
      const selectedApartment = apartments.find(apt => apt.id === value);
      setFormData(prev => ({
        ...prev,
        apartmentId: value,
        apartmentNumber: selectedApartment?.apartmentNumber || '',
        rentAmount: selectedApartment?.rentAmount || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Apartment</InputLabel>
                <Select
                  name="apartmentId"
                  value={formData.apartmentId}
                  onChange={handleChange}
                  label="Apartment"
                  required
                >
                  <MenuItem value="">Select Apartment</MenuItem>
                  {apartments
                    .filter(apt => apt.status === 'vacant' || apt.id === formData.apartmentId)
                    .map(apartment => (
                      <MenuItem key={apartment.id} value={apartment.id}>
                        #{apartment.apartmentNumber} - {apartment.type} (₹{apartment.rentAmount})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apartment Number"
                name="apartmentNumber"
                value={formData.apartmentNumber}
                onChange={handleChange}
                margin="normal"
                required
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Monthly Rent"
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Move-in Date"
                type="date"
                name="moveInDate"
                value={formData.moveInDate}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {isEdit ? 'Update' : 'Add Tenant'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TenantForm;