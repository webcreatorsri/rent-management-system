import React, { useState } from 'react';
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
  Select,
  Chip,
  Box
} from '@mui-material';

const PropertyForm = ({ open, onClose, onSubmit, initialData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    apartmentNumber: '',
    type: '',
    floor: '',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    rentAmount: '',
    status: 'vacant',
    amenities: [],
    description: '',
    ...initialData
  });

  const [amenityInput, setAmenityInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Apartment' : 'Add New Apartment'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apartment Number"
                name="apartmentNumber"
                value={formData.apartmentNumber}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  required
                >
                  <MenuItem value="studio">Studio</MenuItem>
                  <MenuItem value="1bhk">1 BHK</MenuItem>
                  <MenuItem value="2bhk">2 BHK</MenuItem>
                  <MenuItem value="3bhk">3 BHK</MenuItem>
                  <MenuItem value="penthouse">Penthouse</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Floor"
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Square Feet"
                type="number"
                name="squareFeet"
                value={formData.squareFeet}
                onChange={handleChange}
                margin="normal"
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  required
                >
                  <MenuItem value="vacant">Vacant</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                  <MenuItem value="under_maintenance">Under Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Box mb={1}>
                <Typography variant="subtitle2">Amenities</Typography>
              </Box>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  fullWidth
                  size="small"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  placeholder="Add amenity and press Enter"
                />
                <Button 
                  onClick={handleAddAmenity} 
                  sx={{ ml: 1 }}
                  variant="outlined"
                >
                  Add
                </Button>
              </Box>
              <Box>
                {formData.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    label={amenity}
                    onDelete={() => handleRemoveAmenity(amenity)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Add Apartment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PropertyForm;