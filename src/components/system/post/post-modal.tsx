'use client';

import React, { useEffect, useState } from 'react';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
  OutlinedInput,
  Popover,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  Paper,
} from '@mui/material';
import { Grid } from '@mui/system';
import { Close } from '@mui/icons-material';
import { Controller, useForm } from 'react-hook-form';
import { DictDataOption } from '@/stores/dict-store';
import { DeptVO } from '@/api/system/dept/types';
import { PostForm, PostVO } from '@/api/system/post/types';
import FormHelperText from '@mui/material/FormHelperText';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

const schema = zod.object({
  postId: zod.string().optional(),
  deptId: zod.union([zod.string(), zod.number()]).refine((v) => v !== '' && v !== undefined, '请选择部门'),
  postCode: zod.string().min(1, '请输入岗位编码'),
  postName: zod.string().min(1, '请输入岗位名称'),
  postCategory: zod.string().optional(),
  postSort: zod.number().optional(),
  status: zod.string().min(1, '请选择状态'),
  remark: zod.string().optional(),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues: FormValues = {
  postId: undefined,
  deptId: '',
  postCode: '',
  postName: '',
  postCategory: '',
  postSort: 0,
  status: '0',
  remark: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: PostVO | null;
  title: string;
  deptOptions: DeptVO[];
  dictData: { sys_normal_disable: DictDataOption[] };
  onSubmit: (data: PostForm) => Promise<void>;
}

export default function PostModal({
  open,
  onClose,
  refreshList,
  editData,
  title,
  deptOptions,
  dictData,
  onSubmit,
}: Props) {
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

  // 部门选择 popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    if (editData) {
      setValue('postId', editData.postId + '');
      setValue('deptId', editData.deptId + '');
      setValue('postCode', editData.postCode);
      setValue('postName', editData.postName);
      setValue('postCategory', editData.postCategory + '');
      setValue('postSort', editData.postSort);
      setValue('status', editData.status);
      setValue('remark', editData.remark || '');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, reset, setValue]);

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      itemId={nodes.id}
      label={
        <Box
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDept({ id: nodes.id, label: nodes.label });
            setValue('deptId', nodes.id);
            setPopoverOpen(false);
            setAnchorEl(null);
          }}
          sx={{ width: '100%', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
        >
          {nodes.label}
        </Box>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map((n: any) => renderTree(n)) : null}
    </TreeItem>
  );

  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setAnchorEl(null);
  };

  const doSubmit = async (data: FormValues) => {
    const submitData: PostForm = {
      ...data,
      deptId: Number(data.deptId),
      postId: data.postId as any,
    } as any;
    await onSubmit(submitData);
    refreshList();
  };

  const { sys_normal_disable } = dictData;

  useEffect(() => {
    if (editData && editData.deptId) {
      const findDeptById = (depts: any[], targetId: number): any => {
        for (const dept of depts) {
          if (dept.id === targetId) return dept;
          if (dept.children) {
            const found = findDeptById(dept.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };
      const foundDept = findDeptById(deptOptions, editData.deptId as number);
      if (foundDept) setSelectedDept({ id: foundDept.id, label: foundDept.label });
    } else {
      setSelectedDept(null);
    }
  }, [editData, deptOptions]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ style: { maxHeight: '90vh' } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>{title}</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(doSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="postName"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.postName)} fullWidth required>
                    <InputLabel size="small">岗位名称</InputLabel>
                    <OutlinedInput {...field} label="岗位名称" type="text" size="small" />
                    {errors.postName ? <FormHelperText>{errors.postName.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="deptId"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.deptId)} fullWidth required>
                    <Box
                      sx={{
                        border: '1px solid #d0d7de',
                        borderRadius: 1,
                        minHeight: 40,
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        cursor: 'pointer',
                        '&:hover': { borderColor: '#4096ff' },
                      }}
                      onClick={(e) => {
                        const target = e.currentTarget;
                        setAnchorEl(target);
                        setPopoverOpen(true);
                      }}
                    >
                      <Typography variant="body2" color={selectedDept ? 'text.primary' : 'text.secondary'}>
                        {selectedDept ? selectedDept.label : '部门'}
                      </Typography>
                    </Box>
                    <Popover
                      open={popoverOpen}
                      anchorEl={anchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                      PaperProps={{ sx: { maxHeight: 300, overflow: 'auto', minWidth: 200, mt: 0.5 } }}
                    >
                      <Paper sx={{ p: 1 }}>
                        <SimpleTreeView sx={{ '& .MuiTreeItem-content': { padding: '4px 8px' } }}>
                          {renderTree(deptOptions[0])}
                        </SimpleTreeView>
                      </Paper>
                    </Popover>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="postCode"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.postCode)} fullWidth required>
                    <InputLabel size="small">岗位编码</InputLabel>
                    <OutlinedInput {...field} label="岗位编码" type="text" size="small" />
                    {errors.postCode ? <FormHelperText>{errors.postCode.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="postCategory"
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel size="small">类别编码</InputLabel>
                    <OutlinedInput {...field} label="类别编码" type="text" size="small" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                control={control}
                name="postSort"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.postSort)} fullWidth required>
                    <InputLabel size="small">岗位顺序</InputLabel>
                    <OutlinedInput {...field} label="岗位顺序" type="number" size="small" />
                    {errors.postSort ? <FormHelperText>{errors.postSort.message as string}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset">
                    <RadioGroup row {...field}>
                      {dictData.sys_normal_disable.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          control={<Radio size="small" />}
                          value={option.value}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <Box>
                    <OutlinedInput {...field} fullWidth multiline rows={4} placeholder="请输入备注" />
                  </Box>
                )}
              />
            </Grid>
          </Grid>
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
