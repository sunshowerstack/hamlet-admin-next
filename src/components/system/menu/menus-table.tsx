'use client';

import * as React from 'react';
import { DictDataOption } from '@/stores/dict-store';
import { Delete, Edit, Add, ExpandMore, ChevronRight } from '@mui/icons-material';
import { IconButton, TableContainer, Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';

import { MenuVO } from '@/api/system/menu/types';

const hasChildren = (row: MenuVO) => {
  return row.children && row.children.length > 0;
};

export interface Menu {
  menuId: string | number;
  menuName: string;
  icon: string;
  orderNum: number;
  perms: string;
  component: string;
  status: string;
  createTime: string;
  level?: number;
}

interface Props {
  rows?: MenuVO[];
  onEdit?: (row: MenuVO) => void;
  onDelete?: (row: MenuVO) => void;
  onAdd?: (row: MenuVO) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
    sys_show_hide: DictDataOption[];
  };
}

// 根据值获取标签
const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return item?.label || value;
};

// 获取菜单类型标签
const getMenuTypeLabel = (menuType: string) => {
  const typeMap: { [key: string]: string } = {
    M: '目录',
    C: '菜单',
    F: '按钮',
  };
  return typeMap[menuType] || menuType;
};

// 渲染菜单图标
const renderMenuIcon = (icon: string) => {
  if (!icon) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box
        component="span"
        sx={{
          width: 16,
          height: 16,
          display: 'inline-block',
          backgroundImage: `url(${icon})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </Box>
  );
};

export function MenusTable({ rows = [], onEdit, onDelete, onAdd, dictData }: Props) {
  console.log('[MenusTable] start...');
  // 从props中获取字典数据
  const { sys_normal_disable, sys_show_hide } = dictData;

  // 展开状态管理 - 默认所有菜单都是收缩状态
  const [expandedRows, setExpandedRows] = React.useState<Set<string | number>>(new Set());

  // 获取所有菜单ID（包括子菜单）
  const getAllMenuIds = (menuList: MenuVO[]): (string | number)[] => {
    let allIds: (string | number)[] = [];
    menuList.forEach((menu) => {
      allIds.push(menu.menuId);
      if (menu.children && menu.children.length > 0) {
        allIds = [...allIds, ...getAllMenuIds(menu.children)];
      }
    });
    return allIds;
  };

  const toggleExpanded = (menuId: string | number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedRows(newExpanded);
  };

  const isExpanded = (menuId: string | number) => {
    return expandedRows.has(menuId);
  };

  // 渲染树形行
  const renderTreeRow = (row: MenuVO, level = 0) => {
    const expanded = isExpanded(row.menuId);
    const hasChild = hasChildren(row);

    return (
      <React.Fragment key={row.menuId}>
        <TableRow hover role="checkbox" tabIndex={-1}>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: level * 2 }}>
              <Box sx={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleExpanded(row.menuId);
                  }}
                  sx={{ p: 0.5 }}
                >
                  {hasChild ? (
                    expanded ? (
                      <ExpandMore fontSize="small" />
                    ) : (
                      <ChevronRight fontSize="small" />
                    )
                  ) : (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      {'>'}
                    </Box>
                  )}
                </IconButton>
              </Box>
              {row.menuName}
            </Box>
          </TableCell>
          <TableCell>{renderMenuIcon(row.icon)}</TableCell>
          <TableCell>{row.orderNum}</TableCell>
          <TableCell>{getMenuTypeLabel(row.menuType)}</TableCell>
          <TableCell>{(row as any).perms || '-'}</TableCell>
          <TableCell>{row.component || '-'}</TableCell>
          <TableCell>
            <Box
              sx={{
                display: 'inline-block',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                fontSize: '0.75rem',
              }}
            >
              {getLabel(sys_normal_disable, row.status)}
            </Box>
          </TableCell>
          <TableCell>{row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD') : '-'}</TableCell>
          <TableCell
            sx={(theme) => ({
              position: 'sticky',
              right: 0,
              backgroundColor: theme.palette.background.paper,
              zIndex: 2,
              boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
            })}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" onClick={() => onEdit?.(row)} sx={{ color: '#1976d2' }}>
                <Edit fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onAdd?.(row)} sx={{ color: '#1976d2' }}>
                <Add fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete?.(row)} sx={{ color: '#1976d2' }}>
                <Delete fontSize="small" />
              </IconButton>
            </Box>
          </TableCell>
        </TableRow>
        {hasChild && expanded && row.children?.map((child) => renderTreeRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <Card>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '1000px' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell>菜单名称</TableCell>
              <TableCell>图标</TableCell>
              <TableCell>排序</TableCell>
              <TableCell>菜单类型</TableCell>
              <TableCell>权限标识</TableCell>
              <TableCell>组件路径</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell
                sx={{
                  width: 150,
                  position: 'sticky',
                  right: 0,
                  backgroundColor: '#fafafa',
                  zIndex: 3,
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                }}
              >
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows.map((row) => renderTreeRow(row))}</TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
