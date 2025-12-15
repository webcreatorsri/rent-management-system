import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActiveIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'manager',
    phone: ''
  });

  // Mock data - in real app, fetch from Firestore
  useEffect(() => {
    const mockUsers = [
      {
        id: '1',
        name: 'System Administrator',
        email: 'admin@rent.com',
        role: 'admin',
        phone: '+919876543210',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00'
      },
      {
        id: '2',
        name: 'Property Manager',
        email: 'manager@rent.com',
        role: 'manager',
        phone: '+919876543211',
        status: 'active',
        lastLogin: '2024-01-14T14:20:00'
      }
    ];
    
    setUsers(mockUsers);
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app, save to Firestore
    setOpenDialog(false);
  };

  const handleDelete = (userId) => {
    // In real app, delete from Firestore
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleToggleStatus = (userId) => {
    // In real app, update in Firestore
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to access this page.
        </Alert>
      </Box>
    );
  }

  if (loading) return <LinearProgress />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">User Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add User
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Chip 
                    icon={user.status === 'active' ? <ActiveIcon /> : <BlockIcon />}
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.lastLogin).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color={user.status === 'active' ? 'warning' : 'success'}
                    onClick={() => handleToggleStatus(user.id)}
                  >
                    {user.status === 'active' ? <BlockIcon /> : <ActiveIcon />}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              margin="normal"
              required
            >
              <MenuItem value="admin">Administrator</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement;