'use client';
import React, { useState, useEffect, useCallback } from 'react';
import RouterLink from 'next/link';
import Stack from '@mui/material/Stack';
import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import { OssTable } from '@/components/system/oss/oss-table';
import { delOss, listOss } from '@/api/system/oss';
import { OssQuery, OssVO } from '@/api/system/oss/types';
import { showToast } from '@/utils/toast';
import { Button, Link } from '@mui/material';
import { Upload } from '@mui/icons-material';
import { useTabsStore } from '@/stores/tabs-store';
import FileUploadModal from '@/components/system/oss/file-upload-modal';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

// 上传配置
const uploadConfig = {
  limit: 1,
  accept: '.xlsx, .xls, .pdf',
  // 上传URL
  url: process.env.NEXT_PUBLIC_API_BASE_URL + '/resource/oss/upload',
};

export default function Page(): React.JSX.Element {
  // 使用选择器只获取 closeTab 函数，避免订阅整个 store 的变化
  // 这样当 activeKey 变化时，UsersTable 不会重新渲染
  const closeTab = useTabsStore((state) => state.closeTab);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageList, setPageList] = useState<OssVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<Array<string>>([]);

  const [uploadOpen, setUploadOpen] = useState(false);

  const [searchParams, setSearchParams] = useState({
    fileName: '',
    originalName: '',
    fileSuffix: '',
    service: '',
    createTime: undefined as any,
  });

  const confirm = useConfirm();

  const getPageList = useCallback(async () => {
    const query: Partial<OssQuery> & { pageNum: number; pageSize: number } = {
      fileName: searchParams.fileName,
      originalName: searchParams.originalName,
      fileSuffix: searchParams.fileSuffix,
      service: searchParams.service,
      // createTime 用于时间范围，后端如需传参可在此处理
      pageNum: page + 1,
      pageSize: rowsPerPage,
    } as any;
    const res = await listOss(query as OssQuery);
    // 兼容后端分页：若返回 {rows,total}
    const rows = (res as any).rows ?? (res as any).data ?? (res as any);
    const totalVal = (res as any).total ?? rows?.length ?? 0;
    setPageList(rows);
    setTotal(totalVal);
  }, [page, rowsPerPage, searchParams]);

  useEffect(() => {
    getPageList();
  }, [page, rowsPerPage, searchParams, getPageList]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedRows([]);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const searchFields = [
    { name: 'fileName', label: '文件名', type: 'text' as const, placeholder: '请输入文件名' },
    { name: 'originalName', label: '原名', type: 'text' as const, placeholder: '请输入原名' },
    { name: 'fileSuffix', label: '后缀', type: 'text' as const, placeholder: '如 .jpg/.docx' },
    { name: 'service', label: '服务商', type: 'text' as const, placeholder: '如 aliyun-xxx' },
    { name: 'createTime', label: '创建时间', type: 'dateRange' as const },
  ];

  const handleSearch = (data: SearchFormData) => {
    setSearchParams({
      fileName: (data as any).fileName || '',
      originalName: (data as any).originalName || '',
      fileSuffix: (data as any).fileSuffix || '',
      service: (data as any).service || '',
      createTime: (data as any).createTime,
    });
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ fileName: '', originalName: '', fileSuffix: '', service: '', createTime: undefined as any });
    setPage(0);
  };

  const handleDelete = async (row: OssVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除文件"${row.originalName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[oss] handleDelete cancelled', reason);
      return;
    }

    await delOss(row.ossId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 个文件吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[oss] handleBulkDelete cancelled', reason);
      return;
    }

    await delOss(selectedRows as any);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleUpload = async (file: File) => {
    // 此处仅关闭弹窗并提示，实际上传在 api/system/oss 扩展后替换
    console.log('upload file:', file.name);
    showToast('模拟上传成功', ToastLevelEnum.SUCCESS);
    await getPageList();
  };

  const handleDownload = (row: OssVO) => {
    const link = document.createElement('a');
    link.href = row.url;
    link.download = row.originalName || row.fileName;
    link.target = '_blank';
    document.body.append(link);
    link.click();
    document.body.append(link);
  };

  const handlePreview = (row: OssVO) => {
    window.open(row.url, '_blank');
  };

  return (
    <Stack spacing={3}>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <ActionButtons onDelete={handleBulkDelete} selectedCount={selectedRows.length}>
        <Button
          size="small"
          startIcon={<Upload fontSize="small" />}
          variant="outlined"
          onClick={() => {
            setUploadOpen(true);
          }}
        >
          上传文件
        </Button>
        <Button size="small" variant="outlined" onClick={() => {}}>
          预览开关
        </Button>
        <Link
          component={RouterLink}
          href="/system/oss/config"
          variant="subtitle2"
          underline="none"
          onClick={() => {
            // 关闭已经打开的tab,避免tab内容为旧的
            closeTab('/system/oss/config');
          }}
        >
          <Button size="small" variant="outlined">
            文件配置
          </Button>
        </Link>
      </ActionButtons>
      <OssTable
        total={total}
        page={page}
        rows={pageList}
        rowsPerPage={rowsPerPage}
        onSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onPreview={handlePreview}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      <FileUploadModal
        open={uploadOpen}
        uploadConfig={uploadConfig}
        refreshList={getPageList}
        onClose={() => setUploadOpen(false)} // 关闭对话框的回调
      />
    </Stack>
  );
}
