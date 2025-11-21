'use client';

import React, { useEffect } from 'react';
import { addData, updateData } from '@/api/system/dict/data';

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
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { DictDataVO } from '@/api/system/dict/data/types';
const schema = zod.object({
  dictCode: zod.string(), // 主键id
  dictType: zod.string().min(1, { message: '请输入字典类型' }),
  dictLabel: zod.string().min(1, { message: '请输入数据标签' }),
  dictValue: zod.string().min(1, { message: '请输入数据键值' }),
  dictSort: zod.number().min(1, { message: '请输入显示排序' }),
  cssClass: zod.string(),
  listClass: zod.string(),
  remark: zod.string().optional().or(zod.literal('')),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues: FormValues = {
  dictCode: '',
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  cssClass: '',
  listClass: '',
  remark: '',
};

// 数据标签回显样式
const listClassOptions: Array<{ value: string; label: string }> = [
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' },
];

interface Props {
  selectedType: string;
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: DictDataVO | null;
  title: string;
}

export default function DictDataModal({ selectedType, open, onClose, refreshList, editData, title }: Props) {
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
      setValue('dictCode', editData.dictCode || '');
      setValue('dictType', editData.dictType || '');
      setValue('dictLabel', editData.dictLabel || '');
      setValue('dictValue', editData.dictValue || '');
      setValue('dictSort', editData.dictSort);
      setValue('cssClass', editData.cssClass);
      setValue('listClass', editData.listClass);
      setValue('remark', editData.remark || '');
    } else {
      reset(defaultValues);
      setValue('dictType', selectedType);
    }
  }, [editData, open, reset, setValue, selectedType]);

  const doSubmit = async (formData: FormValues) => {
    const payload = { ...formData } as any;
    if (editData) {
      await updateData(payload);
    } else {
      await addData(payload);
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
              name="dictType"
              render={({ field }) => (
                <FormControl error={Boolean(errors.dictType)} required disabled>
                  <InputLabel>字典类型</InputLabel>
                  <OutlinedInput {...field} label="字典类型" type="text" placeholder="请输入字典类型" />
                  {errors.dictType ? <FormHelperText>{errors.dictType.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="dictLabel"
              render={({ field }) => (
                <FormControl error={Boolean(errors.dictLabel)} required>
                  <InputLabel>数据标签</InputLabel>
                  <OutlinedInput {...field} label="数据标签" type="text" placeholder="请输入数据标签" />
                  {errors.dictLabel ? <FormHelperText>{errors.dictLabel.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="dictValue"
              render={({ field }) => (
                <FormControl error={Boolean(errors.dictValue)} required>
                  <InputLabel>数据键值</InputLabel>
                  <OutlinedInput {...field} label="数据键值" type="text" placeholder="请输入数据键值" />
                  {errors.dictValue ? <FormHelperText>{errors.dictValue.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="cssClass"
              render={({ field }) => (
                <FormControl error={Boolean(errors.cssClass)} required>
                  <InputLabel>样式属性</InputLabel>
                  <OutlinedInput {...field} label="样式属性" type="text" placeholder="请输入样式属性" />
                  {errors.cssClass ? <FormHelperText>{errors.cssClass.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              control={control}
              name="dictSort"
              render={({ field }) => (
                <FormControl error={Boolean(errors.dictSort)} required>
                  <InputLabel>显示排序</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="显示排序"
                    type="number" // 输入的值type设置为number，输入框右侧会出现增减箭头
                    size="small"
                    placeholder="请输入显示排序"
                    inputProps={{
                      min: 0, // 控制最小输入值为0
                    }}
                    // 将输入值转换为数字
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {errors.dictSort ? <FormHelperText>{errors.dictSort.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              name="listClass"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.listClass}>
                  <InputLabel size="small">回显样式</InputLabel>
                  <Select {...field} label="回显样式" size="small">
                    {listClassOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label + '(' + option.value + ')'}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.listClass && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.listClass.message}
                    </Typography>
                  )}
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
