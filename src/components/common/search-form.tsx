'use client';

import React from 'react';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, Paper } from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { SearchFormData } from '@/types/common';
import { DateRangePicker, DateRange as MuiDateRange } from '@mui/x-date-pickers-pro';
import { Dayjs } from 'dayjs';

interface Props {
  fields: {
    name: string;
    label: string;
    type: 'text' | 'select' | 'dateRange';
    placeholder?: string;
    // 以下为下拉框select属性
    options?: { value: string | number; label: string }[];
    defaultValue?: string;
    hasAll?: boolean;
  }[];
  onSearch: (data: SearchFormData) => void;
  onReset: (data: SearchFormData) => void;
}

export default function SearchForm({ fields, onSearch, onReset }: Props) {
  // 初始化formData，包含所有有defaultValue的字段
  const initialFormData = React.useMemo(() => {
    const initial: SearchFormData = {};
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.name] = field.defaultValue;
      }
    });
    return initial;
  }, [fields]);

  // useState里传入了入参：initialFormData，相当于state里有初始值了。
  const [formData, setFormData] = React.useState<SearchFormData>(initialFormData);

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateRangeChange = (name: string, value: MuiDateRange<Dayjs>) => {
    console.log('[handleDateRangeChange] value:', value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSearch = () => {
    // 组件state变量formData，作为了父组件的回调函数的入参
    console.log('[handleSearch] formData:', formData);
    onSearch(formData);
  };

  const handleReset = () => {
    console.log('[handleReset] initialFormData==', initialFormData);
    setFormData(initialFormData);
    // 异步更新问题，不能用formData做参数
    onReset(initialFormData);
  };

  const renderField = (field: Props['fields'][0]) => {
    console.log('field.hasAll===', field.hasAll);
    // 下拉框
    if (field.type === 'select') {
      return (
        <FormControl fullWidth size="small">
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={
              Array.isArray(field.options) && field.options.length > 0 ? formData[field.name] || field.defaultValue : ''
            }
            label={field.label}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          >
            {field.hasAll && <MenuItem value="">全部</MenuItem>}
            {field.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }

    // 日期范围选择
    if (field.type === 'dateRange') {
      return (
        <FormControl fullWidth size="small">
          {/*  日期范围选择 */}
          <DateRangePicker
            value={formData[field.name] || [null, null]}
            onChange={(value) => handleDateRangeChange(field.name, value)}
            format="YYYY-MM-DD"
            slotProps={{
              calendarHeader: { format: 'YYYY年MM月' },
              textField: {
                size: 'small',
                fullWidth: true,
                sx: {
                  width: '100%',
                  // 1. 控制最外层输入框容器高度
                  '& .MuiPickersOutlinedInput-root': {
                    height: 32,
                  },
                  // 2. 控制内部文字大小（穿透到 MuiPickersInputBase-input）
                  '& .MuiPickersSectionList-root': {
                    fontSize: 13,
                    // padding: '8px 12px', // 调整内边距让文字垂直居中
                  },
                  // 可选：控制输入框内部的"日期分隔符"样式（如"–"）
                  // '& .MuiPickersInputBase-sectionSeparator': {
                  // fontSize: 12,
                  // },
                },
              },
            }}
            sx={{ width: '100%' }}
          />
        </FormControl>
      );
    }

    return (
      <TextField
        fullWidth
        size="small"
        label={field.label}
        placeholder={field.placeholder}
        value={formData[field.name] || ''}
        onChange={(e) => handleInputChange(field.name, e.target.value)}
      />
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {fields.map((field) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={field.name}>
            {renderField(field)}
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<Search />} onClick={handleSearch} size="small">
              搜索
            </Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={handleReset} size="small">
              重置
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
