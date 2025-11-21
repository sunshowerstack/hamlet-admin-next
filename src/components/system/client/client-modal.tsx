'use client';

import React, { useEffect } from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
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
import OutlinedInput from '@mui/material/OutlinedInput';
import FormHelperText from '@mui/material/FormHelperText';

import type { ClientVO, ClientForm } from '@/api/system/client/types';
import { addClient, updateClient } from '@/api/system/client';
import { DictDataOption } from '@/stores/dict-store';

const schema = zod
  .object({
    clientKey: zod.string().min(1, { message: '请输入客户端key' }),
    clientSecret: zod.string().min(1, { message: '请输入客户端秘钥' }),
    grantTypeList: zod.array(zod.string()).min(1, { message: '请选择授权类型' }),
    deviceType: zod.string().min(1, { message: '请选择设备类型' }),
    activeTimeout: zod.coerce.number().optional(),
    timeout: zod.coerce.number().optional(),
    status: zod.string().default('0'),
  })
  .extend({
    id: zod.union([zod.string(), zod.number()]).optional(),
    clientId: zod.union([zod.string(), zod.number()]).optional(),
  });

type Values = zod.input<typeof schema>;

const defaultValues: Values = {
  clientKey: '',
  clientSecret: '',
  grantTypeList: [],
  deviceType: '',
  activeTimeout: undefined,
  timeout: undefined,
  status: '0',
};

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: ClientVO | null;
  title: string;
  dictData: {
    sys_normal_disable: DictDataOption[];
    sys_device_type: DictDataOption[];
  };
}

export default function ClientModal({ open, onClose, refreshList, editData, title, dictData }: Props) {
  const { sys_normal_disable, sys_device_type } = dictData;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (editData) {
      setValue('id', editData.id);
      setValue('clientId', editData.clientId);
      setValue('clientKey', editData.clientKey || '');
      setValue('clientSecret', editData.clientSecret || '');
      setValue('grantTypeList', editData.grantTypeList || []);
      setValue('deviceType', editData.deviceType || '');
      setValue('activeTimeout', editData.activeTimeout as any);
      setValue('timeout', editData.timeout as any);
      setValue('status', editData.status || '0');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, reset, setValue]);

  const doSubmit = async (data: Values) => {
    const payload: ClientForm = { ...data } as any;
    if (editData) await updateClient(payload);
    else await addClient(payload);
    refreshList();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>{title}</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (t) => t.palette.grey[500] }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(doSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="clientKey"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.clientKey} required>
                  <InputLabel>客户端key</InputLabel>
                  <OutlinedInput {...field} label="客户端key" />
                  {errors.clientKey && <FormHelperText>{errors.clientKey.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="clientSecret"
              control={control}
              render={({ field }) => (
                <FormControl error={!!errors.clientSecret} required>
                  <InputLabel>客户端秘钥</InputLabel>
                  <OutlinedInput {...field} label="客户端秘钥" />
                  {errors.clientSecret && <FormHelperText>{errors.clientSecret.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="grantTypeList"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.grantTypeList} required>
                  <InputLabel>授权类型</InputLabel>
                  <Select {...field} multiple label="授权类型">
                    <MenuItem value="password">密码认证</MenuItem>
                    <MenuItem value="sms">短信认证</MenuItem>
                    <MenuItem value="app">小程序认证</MenuItem>
                    <MenuItem value="social">三方登录认证</MenuItem>
                  </Select>
                  {errors.grantTypeList && <FormHelperText>{errors.grantTypeList.message as string}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="deviceType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.deviceType} required>
                  <InputLabel>设备类型</InputLabel>
                  <Select {...field} label="设备类型">
                    {sys_device_type.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.deviceType && <FormHelperText>{errors.deviceType.message}</FormHelperText>}
                </FormControl>
              )}
            />

            <Controller
              name="activeTimeout"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Token活跃超时时间" type="number" size="small" fullWidth />
              )}
            />
            <Controller
              name="timeout"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Token固定超时时间" type="number" size="small" fullWidth />
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    状态
                  </Typography>
                  <RadioGroup row {...field}>
                    {sys_normal_disable.map((opt) => (
                      <FormControlLabel key={opt.value} control={<Radio />} value={opt.value} label={opt.label} />
                    ))}
                  </RadioGroup>
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
