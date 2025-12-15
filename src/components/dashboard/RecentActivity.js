import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Paper
} from '@mui/material';
import {
  Payment as PaymentIcon,
  PersonAdd as PersonAddIcon,
  Home as HomeIcon,
  EventAvailable as EventIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'payment': return <PaymentIcon />;
      case 'tenant_added': return <PersonAddIcon />;
      case 'apartment_added': return <HomeIcon />;
      default: return <EventIcon />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'payment': return 'success.main';
      case 'tenant_added': return 'info.main';
      case 'apartment_added': return 'warning.main';
      default: return 'primary.main';
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <List>
        {activities.map((activity, index) => (
          <ListItem key={index} alignItems="flex-start">
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                {getActivityIcon(activity.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.title}
              secondary={
                <React.Fragment>
                  <Typography
                    component="span"
                    variant="body2"
                    color="textPrimary"
                  >
                    {activity.description}
                  </Typography>
                  {` — ${format(new Date(activity.timestamp), 'MMM dd, hh:mm a')}`}
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default RecentActivity;