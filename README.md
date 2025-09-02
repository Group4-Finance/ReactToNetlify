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
  "homepage": "https://Group4-Finance.github.io/ReactToNetlify",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
</pre>

3. 部屬

    npm run deploy
