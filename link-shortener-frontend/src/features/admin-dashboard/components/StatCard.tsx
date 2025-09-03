import { Card, CardContent, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom>{title}</Typography>
          <Typography variant="h4" component="div">{value.toLocaleString('fa-IR')}</Typography>
        </Box>
        <Box sx={{ fontSize: '4rem', opacity: 0.3 }}>
            {icon}
        </Box>
      </CardContent>
    </Card>
  );
}