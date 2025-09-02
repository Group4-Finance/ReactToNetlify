## 本地測試
npm start
## 建立封包
npm build
## 儲存到gh-pages分支
1. 安裝工具
   
   npm install --save-dev gh-pages

2. 在 package.json 加上設定

<pre>
{
  "homepage": "https://<GitHub使用者名稱 >.github.io/<repo名稱>",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
</pre>

3. 部屬

    npm run deploy
## 設定github pages
點進settings -> 左邊欄位點擊pages -> 設定branch為 gh-pages 分支
