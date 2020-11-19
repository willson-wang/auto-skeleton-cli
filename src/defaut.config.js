
module.exports = {
    testUrl: {
        jd: {
            url: 'https://m.jd.com/',
            wrap: 'body'
        },
        jdSearch: {
            url: 'https://so.m.jd.com/webportal/channel/m_category?searchFrom=home',
            wrap: '#body_wrap'
        },
        jdProj: {
            url: 'https://wqs.jd.com/wxsq_project/portal/top-list/hot.html?ptag=137886.4.1&sceneval=2&jxsid=16053264760613346943&cateid=653',
            wrap: 'body'
        }
    },
    currentTestUrl: 'jd',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    viewportParams: {
        width: 375,
        height: 667,
        deviceScaleFactor: 1,
        isMobile: true
    },
    awaitTime: 0,
    launchParams: {
        headless: true,
        devtools: false,
        ignoreHTTPSErrors: false
    },
    outputFile: {
        path: './index.html',
        wrap: '#app'
    },
    screenshot: {
        open: false,
        path: './example.png'
    },
    // 自定义元素是否需要覆盖
    customOverloapping: () => false,
    deleteNode: (idx, nodeInfo) => {
        return false
    },
    modifyNode: (idx, nodeInfo) => {
        return []
    },
    goToOptions: {
        waitUntil: 'load'
    },
    css: {
        keyframes: '@-webkit-keyframes skeleton {0% {background-position: 100% 50%;}100% {background-position: 0 50%;}};@keyframes skeleton {0% {background-position: 100% 50%;}100% {background-position: 0 50%;}}',
        animation: '-webkit-animation: skeleton 1.5s ease infinite;animation: skeleton 1.5s ease infinite',
        background: 'linear-gradient(90deg,#f2f2f2 25%,#e6e6e6 37%,#f2f2f2 63%)'
    }
}