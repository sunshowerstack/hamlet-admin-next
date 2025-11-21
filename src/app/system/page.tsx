import * as React from 'react';
import Grid from '@mui/material/Grid';
import { Typography } from '@mui/material';

export default function Page(): React.JSX.Element {
  return (
    <Grid container spacing={3}>
      <Typography color="text.primary" variant="overline">
        首页区域...
      </Typography>
    </Grid>
  );
}
