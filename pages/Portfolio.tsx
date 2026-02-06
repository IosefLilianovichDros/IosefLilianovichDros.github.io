import React, { useState, useEffect, useCallback } from 'react';
import { MY_PORTFOLIO, LivePriceData } from '../data/portfolio';
import { RefreshCw, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const Portfolio: React.FC = () => {
  const [prices, setPrices] = useState<Record<string, LivePriceData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  const convertSymbol = (symbol: string) => {
    const s = symbol.toUpperCase();
    if (s.endsWith('.HK')) return `hk${s.split('.')[0].padStart(5, '0')}`;
    if (s.endsWith('.SS')) return `sh${s.split('.')[0]}`;
    if (s.endsWith('.SZ')) return `sz${s.split('.')[0]}`;
    return `us${s}`;
  };

  const getCurrencyInfo = (symbol: string) => {
    const s = symbol.toUpperCase();
    if (s.endsWith('.HK')) return { label: 'HKD', symbol: 'HK$' };
    if (s.endsWith('.SZ')) {
      if (s.startsWith('200')) return { label: 'HKD', symbol: 'HK$' };
      return { label: 'CNY', symbol: '¥' };
    }
    if (s.endsWith('.SS')) {
      if (s.startsWith('900')) return { label: 'USD', symbol: '$' };
      return { label: 'CNY', symbol: '¥' };
    }
    return { label: 'USD', symbol: '$' };
  };

  const fetchPrices = useCallback(async (isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      const tencentCodes = MY_PORTFOLIO.map(h => convertSymbol(h.symbol)).join(',');
      const targetUrl = `https://qt.gtimg.cn/q=${tencentCodes}`;

      // 按可靠性排序的 CORS 代理列表
      const proxies = [
        {
          name: 'Cloudflare Worker (自建)',
          url: `https://stock-proxy.keanchen1203.workers.dev?url=${encodeURIComponent(targetUrl)}`
        },
        {
          name: 'AllOrigins',
          url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
        },
        {
          name: 'ThingProxy',
          url: `https://thingproxy.freeboard.io/fetch/${targetUrl}`
        },
        {
          name: 'CORS.SH',
          url: `https://cors.sh/${targetUrl}`
        }
      ];

      let response: Response | null = null;
      let lastError: Error | null = null;

      console.log('🔄 开始获取股票数据...');

      for (const proxy of proxies) {
        try {
          console.log(`⏳ 尝试代理: ${proxy.name}`);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

          response = await fetch(proxy.url, {
            signal: controller.signal,
            headers: {
              'Accept': 'text/plain, */*'
            }
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            console.log(`✅ 成功使用代理: ${proxy.name}`);
            break;
          } else {
            console.warn(`❌ ${proxy.name} 返回状态: ${response.status}`);
            response = null;
          }
        } catch (err) {
          lastError = err as Error;
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error(`❌ ${proxy.name} 失败:`, errorMsg);
          continue;
        }
      }

      if (!response || !response.ok) {
        console.error('❌ 所有代理均失败');
        throw lastError || new Error('所有代理均失败');
      }

      const text = await response.text();
      const lines = text.split(';').filter(l => l.trim().length > 0);
      const updatedPrices: Record<string, LivePriceData> = {};

      lines.forEach((line) => {
        const match = line.match(/v_(.*?)=\"(.*?)\"/);
        if (!match) return;
        const tencentKey = match[1];
        const dataFields = match[2].split('~');
        const currentPrice = parseFloat(dataFields[3]);
        const changePercent = parseFloat(dataFields[32]);

        const originalItem = MY_PORTFOLIO.find(h => convertSymbol(h.symbol) === tencentKey);
        if (originalItem) {
          updatedPrices[originalItem.symbol] = {
            symbol: originalItem.symbol,
            price: currentPrice,
            changePercent: changePercent,
            currency: getCurrencyInfo(originalItem.symbol).label
          };
        }
      });
      setPrices(updatedPrices);
      const now = new Date();
      setLastUpdateTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
      if (isManual) {
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
      }
    } catch (err) {
      console.warn('实时行情获取失败:', err);
      setError('实时行情暂时不可用');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const timer = setInterval(() => fetchPrices(false), 30000);
    return () => clearInterval(timer);
  }, [fetchPrices]);

  return (
    <div className="space-y-12 md:space-y-16 animate-page">
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-black">持仓明细</h1>
          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em] flex flex-wrap items-center gap-2">
            Asset Allocation 
            {lastUpdateTime && <span className="text-zinc-300">· {lastUpdateTime}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showFeedback && (
            <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-green-600 hidden sm:block">Updated</span>
          )}
          <button 
            onClick={() => !loading && fetchPrices(true)} 
            disabled={loading}
            className="p-2 text-zinc-300 hover:text-black transition-all active:scale-90"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center space-x-2 text-[11px] text-red-400 font-mono italic bg-red-50/50 p-3 border border-red-100 rounded">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-0 pt-4">
        <div className="hidden md:flex px-2 py-4 text-[10px] font-mono text-zinc-300 uppercase tracking-[0.2em] border-b border-zinc-50">
          <div className="w-48">Asset</div>
          <div className="flex-1 text-center">Weight</div>
          <div className="w-32 text-right">Price</div>
          <div className="w-32 text-right">Change</div>
        </div>

        <div className="divide-y divide-zinc-50">
          {MY_PORTFOLIO.map(item => {
            const priceData = prices[item.symbol];
            const isPositive = priceData ? priceData.changePercent >= 0 : true;
            const currency = getCurrencyInfo(item.symbol);

            return (
              <div key={item.symbol} className="group py-6 md:py-8 flex flex-col md:flex-row md:items-center px-1 hover:bg-zinc-50/50 transition-colors">
                <div className="w-full md:w-48 mb-3 md:mb-0">
                  <div className="font-bold text-base md:text-lg tracking-tight">{item.name}</div>
                  <div className="text-[9px] md:text-[10px] font-mono text-zinc-300 uppercase tracking-widest">{item.symbol}</div>
                </div>

                <div className="flex-1 md:px-8 mb-4 md:mb-0">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="md:hidden text-[9px] font-mono text-zinc-300 uppercase">Weight</span>
                    <span className="text-[11px] md:text-xs font-mono font-bold">{(item.weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-[2px] w-full bg-zinc-100 rounded-full">
                    <div 
                      className="h-full bg-zinc-800 transition-all duration-1000"
                      style={{ width: `${item.weight * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between md:block md:w-32 md:text-right">
                  <span className="md:hidden text-[9px] font-mono text-zinc-300 uppercase">Price</span>
                  <span className="font-mono text-[13px] md:text-sm tracking-tighter text-zinc-700">
                    {priceData && priceData.price > 0 ? (
                      <><span className="text-[10px] text-zinc-400 mr-1">{currency.symbol}</span>{priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
                    ) : <span className="text-zinc-300">---</span>}
                  </span>
                </div>

                <div className="flex justify-between md:block md:w-32 md:text-right mt-2 md:mt-0">
                  <span className="md:hidden text-[9px] font-mono text-zinc-300 uppercase">Change</span>
                  <span className={`font-mono text-[13px] md:text-sm flex items-center md:justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {priceData && priceData.price > 0 ? (
                      <>
                        {isPositive ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                        {isPositive ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />}
                      </>
                    ) : <span className="text-zinc-300">---</span>}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="relative py-12 md:py-20 mt-8 border-t border-zinc-100 flex justify-center">
        <div className="max-w-md text-center space-y-4">
          <p className="italic text-zinc-400 text-base md:text-lg leading-relaxed px-4">
            “Many shall be restored that now are fallen,<br className="hidden md:block" />
            and many shall fall that now are in honor.”
          </p>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-mono text-zinc-300">
            HORACE — ARS POETICA
          </p>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;