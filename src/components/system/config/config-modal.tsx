'use client';

import React, { useEffect } from 'react';
import { addConfig, updateConfig } from '@/api/system/config';
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
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { ConfigVO } from '@/api/system/config/types';

const schema = zod.object({
  configName: zod.string().min(1, { message: '请输入参数名称' }),
  configKey: zod.string().min(1, { message: '请输入参数键名' }),
  configValue: zod.string().min(1, { message: '请输入参数键值' }),
  configType: zod.string().min(1),
  remark: zod.string().optional().or(zod.literal('')),
  configId: zod.string().optional().or(zod.literal('')).or(zod.number()),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues: FormValues = {
  configName: '',
  configKey: '',
  configValue: '',
  configType: 'Y',
  remark: '',
  configId: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: ConfigVO | null;
  title: string;
  dictData: {
    sys_yes_no: DictDataOption[];
  };
}

export default function ConfigModal({ open, onClose, refreshList, editData, title, dictData }: Props) {
  // 从props中获取字典数据
  const { sys_yes_no } = dictData;

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
      setValue('configId', editData.configId as any);
      setValue('configName', editData.configName || '');
      setValue('configKey', editData.configKey || '');
      setValue('configValue', editData.configValue || '');
      setValue('configType', editData.configType || 'Y');
      setValue('remark', editData.remark || '');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, reset, setValue]);

  const doSubmit = async (formData: FormValues) => {
    const payload = { ...formData } as any;
    if (editData) {
      await updateConfig(payload);
    } else {
      await addConfig(payload);
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
              name="configName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.configName)} required>
                  <InputLabel>参数名称</InputLabel>
                  <OutlinedInput {...field} label="参数名称" type="text" />
                  {errors.configName ? <FormHelperText>{errors.configName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="configKey"
              render={({ field }) => (
                <FormControl error={Boolean(errors.configKey)} required>
                  <InputLabel>参数键名</InputLabel>
                  <OutlinedInput {...field} label="参数键名" type="text" />
                  {errors.configKey ? <FormHelperText>{errors.configKey.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="configValue"
              render={({ field }) => (
                <FormControl error={Boolean(errors.configValue)} required>
                  <InputLabel>参数键值</InputLabel>
                  <OutlinedInput {...field} label="参数键值" type="text" />
                  {errors.configValue ? <FormHelperText>{errors.configValue.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              name="configType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    系统内置
                  </Typography>
                  {/* 横方向配置 */}
                  <RadioGroup row {...field}>
                    {sys_yes_no.map((option) => (
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

            <Controller
              control={control}
              name="remark"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>备注</InputLabel>
                  <OutlinedInput {...field} label="备注" type="text" multiline minRows={2} />
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
