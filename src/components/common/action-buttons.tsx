'use client';

import React from 'react';
import { Button } from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { Box, Grid } from '@mui/system';

interface Props {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  selectedCount?: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function ActionButtons({
  onAdd,
  onEdit,
  onDelete,
  selectedCount = 0,
  disabled = false,
  children,
}: Props) {
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid size={{ xs: 12, sm: 12, md: 12, lg: 9 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {onAdd && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add fontSize="small" />}
              onClick={onAdd}
              disabled={disabled}
            >
              新增
            </Button>
          )}
          {onEdit && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Edit fontSize="small" />}
              onClick={onEdit}
              disabled={disabled || selectedCount !== 1}
            >
              修改
            </Button>
          )}
          {onDelete && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Delete fontSize="small" />}
              onClick={onDelete}
              disabled={disabled || selectedCount === 0}
            >
              删除
            </Button>
          )}
          {children}
        </Box>
      </Grid>
    </Grid>
  );
}
