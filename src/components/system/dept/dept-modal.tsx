'use client';

import React, { useEffect } from 'react';
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

import { DictDataOption } from '@/stores/dict-store';
import { addDept, updateDept } from '@/api/system/dept';
import { DeptVO } from '@/api/system/dept/types';

const schema = zod.object({
  deptName: zod.string().min(1, { message: '请输入部门名称' }),
  deptCategory: zod.string().optional(),
  orderNum: zod.coerce.number().min(0, { message: '请输入排序' }),
  leader: zod.string().optional(),
  phone: zod.string().optional(),
  email: zod.string().email({ message: '邮箱格式不正确' }).optional().or(zod.literal('')),
  status: zod.string(),
});

type FormValues = zod.infer<typeof schema> & { deptId?: string | number };

const defaultValues: FormValues = {
  deptName: '',
  deptCategory: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0',
};

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: DeptVO | null;
  title: string;
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}

export default function DeptModal({ open, onClose, refreshList, editData, title, dictData }: Props) {
  const { sys_normal_disable } = dictData;

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
      setValue('deptId', editData.deptId);
      setValue('deptName', editData.deptName || '');
      setValue('deptCategory', editData.deptCategory || '');
      setValue('orderNum', Number(editData.orderNum) || 0);
      setValue('leader', editData.leader || '');
      setValue('phone', editData.phone || '');
      setValue('email', editData.email || '');
      setValue('status', editData.status || '0');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, setValue, reset]);

  const doSubmit = async (formData: FormValues) => {
    const payload: any = { ...formData };
    if (editData && editData.deptId) {
      payload.deptId = editData.deptId;
      await updateDept(payload);
    } else {
      await addDept(payload);
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
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {/* 上级部门(可后续接入树选择) - 现阶段不做强校验 */}
            <Controller
              control={control}
              name="deptName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.deptName)} required>
                  <InputLabel>部门名称</InputLabel>
                  <OutlinedInput {...field} label="部门名称" type="text" />
                  {errors.deptName ? <FormHelperText>{errors.deptName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="deptCategory"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>类别编码</InputLabel>
                  <OutlinedInput {...field} label="类别编码" type="text" />
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="orderNum"
              render={({ field }) => (
                <FormControl error={Boolean(errors.orderNum)} required>
                  <InputLabel>显示排序</InputLabel>
                  <OutlinedInput {...field} label="显示排序" type="number" />
                  {errors.orderNum ? <FormHelperText>{errors.orderNum.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="leader"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>负责人</InputLabel>
                  <OutlinedInput {...field} label="负责人" type="text" />
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>联系电话</InputLabel>
                  <OutlinedInput {...field} label="联系电话" type="text" />
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)}>
                  <InputLabel>邮箱</InputLabel>
                  <OutlinedInput {...field} label="邮箱" type="email" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset" sx={{ gridColumn: '1 / span 2' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    部门状态
                  </Typography>
                  <RadioGroup row {...field}>
                    {sys_normal_disable.map((option) => (
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
