'use client';

import type { User, VerifyCodeResult } from '@/types/user';
import { login as loginApi, logout as logoutApi, getInfo as getUserInfo } from '@/api/login';
import { LoginData } from '@/api/types';
import { getToken, removeToken, setToken } from '@/utils/auth';
import { to } from 'await-to-js';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
  captcha: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('Admin-Token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(userInfo: LoginData): Promise<any> {
    const [err, res] = await to(loginApi(userInfo));
    console.log('[signInWithPassword] err==', err);
    console.log('[signInWithPassword] res==', res);
    if (res) {
      const data = res.data;
      setToken(data.access_token);
      // return Promise.resolve();
      return;
    }
    // return Promise.reject(err);
    throw err;

    // console.log('[signInWithPassword] start..')
    // console.log('[signInWithPassword] userInfo==', userInfo)
    // // Make API request
    // try {
    //   const res = await loginApi(userInfo); // 直接 await API 调用
    //   console.log('[signInWithPassword] res=====', res)
    //   const data = res.data;
    //   // 保存token到localstorage
    //   setToken(data.access_token);
    //   // token = data.access_token; // 设置响应式 token（如 Vue ref）
    //   return data;
    // } catch (err) {
    //   // 返回 rejected Promise
    //   return Promise.reject(err);
    //   // throw err;
    // }

    // const token = generateToken();
    // localStorage.setItem('custom-auth-token', token);
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('Admin-Token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('Admin-Token');

    return {};
  }
}

export const authClient = new AuthClient();
