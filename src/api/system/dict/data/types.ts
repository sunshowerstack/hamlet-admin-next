export interface DictDataQuery extends PageQuery {
  dictName: string;
  dictType: string;
  dictLabel: string;
}

export interface DictDataVO extends BaseEntity {
  dictCode: string;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  cssClass: string;
  listClass: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  dictSort: number;
  remark: string;
}

export interface DictDataForm {
  dictType?: string;
  dictCode: string | undefined;
  dictLabel: string;
  dictValue: string;
  cssClass: string;
  listClass: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  dictSort: number;
  remark: string;
}
