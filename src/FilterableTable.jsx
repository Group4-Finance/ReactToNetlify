import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2'; 
import { Chart as ChartJS, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';

// 註冊 Chart.js 所需元件
ChartJS.register(Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

// 定義每個資料庫可用的資料表列表
const dbTables = {
  crawlerDB: ['ETF_historyprice', 'ETF_PremiumDiscount', 'vix'],
  ETF_signal: ['ETF_signal']
  // 可以依需求繼續增加資料庫和對應資料表
};

const tableWithStockId = new Set([
  'ETF_historyprice',
  'ETF_PremiumDiscount',
  'ETF_signal'
])

const tablechartMap ={
  ETF_historyprice : 'Close',
  ETF_PremiumDiscount : 'premium_discount_rate',
  vix : 'Close',
  ETF_signal: '總分'
}
/**
 * DatabaseQuery 元件：  
 * - 單一資料庫 + 資料表查詢區塊  
 * - 包含資料庫選擇、資料表選擇、股票代號與日期條件輸入  
 * - 查詢後呈現對應圖表及表格  
 * 
 * props:
 * - instanceName：此查詢區塊的名稱，方便區分多個查詢區塊
 */
function DatabaseQuery({ instanceName }) {
  // 選擇的資料庫 (預設 DB1)
  const [selectedDatabase, setSelectedDatabase] = useState('crawlerDB');
  // 目前資料庫下可用的資料表清單
  const [availableTables, setAvailableTables] = useState(dbTables['crawlerDB']);
  // 選擇的資料表 (預設第一個)
  const [selectedTable, setSelectedTable] = useState(dbTables['crawlerDB'][0]);
  // 股票代號條件
  const [stockId, setStockId] = useState('');
  // 起始日期條件
  const [startDate, setStartDate] = useState('');
  // 結束日期條件
  const [endDate, setEndDate] = useState('');
  // 查詢回來的資料
  const [data, setData] = useState([]);
  // 載入狀態顯示
  const [loading, setLoading] = useState(false);
  // 錯誤訊息顯示
  const [error, setError] = useState(null);
  // 查詢參數，當它變化時觸發 API 請求
  const [queryParams, setQueryParams] = useState({});

  const [dateOptions, setDateOptions] = useState([]);
  // 當選擇資料庫改變時，更新可用資料表清單和預設資料表
  useEffect(() => {
    setAvailableTables(dbTables[selectedDatabase]);
    setSelectedTable(dbTables[selectedDatabase][0]);
  }, [selectedDatabase]);


  // 當 queryParams 改變時，發送 API 請求取得資料
  useEffect(() => {
    // 沒有設定資料庫或資料表就不查
    if (!queryParams.database || !queryParams.table) return;

    setLoading(true);
    setError(null);

    // 組 API URL，假設格式為 http://ip:port/資料表名稱
    let url = `http://35.206.205.183:8888/${queryParams.table}`;

    // 組查詢參數字串
    const params = [];
    if (tableWithStockId.has(queryParams.table)&&queryParams.stockId){ 
      params.push(`Stock_id=${encodeURIComponent(queryParams.stockId)}`);
    }
    if (queryParams.startDate) 
      params.push(`start_date=${encodeURIComponent(queryParams.startDate)}`);

    if (queryParams.endDate) 
      params.push(`end_date=${encodeURIComponent(queryParams.endDate)}`);

    if (params.length > 0) url += '?' + params.join('&');

    // 發送 GET 請求
    axios.get(url)
      .then(res => {
        // API 回傳的資料放入 data，確保是陣列
        setData(Array.isArray(res.data.data) ? res.data.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('資料讀取失敗');
        setLoading(false);
      });
  }, [queryParams]);

  // 點擊查詢按鈕時，更新 queryParams，觸發 useEffect 發 API
  const handleSearch = () => {
    setQueryParams({
      database: selectedDatabase,
      table: selectedTable,
      stockId,
      startDate,
      endDate,
    });
  };
  const filtdataline = tablechartMap[selectedTable]
  // console.log('API回傳資料:', data);
  console.log(data[0])
  // 組圖表需要的資料格式
  const chartData = filtdataline?{
    labels: data.map(item => item.Date),
    datasets: [{
      label: filtdataline,
      data: data.map(item => {
        const val = item[filtdataline];
        if (typeof val === 'string' && val.endsWith('%')){
          return parseFloat(val.replace('%', ''));
        }
        return typeof val === 'number' ? val : 0;
      }),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      pointRadius: 1,
    }],
  }:null;



  // 圖表設定
  const options = {
    responsive: true,
    plugins: { tooltip: { mode: 'nearest', intersect: false } },
    scales: {
      x: { type: 'category', title: { display: true, text: 'Date' } , ticks:{ autoSkip: true, maxTicksLimit: 10,},},
      y: { title: { display: true, text: 'Close Price' }, ticks: { beginAtZero: false } },
    },
  };

  return (
    <div style={{ border: '1px solid #ccc', margin: 20, padding: 20 }}>
      
      
      <h2>{instanceName} 查詢</h2>

      {/* 資料庫選擇 */}
      <label>
        選擇推薦總分或股票相關分析：
        <select value={selectedDatabase} onChange={e => setSelectedDatabase(e.target.value)} style={{ marginLeft: 10 }}>
          <option valuer=''>請選擇想看的資料</option>
          {Object.keys(dbTables).map(db => (
            <option key={db} value={db}>{db}</option>
          ))}
        </select>
      </label>

      {/* 資料表選擇，依所選資料庫更新 */}
      <label style={{ marginLeft: 20 }}>
        選擇想看的資料：
        <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)} style={{ marginLeft: 10 }}>
          <option value=''>請選擇想看的資料</option>
          {availableTables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
      </label>

      {/* 股票代號、起始日期、結束日期條件輸入 */}
      <div style={{ marginTop: 10 }}>
        {tableWithStockId.has(selectedTable)&&(
        <label>
          股票代號
          <select value={stockId} onChange={e => setStockId(e.target.value)} style={{marginLeft:10}}>
            <option value="">請選擇股票</option>
            <option value="00850">00850</option>
            <option value="00830">00830</option>
            <option value="00757">00757</option>
            <option value="00733">00733</option>
            <option value="00713">00713</option>
            <option value="00692">00692</option>
            <option value="00662">00662</option>
            <option value="00646">00646</option>
            <option value="0052">0052</option>
            <option value="0050">0050</option>
          </select>
        </label>)}
        {/* <label>
          股票代號：
          <input type="text" value={stockId} onChange={e => setStockId(e.target.value)} style={{ marginLeft: 10 }} />
        </label> */}
        <label style={{ marginLeft: 20 }}>
          起始日期：
          <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              min="2020-01-01"
              max="2030-12-31"
          />
        </label>
        <label>
          結束日期:
          <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min="2020-01-01"
              max="2030-12-31"
          />
        </label>
      </div>

      {/* 查詢按鈕 */}
      <button onClick={handleSearch} style={{ marginTop: 10 }}>查詢</button>

      {/* 載入狀態和錯誤訊息 */}
      {loading && <p>資料載入中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 資料不空才顯示圖表和表格 */}
      {data.length > 0 && (
        <>
          {/* 收盤價走勢圖 */}
          <div style={{ width: '800px', height: '300px' }}>
            {chartData && <Line data={chartData} options={options} />}
          </div>
          {/* 表格顯示查詢結果 */}
          {/* <table border="1" cellPadding="5" style={{ marginTop: 20, width: '100%' }}>
            <thead>
              <tr>
                <th>Date</th><th>Stock_id</th><th>Close</th><th>Adj_Close</th><th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id || item.Date + item.Stock_id}>
                  <td>{item.Date}</td>
                  <td>{item.Stock_id}</td>
                  <td>{item.Close}</td>
                  <td>{item.Adj_Close}</td>
                  <td>{item.Volume}</td>
                </tr>
              ))}
            </tbody>
          </table> */}
        </>
      )}
    </div>
  );
}

/**
 * MultiDatabasePage 父元件  
 * - 放兩組 DatabaseQuery 子元件，  
 * - 每組獨立選擇資料庫/資料表並查詢呈現  
 */
export default function MultiDatabasePage() {
  return (
    <div  style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // 每列2個，1fr是平均寬度
  minHeight: '100vh',            // 讓 div 滿版高度
  // backgroundImage: 'url(https://static.accupass.com/userupload/507ec6bbc789402eb2fd2dead11d93bb.jpg)',
  // backgroundSize: 'cover',       // 讓圖片覆蓋整個背景
  // backgroundPosition: 'center',  // 圖片置中
  // backgroundRepeat: 'no-repeat',
  gap: '20px',
  margin: '0px',
  padding: '0px',
  fontSize: '14px',          // 文字小一點
  minWidth: '250px',         // 最小寬度，讓它排得下
  maxWidth: '100%',          // 不超出
  boxSizing: 'border-box',
}}>
      {/* 第一組查詢元件 */}
      <DatabaseQuery instanceName="查詢區1" />
      {/* 第二組查詢元件 */}
      <DatabaseQuery instanceName="查詢區2" />
      {/* 第二組查詢元件 */}
      <DatabaseQuery instanceName="查詢區3" />
      {/* 第二組查詢元件 */}
      <DatabaseQuery instanceName="查詢區4" />
    </div>
  );
}