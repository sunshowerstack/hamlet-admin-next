'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Link,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material'; // 上传相关图标
import axios from 'axios';
import { download, globalHeaders } from '@/utils/request';
import { showToast } from '@/utils/toast';
import { Stack } from '@mui/system';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { HttpStatus } from '@/enums/resp-enum';
import { ReactUpload, UploadFile } from '@/components/core/react-upload';

/** 下载模板操作 */
const handleTemplate = () => {
  download('system/user/importTemplate', {}, `user_template_${Date.now()}.xlsx`);
};

const handleError = (file: UploadFile, error: any) => {
  console.error('上传失败', file.name, error);
  showToast('上传失败', ToastLevelEnum.ERROR);
};

interface Props {
  open: boolean;
  uploadConfig: { limit: number; accept: string; url: string }; // 上传的文件配置
  refreshList: () => void;
  onClose: () => void;
}

/**
 * 用户上传导入（模板excel导入）
 *
 */
const UserTemplateUploadModal = ({ open, refreshList, onClose, uploadConfig }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 对话框checkbox：【是否更新已经存在的用户数据】
  const [updateSupport, setUpdateSupport] = useState(false);
  const [selectedFile, setSelectedFile] = useState({} as any);

  // 关键：当isOpen变为true时（弹窗打开），重置状态
  useEffect(() => {
    if (open) {
      setUpdateSupport(false);
      setSelectedFile({ name: '' });
      setProgress(0);
      setIsUploading(false);
    }
  }, [open]); // 依赖isOpen，仅当isOpen变化时执行

  // 删除选中的文件
  const handleDelete = (file: UploadFile) => {
    // TODO: 只支持1条
    // let ossId = uploadList[0].ossId;
    // delOss(ossId);
    setSelectedFile({ name: '' });
  };

  const handleSuccess = (file: UploadFile, res: any) => {
    console.log('上传成功', file.name, res);
    // 只有request的内容，response为null，因为不是自动上传文件的业务。
    setSelectedFile(file.raw);
  };

  // 【确定】按钮点击时候，才提交到后端接口做业务处理
  const onConfirm = async () => {
    console.log('selectedFile===', selectedFile);
    // 没选择文件
    if (!selectedFile.name) {
      return;
    }

    setIsUploading(true);
    setProgress(0);

    // 模拟API请求（实际项目中替换为真实接口）
    try {
      // 构建FormData
      const formData = new FormData();
      formData.append('file', selectedFile); // 指定的原文件内容

      // 这里用setInterval模拟进度，实际项目中使用axios等库
      // 示例：
      const updateSupportValue = updateSupport ? 1 : 0;
      await axios
        .post(`${uploadConfig.url}?updateSupport=${updateSupportValue}`, formData, {
          // 1.设置token  2. 清理掉全局配置的Content-Type的默认格式application/json，让浏览器自己处理
          headers: { ...globalHeaders(), 'Content-Type': undefined },
          // 获取进度的回调方法，数据量上万（文件上1M），loaded和total就能看出差异
          onUploadProgress: (event) => {
            console.log('event.loaded:', event.loaded);
            console.log('event.total:', event.total);
            setProgress(Math.round((event.loaded / (event.total as any)) * 100));
          },
        })
        .then((response) => {
          console.log('response:', response);
          const data = response.data;
          if (data.code !== HttpStatus.SUCCESS) {
            showToast('上传失败', ToastLevelEnum.ERROR);
            onClose(); // 上传成功后关闭对话框
            return;
          }

          showToast('上传成功', ToastLevelEnum.SUCCESS);
          refreshList();
          onClose(); // 上传成功后关闭对话框
        });
    } catch (error) {
      console.error('error:', error);
      showToast('上传失败，请重试', ToastLevelEnum.ERROR);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>导入文件</DialogTitle>

      <DialogContent>
        <ReactUpload
          action={uploadConfig.url} // 后端上传接口
          multiple={true}
          accept=".xlsx, .xls"
          // 重点：设置请求头（携带 token）
          headers={globalHeaders()}
          onSuccess={handleSuccess}
          onError={handleError}
          autoUpload={false}
          onDelete={handleDelete}
          tip={
            <Stack spacing={3} sx={{ alignItems: 'center', maxWidth: 'md', mt: 1 }}>
              <Box color="text.secondary">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={updateSupport}
                      onChange={(e) => setUpdateSupport(e.target.checked)}
                      disabled={isUploading}
                    />
                  }
                  label="是否更新已经存在的用户数据"
                  sx={{
                    // 定位 label 元素并设置字体大小
                    '& .MuiFormControlLabel-label': {
                      fontSize: '13px', // 自定义文字大小（如 14px、1rem 等）
                    },
                  }}
                />
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="red">
                    提示：仅允许导入 xls、xlsx 格式文件。
                  </Typography>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleTemplate}
                    underline="none"
                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                  >
                    下载模板
                  </Link>
                </Stack>
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
        <Button size="small" variant="outlined" onClick={onClose} disabled={isUploading}>
          取消
        </Button>
        <Button size="small" variant="contained" onClick={onConfirm} disabled={isUploading || !selectedFile}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserTemplateUploadModal;
