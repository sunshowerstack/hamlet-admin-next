'use client';

import { CloseOutlined, DescriptionOutlined } from '@mui/icons-material';
import { LinearProgress, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import React, { useRef, useState, useCallback } from 'react';

// 定义文件状态类型
type FileStatus = 'ready' | 'uploading' | 'success' | 'error';

// 生成唯一 ID（用于标识文件）
const generateUid = (): string => {
  return Date.now() + Math.floor(Math.random() * 10_000).toString();
};

const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => event.preventDefault();

// 定义文件对象类型
export interface UploadFile {
  uid: string;
  raw: File; // 原生File对象
  name: string;
  size: number;
  status: FileStatus;
  percentage: number;
}
// 定义组件props类型
interface Props {
  // 明确指定 children 类型为 ReactNode
  children: React.ReactNode;
  tip?: React.ReactNode; // 提示回显区域
  action: string; // 上传接口地址（必填）
  multiple?: boolean; // 是否支持多文件
  accept?: string; // 允许的文件类型
  autoUpload?: boolean; // 是否自动上传
  headers: { Authorization: string; clientid: string | undefined }; // 自定义请求头（含token）
  name?: string; // 上传文件的字段名
  onSuccess?: (file: UploadFile, response: any) => void; // 成功回调
  onError?: (file: UploadFile, error: Error) => void; // 失败回调
  onProgress?: (file: UploadFile, percentage: number) => void; // 进度回调
  onDelete?: (file: UploadFile) => void; // 删除所选文件
}

export const ReactUpload: React.FC<Props> = ({
  action, // 上传接口地址（必填）
  multiple = false, // 是否支持多文件
  accept = '', // 允许的文件类型（如 'image/*'）
  autoUpload = true, // 是否自动上传
  headers = {}, // 自定义请求头（支持携带 token）
  name = 'file', // 上传文件的字段名（传给后端的 key）
  onSuccess, // 上传成功回调
  onError, // 上传失败回调
  onProgress, // 进度更新回调
  children,
  tip,
  onDelete,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [requests, setRequests] = useState<Record<string, XMLHttpRequest>>({});

  // 触发文件选择
  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 处理文件选择变化

  // 执行文件上传（核心逻辑，新增请求头处理）
  const uploadFile = useCallback(
    (file: UploadFile) => {
      // 更新文件状态为上传中
      setFileList((prev) => prev.map((item) => (item.uid === file.uid ? { ...item, status: 'uploading' } : item)));

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      // 上传文件的控件的name：默认指定"file"
      formData.append(name, file.raw); // 使用自定义字段名

      // 监听进度
      xhr.upload.addEventListener('progress', (e) => {
        if (e.total > 0) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          setFileList((prev) => prev.map((item) => (item.uid === file.uid ? { ...item, percentage } : item)));
          if (onProgress) {
            onProgress(file, percentage);
          }
        }
      });

      // 上传完成处理
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // 成功
          setFileList((prev) => prev.map((item) => (item.uid === file.uid ? { ...item, status: 'success' } : item)));
          if (onSuccess) {
            onSuccess(file, JSON.parse(xhr.responseText));
          }
        } else {
          // 失败
          setFileList((prev) => prev.map((item) => (item.uid === file.uid ? { ...item, status: 'error' } : item)));
          if (onError) {
            onError(file, new Error(`HTTP Error: ${xhr.status}`));
          }
        }
        // 清除请求实例
        setRequests((prev) => {
          const newRequests = { ...prev };
          delete newRequests[file.uid];
          return newRequests;
        });
      });

      // 网络错误处理
      xhr.addEventListener('error', () => {
        setFileList((prev) => prev.map((item) => (item.uid === file.uid ? { ...item, status: 'error' } : item)));
        if (onError) {
          onError(file, new Error('Network Error'));
        }
        setRequests((prev) => {
          const newRequests = { ...prev };
          delete newRequests[file.uid];
          return newRequests;
        });
      });

      // 打开连接并设置请求头（重点：添加 headers 支持）
      xhr.open('POST', action);

      // 遍历 headers 对象，设置所有自定义请求头（包括 token）
      Object.entries(headers).forEach(([key, value]) => {
        // 跳过 Content-Type（由 FormData 自动处理为 multipart/form-data）
        // if (key.toLowerCase() !== 'content-type') {
        if (key.toLowerCase() !== 'content-type' && typeof value === 'string') {
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.send(formData);

      // 保存请求实例，用于取消上传
      setRequests((prev) => ({ ...prev, [file.uid]: xhr }));
    },
    [action, name, headers, onSuccess, onError, onProgress]
  );

  // 统一处理选择/拖拽的文件集合
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      if (!files || files.length === 0) return;
      const newFiles: UploadFile[] = [...files].map((file) => ({
        uid: generateUid(),
        raw: file,
        name: file.name,
        size: file.size,
        status: 'ready',
        percentage: 0,
      }));
      setFileList((prev) => [...prev, ...newFiles]);
      if (autoUpload) {
        newFiles.forEach((file) => uploadFile(file));
      } else {
        newFiles.forEach((file) => {
          onSuccess?.(file, null);
          setFileList((prev) => prev.map((item) => (item.uid === file.uid ? { ...item, status: 'success' } : item)));
        });
      }
    },
    [autoUpload, onSuccess, uploadFile]
  );

  // 处理文件选择变化
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      addFiles(files as FileList);
      if (e.target) {
        e.target.value = '';
      }
    },
    [addFiles]
  );

  // 取消上传
  const handleAbort = useCallback(
    (uid: string) => {
      const xhr = requests[uid];
      if (xhr) {
        xhr.abort();
        setFileList((prev) => prev.map((item) => (item.uid === uid ? { ...item, status: 'error' } : item)));
        setRequests((prev) => {
          const newRequests = { ...prev };
          delete newRequests[uid];
          return newRequests;
        });
      }
    },
    [requests]
  );

  // 删除已选的文件
  const handleDelete = useCallback(
    async (file: UploadFile) => {
      try {
        // 如果是自动上传的，需要调用负组件的onDelete方法，数据库删除
        if (autoUpload) {
          // TODO: file只是上传的文件，不是上传后的响应结果
          onDelete?.(file);
        }
        // 只保留uid不等的，相当于移除当前的file
        setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    },
    [autoUpload, onDelete]
  );

  // 手动上传
  const submitUpload = useCallback(() => {
    fileList.filter((file) => file.status === 'ready').forEach((file) => uploadFile(file));
  }, [fileList, uploadFile]);

  // 拖放处理
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      addFiles([file]);
    }
  };

  return (
    <Box>
      <Box
        border="2px dashed #ccc"
        borderRadius={2}
        p={1}
        textAlign="center"
        onClick={triggerFileSelect}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main' },
          transition: 'border-color 0.3s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        {/* 父元素包裹的内容 上传区域 */}
        {children}
      </Box>
      {/* 虚线框外，属性传入 提示区域 */}
      {tip && <Box sx={{ marginTop: 2 }}>{tip}</Box>}

      {/* 上传进度条展示 区域 */}
      {fileList.map((file) => (
        <Box key={file.uid}>
          {file.status === 'uploading' && (
            <LinearProgress variant="determinate" value={file.percentage} sx={{ mt: 1 }} />
          )}
          {/* {file.status === 'uploading' && (
            <Button variant="contained" onClick={() => handleAbort(file.uid)}>
              取消
            </Button>
          )} */}
          {file.status === 'success' && (
            <Stack
              direction="row"
              spacing={0}
              sx={{
                p: 1,
                alignItems: 'center',
                cursor: 'default', // 保持光标默认样式
                transition: 'background-color 0.2s ease', // 过渡动画更流畅
                '&:hover': {
                  backgroundColor: '#f5f5f5', // 灰色背景（可根据主题调整色值）
                  // 父容器 hover 时直接控制子元素显示
                  '& > .close-btn': {
                    display: 'inline-flex',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {file.name}
                </Typography>
              </Box>
              {/* X 关闭按钮 */}
              <CloseOutlined
                fontSize="small"
                className="close-btn" // 关键：添加类名
                onClick={() => handleDelete(file)}
                sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  display: 'none', // 默认隐藏
                  ml: 'auto', // auto 自动填充左侧剩余空间
                  '&:hover': {
                    color: 'error.main', // 鼠标移到按钮上变红色（可选优化）
                  },
                }}
              />
            </Stack>
          )}
        </Box>
      ))}
    </Box>
  );
};
