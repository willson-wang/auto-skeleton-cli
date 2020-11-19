### auto-skeleton-cli

1. 通过cli的方式自动生成骨架屏
2. 移动端自适应
3. 简单配置即可运行

### 实现思路

1. 根据传入的参数启用无头浏览器
2. 获取指定节点下的所有dom
3. 深度优先遍历指定节点下的所有子节点
4. 过滤display:none、visible:hidden属性的元素; 过滤nodeName === 'STYLE'、 nodeName === 'SCRIPT'等特殊标签；过滤掉宽高为0且没有子元素或者子元素也没有宽高的元素；过滤不在当前可视窗口的标签；
5. 创建一个对象nodeInfo，包含当前节点width、height、left、right等属性的对象
6. 计算当前节点是否在已生成的节点内存在交集的部分，如果没有直接将nodeInfo push到一个包含所有符合条件的sketeNodes节点数组内，如果有交集，则判断交集大小，如果交集比例小于0.05，则认为符合条件，反之不符合条件
7. 根据最终的sketeNodes生成骨架div

### install 

```
yarn add ask-cli -g
yarn add ask-cli --dev
```

### Usage

1. ask init 生成配置文件ask.config.js
2. 根据实际需求修改ask.config.js
3. ask start 开始生成骨架屏

### Examples

基础例子
```
module.exports = {
    "url": "https://m.jd.com/",
    "wrapEle": "body",
    "viewportParams": {
        "width": 375,
        "height": 667,
        "deviceScaleFactor": 1,
        "isMobile": true
    },
    "awaitTime": 3000,
    "launchParams": {
        "headless": true,
        "devtools": false,
        "ignoreHTTPSErrors": false
    },
    "outputFile": {
        "path": "./index.html",
        "wrap": "#app"
    },
    "goToOptions": {
        "waitUntil": 'networkidle0'
    }
}
```

结果如下所示

jd首页

![jd](https://user-images.githubusercontent.com/20950813/99619315-28848d00-2a5e-11eb-883a-a573dbd9d997.gif)


操作节点

```
module.exports = {
    "url": "https://wqs.jd.com/wxsq_project/portal/top-list/hot.html?ptag=137886.4.1&sceneval=2&jxsid=16053264760613346943&cateid=653",
    "wrapEle": "body",
    "outputFile": {
        "path": "./index.html",
        "wrap": "#app"
    },
    "goToOptions": {
        "waitUntil": 'networkidle0'
    },
    deleteNode: (idx, nodeInfo) => {
        // 删除节点
        if (nodeInfo.className === 'jdrank_nav_grid_item_text' || nodeInfo.className === 'jdrank_nav_refresh fade') {
            return true
        }
        return false
    },
    modifyNode: (idx, nodeInfo) => {
        // 修改节点
        if (nodeInfo.className === 'jdrank_nav_scrollbox_item_text') {
            nodeInfo.height = 20
            nodeInfo.top = 50
            return [nodeInfo]
        }
        return []
    },
}
```

jd排行榜

![jd2](https://user-images.githubusercontent.com/20950813/99619335-33d7b880-2a5e-11eb-9186-6bf19d86a40b.gif)



### Params

| 参数	| 说明	 |  类型 | 默认值 | 是否必填 |
| --   | --    |  --   | ---   | ---     |
|url   | 待生成骨架屏的页面地址  | String	 | -- | 是|
|wrapEle | 生成骨架屏的包裹节点  | String    | --  | 是|
| userAgent | 支持自定义userAgent | String  | Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1  | 否|
| viewportParams | 支持自定义viewport | Object | {width: 375,height: 667,deviceScaleFactor: 1,isMobile: true} | 否|
| awaitTime | 导航延时时间  | Number | 0 | 否|
| launchParams | 无头浏览器启动参数 | Object | {headless: true,devtools: false,ignoreHTTPSErrors: false} | 否|
| outputFile | 输出文件地址及骨架屏节点插入的位置 | Object | {path: './index.html',wrap: '#app'} | 否|
| screenshot | 是否生成页面快照 | Object | {open: false,path: './example.png'} | 否 |
| customOverloapping | 自定义节点是否覆盖 | (node: nodeInfo): boolean	 | | 否 |
| deleteNode | 删除某个骨架节点  | (idx: number, node: nodeInfo): node[]	 | -- | 否|
| modifyNode | 修改或插入骨架节点 | (idx: number, node: nodeInfo): node[] | -- | 否|
| goToOptions | 满足什么条件认为页面跳转完成 | Object | {waitUntil: 'load'} | 否|
| css        | 骨架动画、背景色 | Object | {keyframes: '@-webkit-keyframes skeleton {0% {background-position: 100% 50%;}100% {background-position: 0 50%;}};@keyframes skeleton {0% {background-position: 100% 50%;}100% {background-position: 0 50%;}}',animation: '-webkit-animation: skeleton 1.5s ease infinite;animation: skeleton 1.5s ease infinite',background: 'linear-gradient(90deg,#f2f2f2 25%,#e6e6e6 37%,#f2f2f2 63%)'} | 否 |


[puppeteer](https://zhaoqize.github.io/puppeteer-api-zh_CN/)

[chrome启动参数](https://peter.sh/experiments/chromium-command-line-switches/)