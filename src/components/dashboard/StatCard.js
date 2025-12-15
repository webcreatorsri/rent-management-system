import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

const StatCard = ({ icon, title, value, subtitle, color = 'primary' }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            color: `${color}.main`,
            mr: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            {icon}
          </Box>
          <Typography variant="h6" color="textSecondary">
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
};

export default StatCard;