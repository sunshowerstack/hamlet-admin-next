'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { CloudUpload } from '@mui/icons-material'; // 上传相关图标
import { globalHeaders } from '@/utils/request';
import { Stack } from '@mui/system';
import { ReactUpload, UploadFile } from '@/components/core/react-upload';
import { showToast } from '@/utils/toast';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { delOss } from '@/api/system/oss';

const handleError = (file: UploadFile, error: any) => {
  console.error('上传失败', file.name, error);
  showToast('上传失败', ToastLevelEnum.ERROR);
};
const handleProgress = (file: UploadFile, percentage: number) => {
  console.info('[handleProgress] start.');
  console.info('[handleProgress]file=', file);
  console.info('[handleProgress]percentage=', percentage);
  // setProgress(percentage);
};

interface Props {
  open: boolean;
  // 上传的文件配置
  uploadConfig: { limit: number; accept: string; url: string };
  refreshList: () => void;
  onClose: () => void;
}

// 上传对话框组件（可复用）
const FileUploadModal = ({ open, refreshList, onClose, uploadConfig }: Props) => {
  const [selectedFile, setSelectedFile] = useState({ name: '' });
  const [uploadList, setUploadList] = useState([{ name: '', url: '', ossId: '' }]);

  // 关键：当isOpen变为true时（弹窗打开），重置状态
  useEffect(() => {
    if (open) {
      setSelectedFile({ name: '' });
    }
  }, [open]); // 依赖isOpen，仅当isOpen变化时执行

  // 删除选中的文件
  const handleDelete = () => {
    // TODO: 只支持1条
    const ossId = uploadList[0].ossId;
    delOss(ossId);
    setSelectedFile({ name: '' });
  };

  const handleSuccess = (file: UploadFile, res: any) => {
    console.log('上传成功', file.name, res);
    setUploadList([
      {
        name: res.data.fileName,
        url: res.data.url,
        ossId: res.data.ossId,
      },
    ]);

    setSelectedFile({ name: file.name });
  };
  /** 提交按钮 */
  const onConfirm = () => {
    onClose();
    refreshList();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>导入文件</DialogTitle>
      <DialogContent>
        <ReactUpload
          action={uploadConfig.url} // 后端上传接口
          multiple={true}
          accept="image/*"
          // 重点：设置请求头（携带 token）
          headers={globalHeaders()}
          onSuccess={handleSuccess}
          onError={handleError}
          onProgress={handleProgress}
          onDelete={handleDelete}
          // 上传区域和提示文字区域分开
          tip={
            <Stack
              spacing={3}
              sx={{
                alignItems: 'center',
                maxWidth: 'md',
                mt: 1,
              }}
            >
              <Box color="text.secondary">
                <Typography variant="body2" color="red">
                  提示：仅支持png、jpg、jpeg、gif格式文件。
                </Typography>
              </Box>
            </Stack>
          }
        >
          <CloudUpload color="primary" sx={{ mb: 1 }} />
          <Typography color="text.secondary">
            将文件拖到此处，或<em>点击上传</em>
          </Typography>
        </ReactUpload>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>
          取消
        </Button>
        <Button size="small" variant="contained" onClick={onConfirm} disabled={!selectedFile}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadModal;
