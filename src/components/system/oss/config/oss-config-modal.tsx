'use client';

import React, { useEffect, useState } from 'react';
import { addOssConfig, updateOssConfig } from '@/api/system/ossConfig';
import { zodResolver } from '@hookform/resolvers/zod';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
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
  InputAdornment,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { OssConfigForm, OssConfigVO } from '@/api/system/ossConfig/types';

// ------ zod定义区域 start -------
const ossConfigSchema = zod.object({
  ossConfigId: zod.string().optional(),
  configKey: zod.string().min(1, { message: '请输入配置key' }),
  endpoint: zod.string().min(1, { message: '请输入访问站点' }),
  domain: zod.string().optional(),
  accessKey: zod.string().min(1, { message: '请输入accessKey' }),
  secretKey: zod.string().min(1, { message: '请输入秘钥' }),
  bucketName: zod.string().min(1, { message: '请输入桶名称' }),
  prefix: zod.string().optional(),
  region: zod.string().optional(),
  isHttps: zod.string().optional(),
  accessPolicy: zod.string().optional(),
  remark: zod.string().optional(),
  status: zod.string().optional(),
});

type OssConfigValues = zod.infer<typeof ossConfigSchema>;

const defaultValues = {
  ossConfigId: undefined,
  configKey: '',
  endpoint: '',
  domain: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  prefix: '',
  region: '',
  isHttps: '0',
  accessPolicy: 'public',
  remark: '',
  status: '0',
} satisfies OssConfigValues;
// ------ zod定义区域 end -------

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: OssConfigVO | null;
  title: string;
}

export default function OssConfigModal({ open, onClose, refreshList, editData, title }: Props) {
  console.log('[OssConfigModal] start...');
  const [showSecretKey, setShowSecretKey] = useState(false);

  // 利用RHF的 useForm
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<OssConfigValues>({
    defaultValues,
    resolver: zodResolver(ossConfigSchema),
  });

  useEffect(() => {
    if (editData) {
      setValue('ossConfigId', editData.ossConfigId + '');
      setValue('configKey', editData.configKey || '');
      setValue('endpoint', editData.endpoint || '');
      setValue('domain', editData.domain || '');
      setValue('accessKey', editData.accessKey || '');
      setValue('secretKey', editData.secretKey || '');
      setValue('bucketName', editData.bucketName || '');
      setValue('prefix', editData.prefix || '');
      setValue('region', editData.region || '');
      setValue('isHttps', editData.isHttps || '0');
      setValue('accessPolicy', editData.accessPolicy || 'public');
      setValue('remark', editData.remark || '');
      setValue('status', editData.status || '0');
    } else {
      reset(defaultValues);
    }
    // 重置密码显示状态
    setShowSecretKey(false);
  }, [editData, open, setValue, reset]);

  const doSubmit = async (formData: OssConfigValues) => {
    // 结构成api接口的参数
    const submitForm = { ...formData } as OssConfigForm;
    // 新增提交 或 修改提交
    const res = editData ? await updateOssConfig(submitForm) : await addOssConfig(submitForm);
    console.log('[OssConfigModal] doSubmit res:', res);

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
            {/* 配置key */}
            <Controller
              control={control}
              name="configKey"
              render={({ field }) => (
                <FormControl error={Boolean(errors.configKey)} required>
                  <InputLabel>配置key</InputLabel>
                  <OutlinedInput {...field} label="配置key" type="text" placeholder="请输入配置key" />
                  {errors.configKey ? <FormHelperText>{errors.configKey.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 访问站点 */}
            <Controller
              control={control}
              name="endpoint"
              render={({ field }) => (
                <FormControl error={Boolean(errors.endpoint)} required>
                  <InputLabel>访问站点</InputLabel>
                  <OutlinedInput {...field} label="访问站点" type="text" placeholder="请输入访问站点" />
                  {errors.endpoint ? <FormHelperText>{errors.endpoint.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 自定义域名 */}
            <Controller
              control={control}
              name="domain"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>自定义域名</InputLabel>
                  <OutlinedInput {...field} label="自定义域名" type="text" placeholder="请输入自定义域名" />
                </FormControl>
              )}
            />

            {/* accessKey */}
            <Controller
              control={control}
              name="accessKey"
              render={({ field }) => (
                <FormControl error={Boolean(errors.accessKey)} required>
                  <InputLabel>accessKey</InputLabel>
                  <OutlinedInput {...field} label="accessKey" type="text" placeholder="请输入accessKey" />
                  {errors.accessKey ? <FormHelperText>{errors.accessKey.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* secretKey */}
            <Controller
              control={control}
              name="secretKey"
              render={({ field }) => (
                <FormControl error={Boolean(errors.secretKey)} required>
                  <InputLabel>secretKey</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="secretKey"
                    type={showSecretKey ? 'text' : 'password'}
                    placeholder="请输入秘钥"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          edge="end"
                        >
                          {showSecretKey ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  {errors.secretKey ? <FormHelperText>{errors.secretKey.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 桶名称 */}
            <Controller
              control={control}
              name="bucketName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.bucketName)} required>
                  <InputLabel>桶名称</InputLabel>
                  <OutlinedInput {...field} label="桶名称" type="text" placeholder="请输入桶名称" />
                  {errors.bucketName ? <FormHelperText>{errors.bucketName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 前缀 */}
            <Controller
              control={control}
              name="prefix"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>前缀</InputLabel>
                  <OutlinedInput {...field} label="前缀" type="text" placeholder="请输入前缀" />
                </FormControl>
              )}
            />

            {/* 是否HTTPS */}
            <Controller
              name="isHttps"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    是否HTTPS
                  </Typography>
                  {/* 横方向配置 */}
                  <RadioGroup row {...field}>
                    <FormControlLabel value="1" control={<Radio />} label="是" />
                    <FormControlLabel value="0" control={<Radio />} label="否" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            {/* 桶权限类型 */}
            <Controller
              name="accessPolicy"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    桶权限类型
                  </Typography>
                  {/* 横方向配置 */}
                  <RadioGroup row {...field}>
                    <FormControlLabel value="0" control={<Radio />} label="private" />
                    <FormControlLabel value="1" control={<Radio />} label="public" />
                    <FormControlLabel value="2" control={<Radio />} label="custom" />
                  </RadioGroup>
                </FormControl>
              )}
            />

            {/* 域 */}
            <Controller
              control={control}
              name="region"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>域</InputLabel>
                  <OutlinedInput {...field} label="域" type="text" placeholder="请输入域" />
                </FormControl>
              )}
            />

            {/* 备注 */}
            <Controller
              name="remark"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    备注
                  </Typography>
                  <TextField {...field} multiline rows={4} placeholder="请输入内容" fullWidth variant="outlined" />
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
