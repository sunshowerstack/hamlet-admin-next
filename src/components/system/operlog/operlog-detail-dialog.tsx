'use client';

import React from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid } from '@mui/material';
import { OperLogVO } from '@/api/monitor/operlog/types';

interface Props {
  open: boolean;
  onClose: () => void;
  data?: OperLogVO | null;
}

export default function OperlogDetailDialog({ open, onClose, data }: Props) {
  const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Typography sx={{ color: 'text.secondary', minWidth: 88 }}>{label}：</Typography>
      <Typography sx={{ wordBreak: 'break-all' }}>{value ?? ''}</Typography>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>操作日志详情</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Field
              label="登录信息"
              value={`${data?.operName} / ${data?.deptName} / ${data?.operIp} / ${data?.operLocation}`}
            />
            <Field label="请求信息" value={data?.requestMethod} />
            <Field label="操作模块" value={`${data?.title}`} />
            <Field label="操作方法" value={data?.method} />
            <Field label="请求参数" value={data?.operParam} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Field label="返回参数" value={data?.jsonResult} />
            <Field label="操作状态" value={data?.status === 0 ? '正常' : '异常'} />
            <Field label="消耗时间" value={`${data?.costTime}毫秒`} />
            <Field label="操作时间" value={data?.operTime} />
            <Field label="请求地址" value={data?.operUrl} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
}
