'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';

interface Props {
  nickName: string;
  phonenumber: string;
  email: string;
  sex: string;
  onChange: (next: { nickName?: string; phonenumber?: string; email?: string; sex?: string }) => void;
  onSave: () => void;
}

export function ProfileDetailForm(props: Props): React.JSX.Element {
  const { nickName, phonenumber, email, sex, onChange, onSave } = props;

  return (
    <CardContent>
      <Grid container spacing={3}>
        <Grid size={{ md: 12, xs: 12 }}>
          <TextField
            fullWidth
            label="用户昵称"
            value={nickName}
            onChange={(e) => onChange({ nickName: e.target.value })}
          />
        </Grid>
        <Grid size={{ md: 12, xs: 12 }}>
          <TextField
            fullWidth
            label="手机号码"
            value={phonenumber}
            onChange={(e) => onChange({ phonenumber: e.target.value })}
          />
        </Grid>
        <Grid size={{ md: 12, xs: 12 }}>
          <TextField fullWidth label="邮箱" value={email} onChange={(e) => onChange({ email: e.target.value })} />
        </Grid>
        <Grid size={{ md: 12, xs: 12 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            性别
          </Typography>
          <RadioGroup row value={sex ?? '0'} onChange={(e) => onChange({ sex: e.target.value })}>
            <FormControlLabel value="0" control={<Radio />} label="男" />
            <FormControlLabel value="1" control={<Radio />} label="女" />
          </RadioGroup>
        </Grid>
      </Grid>
      <Button variant="contained" sx={{ mt: 3 }} onClick={onSave}>
        保存
      </Button>
    </CardContent>
  );
}
