import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken } from '@/utils/auth';
import { tansParams, blobValidate } from '@/utils/common';
import { HttpStatus } from '@/enums/resp-enum';
import { errorCode } from '@/utils/error-code';
import { encryptBase64, encryptWithAes, generateAesKey, decryptWithAes, decryptBase64 } from '@/utils/crypto';
import { encrypt, decrypt } from '@/utils/jsencrypt';
import { logout } from '@/api/login';
import { showToast } from '@/utils/toast';
import FileSaver from 'file-saver';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

const encryptHeader = 'encrypt-key';
// let downloadLoadingInstance: LoadingInstance;
// 是否显示重新登录
export const isRelogin = { show: false };
export const globalHeaders = () => {
  return {
    Authorization: 'Bearer ' + getToken(),
    clientid: process.env.NEXT_PUBLIC_APP_CLIENT_ID,
  };
};

console.log('process.env.NEXT_PUBLIC_APP_CLIENT_ID===', process.env.NEXT_PUBLIC_APP_CLIENT_ID);
console.log('process.env.NEXT_PUBLIC_API_BASE_URL===', process.env.NEXT_PUBLIC_API_BASE_URL);

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers['clientid'] = process.env.NEXT_PUBLIC_APP_CLIENT_ID || '';
// 创建 axios 实例
const service = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10_000,
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 对应国际化资源文件后缀
    // config.headers['Content-Language'] = getLanguage();

    const isToken = config.headers?.isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = config.headers?.repeatSubmit === false;
    // 是否需要加密
    const isEncrypt = config.headers?.isEncrypt === 'true';

    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken(); // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }

    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: Date.now(),
      };
    }
    if (process.env.VITE_APP_ENCRYPT === 'true') {
      // 当开启参数加密
      if (isEncrypt && (config.method === 'post' || config.method === 'put')) {
        // 生成一个 AES 密钥
        const aesKey = generateAesKey();
        config.headers[encryptHeader] = encrypt(encryptBase64(aesKey));
        config.data =
          typeof config.data === 'object'
            ? encryptWithAes(JSON.stringify(config.data), aesKey)
            : encryptWithAes(config.data, aesKey);
      }
    }
    // FormData数据去请求头Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    if (process.env.VITE_APP_ENCRYPT === 'true') {
      // 加密后的 AES 秘钥
      const keyStr = res.headers[encryptHeader];
      // 加密
      if (keyStr != null && keyStr != '') {
        const data = res.data;
        // 请求体 AES 解密
        const base64Str = decrypt(keyStr);
        // base64 解码 得到请求头的 AES 秘钥
        const aesKey = decryptBase64(base64Str.toString());
        // aesKey 解码 data
        const decryptData = decryptWithAes(data, aesKey);
        // 将结果 (得到的是 JSON 字符串) 转为 JSON
        res.data = JSON.parse(decryptData);
      }
    }
    // 未设置状态码则默认成功状态
    const code = res.data.code || HttpStatus.SUCCESS;
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default'];
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data;
    }
    if (code === 401) {
      console.log('[request] 401');
      // prettier-ignore
      if (!isRelogin.show) {
        console.log('isRelogin:',isRelogin);
        isRelogin.show = true;
        // 使用新的确认对话框系统
        try {
          isRelogin.show = false;

          // 服务端销毁token
          logout().then(() => {
            // router.replace('/auth/sign-in');
            // userRouter只能用在react函数组件里，普通js/ts方法内部都无法使用
            // 所以用最基本的location的方式
            globalThis.location.href = '/auth/sign-in';
            console.log('[request] logout success');
          });
          localStorage.removeItem('Admin-Token');
        } catch (error) {
          console.error('[request] 显示确认对话框失败:', error);
          isRelogin.show = false;
        }
      }
      const authMsg = '无效的会话，或者会话已过期，请重新登录。';
      showToast(authMsg, ToastLevelEnum.WARNING, 5000);
      return Promise.reject(new Error(authMsg));
    }
    console.log('[request] code:', code, ', msg:', msg);
    if (code === HttpStatus.SERVER_ERROR) {
      showToast(msg, ToastLevelEnum.ERROR, 5000);
      return Promise.reject(new Error(msg));
    }
    if (code === HttpStatus.WARN) {
      showToast(msg, ToastLevelEnum.WARNING, 4000);
      return Promise.reject(new Error(msg));
    }

    if (code === HttpStatus.SUCCESS) {
      // axios默认返回的key值：data:
      return Promise.resolve(res.data);
    }
    // 业务类校验错误提示：比如"内置参数不能删除"等 code是自定义的比如：1_002_024_000
    showToast(msg, ToastLevelEnum.WARNING, 4000);
    return Promise.reject(new Error(msg));
  },
  (error: any) => {
    let { message } = error;
    if (message == 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.slice(-3) + '异常';
    }
    showToast(message, ToastLevelEnum.ERROR, 5000);
    return Promise.reject(error);
  }
);

// 通用下载方法;
export function download(url: string, params: any, fileName: string) {
  // downloadLoadingInstance = ElLoading.service({ text: '正在下载数据，请稍候', background: 'rgba(0, 0, 0, 0.7)' });
  // prettier-ignore
  return service.post(url, params, {
      transformRequest: [
        (params: any) => {
          return tansParams(params);
        }
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    }).then(async (resp: any) => {
      const isLogin = blobValidate(resp);
      if (isLogin) {
        const blob = new Blob([resp]);
        FileSaver.saveAs(blob, fileName);
      } else {
        const resText = await resp.data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        // ElMessage.error(errMsg);
      }
      // downloadLoadingInstance.close();
    }).catch((error: any) => {
      console.error(error);
      // ElMessage.error('下载文件出现错误，请联系管理员！');
      // downloadLoadingInstance.close();
    });
}

// 导出 axios 实例
export default service;
