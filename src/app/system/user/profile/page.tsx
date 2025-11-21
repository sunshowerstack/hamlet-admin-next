'use client';

import * as React from 'react';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import { getUserProfile, updateUserProfile, updateUserPwd } from '@/api/system/user';
import { UserInfoVO, UserVO } from '@/api/system/user/types';
import { showToast } from '@/utils/toast';
import { ProfileInfo } from '@/components/system/user/profile/profile-info';
import { ProfileRightPanel } from '@/components/system/user/profile/profile-right-panel';
import { useSidebarRouterStore } from '@/stores/sidebar-router-store';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

export default function Page(): React.JSX.Element {
  const [userInfo, setUserInfo] = React.useState<UserInfoVO | null>(null);

  // 刷新右上角登录用户头像
  const { setNickName } = useSidebarRouterStore();

  // 基本资料表单
  const [profileNickName, setProfileNickName] = React.useState('');
  const [phonenumber, setPhonenumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sex, setSex] = React.useState('0');

  const loadProfile = React.useCallback(async () => {
    const res = await getUserProfile();
    // 兼容返回结构：可能为 { data: { user: {...}, roleGroup, postGroup } } 或 { user: {...} }
    const data = (res as any).data ?? res;
    setUserInfo(data);

    const user: UserVO | undefined = data?.user ?? data;
    if (user) {
      setProfileNickName(user.nickName ?? '');
      setPhonenumber(user.phonenumber ?? '');
      setEmail(user.email ?? '');
      setSex((user.sex as any) ?? '0');
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfile = async () => {
    await updateUserProfile({
      // profile 接口一般仅需要这些字段，使用 any 以兼容后端
      profileNickName,
      phonenumber,
      email,
      sex,
    } as any);
    showToast('保存成功', ToastLevelEnum.SUCCESS);
    loadProfile();
    // 刷新右上角下拉menu的昵称
    setNickName(profileNickName);
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        {/* 左侧：个人信息卡片 */}
        <Grid size={{ lg: 4, md: 5, xs: 12 }}>
          <ProfileInfo userInfo={userInfo} onAvatarUpdate={loadProfile} />
        </Grid>

        {/* 右侧：整体面板组件（含基本资料与修改密码） */}
        <Grid size={{ lg: 8, md: 7, xs: 12 }}>
          <ProfileRightPanel
            nickName={profileNickName}
            phonenumber={phonenumber}
            email={email}
            sex={sex}
            onProfileChange={(next) => {
              if (next.nickName !== undefined) setProfileNickName(next.nickName);
              if (next.phonenumber !== undefined) setPhonenumber(next.phonenumber);
              if (next.email !== undefined) setEmail(next.email);
              if (next.sex !== undefined) setSex(next.sex);
            }}
            onSaveProfile={handleSaveProfile}
            onChangePwd={async (oldPwd: string, newPwd: string) => {
              await updateUserPwd(oldPwd, newPwd);
              showToast('密码修改成功', ToastLevelEnum.SUCCESS);
            }}
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
