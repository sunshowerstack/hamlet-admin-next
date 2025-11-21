'use client';

import React, { useEffect, useState } from 'react';
import { addNotice, updateNotice } from '@/api/system/notice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { DictDataOption } from '@/stores/dict-store';

import { NoticeVO } from '@/api/system/notice/types';

// ------ zod定义区域 start -------
const noticeSchema = zod.object({
  noticeTitle: zod.string().min(1, { message: '请输入公告标题' }),
  noticeType: zod.string().min(1, { message: '请选择公告类型' }),
  status: zod.string(),
  noticeContent: zod.string(),
  noticeId: zod.string(),
  createByName: zod.string(),
});

type NoticeValues = zod.infer<typeof noticeSchema>;

const defaultValues = {
  noticeTitle: '',
  noticeType: '',
  status: '0',
  noticeContent: '',
  noticeId: '',
  createByName: '',
} satisfies NoticeValues;
// ------ zod定义区域 end -------

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: NoticeVO | null;
  title: string;
  dictData: {
    sys_notice_status: DictDataOption[];
    sys_notice_type: DictDataOption[];
  };
}

export default function NoticeModal({ open, onClose, refreshList, editData, title, dictData }: Props) {
  console.log('[NoticeModal] start...');
  // 从props中获取字典数据
  const { sys_notice_status, sys_notice_type } = dictData;

  console.log('[NoticeModal] sys_notice_type:', sys_notice_type);

  // 利用RHF的 useForm
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
  } = useForm<NoticeValues>({
    defaultValues,
    resolver: zodResolver(noticeSchema),
  });

  useEffect(() => {
    if (editData) {
      setValue('noticeId', editData.noticeId + '');
      setValue('noticeTitle', editData.noticeTitle || '');
      setValue('noticeType', editData.noticeType || '');
      setValue('status', editData.status || '');
      setValue('noticeContent', editData.noticeContent || '');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, setValue, reset]);

  const doSubmit = async (formData: NoticeValues) => {
    // 新增提交 或 修改提交
    const res = editData ? await updateNotice(formData) : await addNotice(formData);
    console.log('[NoticeModal] doSubmit res:', res);

    // 刷新表格
    refreshList();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography>{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      {/* form表单定义 */}
      <form onSubmit={handleSubmit(doSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 公告标题 */}
            <Controller
              control={control}
              name="noticeTitle"
              render={({ field }) => (
                <FormControl error={Boolean(errors.noticeTitle)} required>
                  <InputLabel>公告标题</InputLabel>
                  <OutlinedInput {...field} label="noticeTitle" type="text" />
                  {errors.noticeTitle ? <FormHelperText>{errors.noticeTitle.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 公告类型 */}
            <Controller
              name="noticeType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.noticeType} required>
                  <InputLabel>公告类型</InputLabel>
                  <Select {...field} label="公告类型">
                    {sys_notice_type.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.noticeType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.noticeType.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />

            {/* 状态 */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    状态
                  </Typography>
                  {/* 横方向配置 */}
                  <RadioGroup row {...field}>
                    {sys_notice_status.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={<Radio />}
                        value={option.value}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            />

            {/* 公告内容 */}
            <Controller
              name="noticeContent"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    公告内容
                  </Typography>
                  <TextField {...field} multiline rows={8} placeholder="请输入公告内容" fullWidth variant="outlined" />
                </Box>
              )}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={onClose} variant="outlined">
            取消
          </Button>
          <Button size="small" type="submit" variant="contained">
            确定
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
