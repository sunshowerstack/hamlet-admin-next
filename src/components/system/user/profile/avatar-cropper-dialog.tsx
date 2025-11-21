'use client';
import React, { useState, useRef } from 'react';

import ReactCropComponent, { centerCrop, makeAspectCrop, Crop, PixelCrop, convertToPixelCrop } from 'react-image-crop';
import { canvasPreview } from './canvas/canvas-preview';
import { useDebounceEffect } from './canvas/use-debounce-effect';

import 'react-image-crop/dist/ReactCrop.css';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Add, Close, Remove, RotateLeft, RotateRight, Upload } from '@mui/icons-material';
import { Box, Stack } from '@mui/system';
import { showToast } from '@/utils/toast';
import { uploadAvatar } from '@/api/system/user';
import { useSidebarRouterStore } from '@/stores/sidebar-router-store';
import Image from 'next/image';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      // 裁剪区域以百分比为单位，宽度占图片的 90%
      {
        unit: '%',
        width: 50,
      },
      aspect, // 强制裁剪区域的宽高比等于该值（高度会自动按比例计算）
      mediaWidth, // 用于根据图片实际尺寸计算裁剪区域的具体大小
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export function AvatarCropperDialog({ open, onClose, onAvatarUpdate }: Props) {
  const [imgSrc, setImgSrc] = useState('');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  // 全选比例：1：正方形比例，或者：16 / 9
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [uploading, setUploading] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 刷新右上角登录用户头像
  const { setAvatar } = useSidebarRouterStore();

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images.
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      //  图片的宽高
      const { width, height } = e.currentTarget;

      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  // 打开文件选择
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  async function onDownloadCropClick() {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }
    blobUrlRef.current = URL.createObjectURL(blob);

    if (hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = blobUrlRef.current;
      hiddenAnchorRef.current.click();
    }
  }

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate);
      }
    },
    100,
    [completedCrop, scale, rotate]
  );

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined);
    } else {
      setAspect(16 / 9);

      if (imgRef.current) {
        const { width, height } = imgRef.current;
        const newCrop = centerAspectCrop(width, height, 16 / 9);
        setCrop(newCrop);
        // Updates the preview
        setCompletedCrop(convertToPixelCrop(newCrop, width, height));
      }
    }
  }
  // 关闭对话框
  const handleClose = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };
  // 缩放
  const handleScaleChange = (delta: number) => {
    setScale((prev) => Math.max(0.1, Math.min(3, prev + delta * 0.1)));
  };

  // 旋转
  const handleRotate = (direction: 'left' | 'right') => {
    setRotate((prev) => (direction === 'left' ? prev - 90 : prev + 90));
  };

  // 上传
  const handleUpload = async () => {
    const image = imgRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist');
    }
    setUploading(true);

    // This will size relative to the uploaded image
    // size. If you want to size according to what they
    // are looking at on screen, remove scaleX + scaleY
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreen = new OffscreenCanvas(completedCrop.width * scaleX, completedCrop.height * scaleY);
    const ctx = offscreen.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    );
    // You might want { type: "image/jpeg", quality: <0 to 1> } to
    // reduce image size
    const blob = await offscreen.convertToBlob({
      type: 'image/png',
    });

    try {
      const formData = new FormData();
      formData.append('avatarfile', blob, 'avatar.png');

      const res = await uploadAvatar(formData);
      const newAvatarUrl = res.data?.imgUrl || '';

      if (newAvatarUrl) {
        onAvatarUpdate(newAvatarUrl);
        // 右上角头像，刷新全局state
        setAvatar(newAvatarUrl);
      }

      showToast('头像上传成功', ToastLevelEnum.SUCCESS);
      handleClose();
    } catch (error) {
      console.error('上传失败:', error);
      showToast('上传失败', ToastLevelEnum.ERROR);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>修改头像</span>
        <IconButton aria-label="close" onClick={handleClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* <div className="Crop-Controls"> */}
          <input type="file" ref={fileInputRef} accept="image/*" onChange={onSelectFile} style={{ display: 'none' }} />
          {/* <div>
              <label htmlFor="scale-input">Scale: </label>
              <input
                id="scale-input"
                type="number"
                step="0.1"
                value={scale}
                disabled={!imgSrc}
                onChange={(e) => setScale(Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="rotate-input">Rotate: </label>
              <input
                id="rotate-input"
                type="number"
                value={rotate}
                disabled={!imgSrc}
                onChange={(e) => setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))}
              />
            </div>
            <div>
              <button onClick={handleToggleAspectClick}>Toggle aspect {aspect ? 'off' : 'on'}</button>
            </div>
          </div> */}

          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* 裁剪区域 */}
            <Box
              sx={{
                flex: 1,
                minHeight: 350,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // added
                width: '100%',
                height: 350,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {!!imgSrc && (
                <ReactCropComponent
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  // minWidth={400}
                  minHeight={100}
                  circularCrop // 圆形选定区域，注释调就是正方形
                >
                  <Image
                    ref={imgRef}
                    alt="Crop me"
                    src={imgSrc}
                    style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                    onLoad={onImageLoad}
                  />
                </ReactCropComponent>
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                }}
              >
                {!!completedCrop && (
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      border: '1px solid black',
                      objectFit: 'contain',
                      width: completedCrop.width,
                      height: completedCrop.height,
                    }}
                  />
                )}
              </Box>
              {/* <div>
                <button onClick={onDownloadCropClick}>Download Crop</button>
                <div style={{ fontSize: 12, color: '#666' }}>
                  If you get a security error when downloading try opening the Preview in a new tab (icon near top
                  right).
                </div>
                <a
                  href="#hidden"
                  ref={hiddenAnchorRef}
                  download
                  style={{
                    position: 'absolute',
                    top: '-200vh',
                    visibility: 'hidden',
                  }}
                >
                  Hidden download
                </a>
              </div> */}
            </Box>
          </Box>

          {/* 控制按钮 - 始终显示，没有图片时禁用 */}
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            <Button variant="outlined" startIcon={<Upload />} onClick={handleSelectFile} size="small">
              选择
            </Button>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => handleScaleChange(1)}
              size="small"
              disabled={!imgSrc}
            >
              放大
            </Button>
            <Button
              variant="outlined"
              startIcon={<Remove />}
              onClick={() => handleScaleChange(-1)}
              size="small"
              disabled={!imgSrc}
            >
              缩小
            </Button>
            <Button
              variant="outlined"
              startIcon={<RotateLeft />}
              onClick={() => handleRotate('left')}
              size="small"
              disabled={!imgSrc}
            >
              左旋
            </Button>
            <Button
              variant="outlined"
              startIcon={<RotateRight />}
              onClick={() => handleRotate('right')}
              size="small"
              disabled={!imgSrc}
            >
              右旋
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" onClick={handleClose} variant="outlined">
          取消
        </Button>
        <Button size="small" onClick={handleUpload} variant="contained" disabled={!completedCrop || uploading}>
          {uploading ? '上传中...' : '提交'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
