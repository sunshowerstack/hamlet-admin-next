export interface LoginInfoVO {
  infoId: string | number;
  tenantId: string | number;
  userName: string;
  clientKey: string;
  deviceType: string;
  status: string;
  ipaddr: string;
  loginLocation: string;
  browser: string;
  os: string;
  msg: string;
  loginTime: string;
}

export interface LoginInfoQuery extends PageQuery {
  ipaddr: string;
  userName: string;
  status: string;
  orderByColumn: string;
  isAsc: string;
  // 业务常用的时间范围查询
  beginTime?: string;
  endTime?: string;
}
