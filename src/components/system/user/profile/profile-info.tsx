import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { UserInfoVO } from '@/api/system/user/types';
import { AvatarCropperDialog } from './avatar-cropper-dialog';

interface Props {
  userInfo: UserInfoVO | null;
  onAvatarUpdate?: () => void;
}

export function ProfileInfo({ userInfo, onAvatarUpdate }: Props): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleAvatarClick = () => {
    setDialogOpen(true);
  };

  const handleAvatarUpdate = () => {
    // 通知父组件刷新数据
    if (onAvatarUpdate) {
      onAvatarUpdate();
    }
  };

  return (
    <>
      <Card>
        <CardHeader title="个人信息" sx={{ color: '#6a6a6c' }} />
        <Divider />
        <CardContent>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Box
              onClick={handleAvatarClick}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                display: 'inline-block',
                '&:hover .avatar-overlay': {
                  opacity: 1,
                },
              }}
            >
              <Avatar src={userInfo?.user?.avatar} sx={{ height: 120, width: 120 }} />
              <Box
                className="avatar-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="caption" sx={{ color: '#fff', fontSize: '12px' }}>
                  点击上传头像
                </Typography>
              </Box>
            </Box>
            <Stack spacing={0.5} sx={{ textAlign: 'center' }}>
              <Typography variant="h6">{userInfo?.user?.userName || '-'}</Typography>
              <Typography color="text.secondary" variant="body2">
                {userInfo?.user?.deptName}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" variant="body2">
                用户名称
              </Typography>
              <Typography variant="body2">{userInfo?.user?.userName || '-'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" variant="body2">
                手机号码
              </Typography>
              <Typography variant="body2">{userInfo?.user?.phonenumber || '-'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" variant="body2">
                用户邮箱
              </Typography>
              <Typography variant="body2">{userInfo?.user?.email || '-'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" variant="body2">
                所属部门
              </Typography>
              <Typography variant="body2">{userInfo?.user?.deptName || '-'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" variant="body2">
                所属角色
              </Typography>
              <Typography variant="body2">{userInfo?.roleGroup || '-'}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary" variant="body2">
                创建日期
              </Typography>
              <Typography variant="body2">{userInfo?.user?.createTime || '-'}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <AvatarCropperDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAvatarUpdate={() => handleAvatarUpdate()}
      />
    </>
  );
}
