'use client';

import React, { useEffect } from 'react';
import { addType, updateType } from '@/api/system/dict/type';
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
  IconButton,
  InputLabel,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { DictTypeVO } from '@/api/system/dict/type/types';

const schema = zod.object({
  dictName: zod.string().min(1, { message: '请输入字典名称' }),
  dictType: zod.string().min(1, { message: '请输入字典类型' }),
  remark: zod.string().optional().or(zod.literal('')),
  dictId: zod.string().optional().or(zod.literal('')).or(zod.number()),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues: FormValues = {
  dictName: '',
  dictType: '',
  remark: '',
  dictId: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: DictTypeVO | null;
  title: string;
}

export default function DictModal({ open, onClose, refreshList, editData, title }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (editData) {
      setValue('dictId', editData.dictId as any);
      setValue('dictName', editData.dictName || '');
      setValue('dictType', editData.dictType || '');
      setValue('remark', editData.remark || '');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, reset, setValue]);

  const doSubmit = async (formData: FormValues) => {
    const payload = { ...formData } as any;
    if (editData) {
      await updateType(payload);
    } else {
      await addType(payload);
    }
    refreshList();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>{title}</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(doSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              control={control}
              name="dictName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.dictName)} required>
                  <InputLabel>字典名称</InputLabel>
                  <OutlinedInput {...field} label="字典名称" type="text" placeholder="请输入字典名称" />
                  {errors.dictName ? <FormHelperText>{errors.dictName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="dictType"
              render={({ field }) => (
                <FormControl error={Boolean(errors.dictType)} required>
                  <InputLabel>字典类型</InputLabel>
                  <OutlinedInput {...field} label="字典类型" type="text" placeholder="请输入字典类型" />
                  {errors.dictType ? <FormHelperText>{errors.dictType.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="remark"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>备注</InputLabel>
                  <OutlinedInput {...field} label="备注" type="text" multiline minRows={2} placeholder="请输入内容" />
                </FormControl>
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
