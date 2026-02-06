export interface StockHolding {
  symbol: string;
  name: string;
  weight: number;
}

export interface LivePriceData {
  symbol: string;
  price: number;
  changePercent: number;
  currency: string;
}

/**
 * 极简持仓配置
 */
export const MY_PORTFOLIO: StockHolding[] = [
  { symbol: '0700.HK', name: '腾讯控股', weight: 0.20 },
  { symbol: '600519.SS', name: '贵州茅台', weight: 0.15 },
  { symbol: '200596.SZ', name: '古井贡 B', weight: 0.15 },
  { symbol: '900905.SS', name: '老凤祥 B', weight: 0.10 },
  { symbol: '000651.SZ', name: '格力电器', weight: 0.12 },
  { symbol: '000001.SZ', name: '平安银行', weight: 0.01 }
];
