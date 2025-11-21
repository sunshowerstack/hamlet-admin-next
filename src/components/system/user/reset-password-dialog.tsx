import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { UserVO } from '@/api/system/user/types';

const validatePassword = (value: string): string => {
  if (value.length < 5 || value.length > 20) {
    return '用户密码长度必须介于 5 和 20 之间';
  }
  if (/<|>|"|'|\||\\/.test(value)) {
    // return '不能包含非法字符：< > " \' \\ |';
    return String.raw`不能包含非法字符：< > " ' \ |`;
  }
  return '';
};

export const ResetPasswordDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  user: UserVO;
}> = ({ open, onClose, onConfirm, user }) => {
  console.log('[ResetPasswordDialog] start...');

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
    setError(validatePassword(value));
  };

  const handleSubmit = async () => {
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onConfirm(password);
      setPassword('');
      setError('');
    } catch (error_) {
      // 处理错误
      console.log('error_:', error_);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>提示</DialogTitle>
      <DialogContent>
        <p>请输入{user?.userName}的新密码</p>
        <TextField
          autoFocus
          margin="dense"
          type="password"
          fullWidth
          variant="outlined"
          value={password}
          onChange={handleInputChange}
          error={!!error}
          slotProps={{
            input: {
              inputProps: {
                maxLength: 20,
              },
            },
          }}
          helperText={error}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button size="small" onClick={handleSubmit} disabled={!!error || !password} variant="contained">
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};
