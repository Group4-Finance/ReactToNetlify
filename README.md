## 本地測試
npm start
## 建立封包
npm build
## 儲存到gh-pages分支
1. npm install --save-dev gh-pages

2. 在 package.json 加上設定

   {
  "homepage": "https://<你的 GitHub 用戶名>.github.io/<repo名>/",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}

3. npm run deploy
