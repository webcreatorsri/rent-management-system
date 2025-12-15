import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Assessment as ReportsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../utils/authHelpers';

const drawerWidth = 220;

const Layout = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Tenants', icon: <PeopleIcon />, path: '/tenants' },
    { text: 'Apartments', icon: <HomeIcon />, path: '/apartments' },
    { text: 'Rent Records', icon: <ReceiptIcon />, path: '/rent' },
    { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Minimal User Info */}
      <Box sx={{ 
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32, 
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}
        >
          {getUserInitials(user?.name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="body2" 
            noWrap 
            sx={{ 
              fontWeight: 'medium',
              fontSize: '0.875rem'
            }}
          >
            {user?.name || 'User'}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: '0.75rem' }}
          >
            {user?.role === 'admin' ? 'Admin' : 'Manager'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={{ p: 1, flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              borderRadius: 1,
              py: 0.75,
              px: 1.5,
              mb: 0.5,
              minHeight: 36,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 32, mr: 1.5 }}>
              {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontSize: '0.875rem',
                fontWeight: 'medium'
              }}
            />
          </ListItem>
        ))}
      </List>

      

    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          height: 56
        }}
      >
        <Toolbar sx={{ minHeight: 56 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ 
            flexGrow: 1,
            color: 'primary.main',
            fontWeight: 'bold'
          }}>
            Rent Management
          </Typography>

          

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {getUserInitials(user?.name)}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              height: '100%'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              height: '100%',
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 2,
        backgroundColor: '#f5f5f5',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <Toolbar sx={{ minHeight: 56 }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;