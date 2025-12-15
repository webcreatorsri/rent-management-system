import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper, // Added Paper import
  Grid,
  Card,
  CardContent,
  CardActions,
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
import { addApartment, getApartments } from '../services/firebaseServices';

const Apartments = () => {
  const [apartments, setApartments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    apartmentNumber: '',
    type: '',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    rentAmount: '',
    status: 'vacant',
    amenities: ''
  });

  useEffect(() => {
    fetchApartments();
  }, []);

  const fetchApartments = async () => {
    setLoading(true);
    const result = await getApartments();
    if (result.success) {
      setApartments(result.data);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addApartment(formData);
    if (result.success) {
      setOpenDialog(false);
      setFormData({
        apartmentNumber: '',
        type: '',
        floor: '',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        rentAmount: '',
        status: 'vacant',
        amenities: ''
      });
      fetchApartments();
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'occupied': return 'error';
      case 'vacant': return 'success';
      case 'under_maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Apartments Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Apartment
        </Button>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {apartments.map((apartment) => (
            <Grid item xs={12} sm={6} md={4} key={apartment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      Apartment #{apartment.apartmentNumber}
                    </Typography>
                    <Chip
                      label={apartment.status.replace('_', ' ')}
                      color={getStatusColor(apartment.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography color="textSecondary" gutterBottom>
                    {apartment.type} • Floor {apartment.floor}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2">
                      {apartment.bedrooms} Beds • {apartment.bathrooms} Baths
                    </Typography>
                    <Typography variant="body2">
                      {apartment.squareFeet} sq.ft
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    ₹{apartment.rentAmount}/month
                  </Typography>
                  
                  {apartment.amenities && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Amenities: {apartment.amenities}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small">View Details</Button>
                  <Button size="small" color="primary">Edit</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Apartment</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Apartment Number"
              name="apartmentNumber"
              value={formData.apartmentNumber}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              <MenuItem value="studio">Studio</MenuItem>
              <MenuItem value="1bhk">1 BHK</MenuItem>
              <MenuItem value="2bhk">2 BHK</MenuItem>
              <MenuItem value="3bhk">3 BHK</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Floor"
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Bedrooms"
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Bathrooms"
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Square Feet"
              type="number"
              name="squareFeet"
              value={formData.squareFeet}
              onChange={handleInputChange}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Monthly Rent"
              type="number"
              name="rentAmount"
              value={formData.rentAmount}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              <MenuItem value="vacant">Vacant</MenuItem>
              <MenuItem value="occupied">Occupied</MenuItem>
              <MenuItem value="under_maintenance">Under Maintenance</MenuItem>
            </TextField>
            
            <TextField
              fullWidth
              label="Amenities (comma separated)"
              name="amenities"
              value={formData.amenities}
              onChange={handleInputChange}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Apartment</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Apartments;