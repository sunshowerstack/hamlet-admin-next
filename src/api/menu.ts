import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 获取路由
export function getRouters(): AxiosPromise<[]> {
  return request({
    url: '/system/menu/getRouters',
    method: 'get',
  });
}
