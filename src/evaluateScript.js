function evaluateScript(...args) {
    const rootNode = args[0]
    const { customOverloapping, deleteNode, modifyNode, viewportParams, css } = args.slice(1)[0]
    const customOverloappingFn = eval(customOverloapping)
    const deleteNodeFn = eval(deleteNode)
    const modifyNodeFn = eval(modifyNode)

    // 覆盖比例
    const coverPercentage = 0.05

    // 手机最终生成的node节点
    const sketeNodes = []
    
    // 获取固定定位元素，将固定定位元素在最后面生成
    const fixedEles = []

    // 对于图片、文本、视频、音频、canvas我们认为是内容元素，直接绘制对应的div
    // 对于有背景图、有背景色的元素页直接绘制对应的div
    const eles = ['IMG', '#text', 'VIDEO', 'AUDIO', 'CANVAS']

    // 记录元素的x、y、width、top等值，用来判断后面生成的元素是否有覆盖到之前的元素
    let recoreXY = []

    function getStyle(ele) {
        return window.getComputedStyle(ele)
    }

    // 判断标签是否有背景图
    function hasBgImage(ele) {
        const cssProps = getStyle(ele)
        return cssProps.backgroundImage !== 'none'
    }

    // 判断标签是否有boder-radius属性
    function hasBorderRadius(ele) {
        const cssProps = getStyle(ele)
        return cssProps.borderRadius !== '0px'
    }

    // 判断标签是否需要直接绘制骨架div
    function shouldCreateSkeletonEle(ele) {
        if (!ele) return false
        const isImageEle = eles.some((e) => {
            return e === ele.nodeName
        })
        return isImageEle || hasBgImage(ele) || hasBorderRadius(ele)
        
    }

    // 判断元素是否在视窗内
    function inViewPort(eleRect) {
        // 通过判断元素的x、y坐标值来判断
        return !(eleRect.x > window.innerWidth || eleRect.right < 0 || eleRect.y > window.innerHeight || eleRect.bottom < 0)
    }

    // 判断标签是否是文本、注释等标签
    function isTxtEtcEle(node) {
        return node.nodeName === '#text' || node.nodeName === '#comment' || node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE' || node.nodeName === 'LINK'
    }

    // 是否是宽高为0且包含有宽高子元素的标签
    function hasChildrenRect(ele, rect) {
        const childNodes = ele.childNodes
        if (!childNodes.length) return false
        if (!rect.width || !rect.height) {
            for (let i = 0; i < childNodes.length; i++) {
                const childNode = childNodes[i]
                if (isTxtEtcEle(childNode)) continue
                const childRect = childNode.getBoundingClientRect()
                if (childRect.width && childRect.height) {
                    return true
                }
            }
        }
        return false
    }

    // display none width 0 height 0 visible: hidden 视窗之外的元素都直接过滤调
    function isHideEle(ele) {
        // 过滤特殊标签
        if (!ele || isTxtEtcEle(ele)) return true
        const cssProps = getStyle(ele)
        const isDisplayNone = cssProps.display === 'none'
        const isVisibleHiden = cssProps.visibility === 'hidden'
        if (isDisplayNone || isVisibleHiden) return true

        // 判断宽高为0，但是有子元素的场景
        const rect = ele.getBoundingClientRect()
        if ((!rect.width || !rect.height) && !hasChildrenRect(ele, rect)) return true
        
        // 判断标签是否在可视窗口内
        if (!inViewPort(rect)) return true
    }

    // 如果该节点有多个子元素，且一级子元素内有文本节点，则直接拿该元素生成骨架节点
    function hasTextChildrenNode(childrenNodes) {
        if (!childrenNodes.length) return false
        let flag = false
        for(let i = 0; i < childrenNodes.length; i++) {
            if (childrenNodes[i] && childrenNodes[i].nodeName === '#text' && childrenNodes[i].nodeValue.trim().length) {
                flag = true
                break
            }
        }
        return flag
    }

    function pxToVW(px) {
        const { width } = viewportParams
        return (px/width*100).toFixed(3)
    }

    function pxToVH(px) {
        const { height } = viewportParams
        return (px/height*100).toFixed(3)
    }

    // 将px转化为vw、vh
    function transfromPxToVW(nodeInfo) {
        const { top, left, width, height } = nodeInfo
        nodeInfo.top = pxToVH(top)
        nodeInfo.left = pxToVW(left)
        nodeInfo.width = pxToVW(width)
        nodeInfo.height = pxToVH(height)
        return nodeInfo
    }

    function createStyle() {
        return `<style>${css.keyframes}._{position:absolute;z-index:999;background: ${css.background};${css.animation};background-size: 400% 100%;}.__{top:0%;left:0%;width:100%;}</style>`
    }

    function createWrapDiv() {
        return `<div style="position: fixed; width: 100%; height: 100%; background: #fff; left: 0; top: 0">`
    }

    function createWrapEndDiv() {
        return `</div>`
    }

    function composeStyle({left, top, width, height, borderRadius, backgroundColor}) {
        let style = `left: ${left}vw; top: ${top}vh; width: ${width}vw; height: ${height}vh;`
        if (borderRadius) {
            style += `border-radius: ${borderRadius}px;`
        }
        if (backgroundColor) {
            style += `background: ${backgroundColor};`
        }
        return style
    }

    function createDiv(info) {
        const style = composeStyle(info)
        return `<div class="_" style="${style}"></div>`
    }

    function createFixedWrapEle(info) {
        const style = composeStyle(info)
        return `<div style="position: absolute; z-index: 999; ${style}"></div>`
    }

    function isOverloapping({x, y, right, bottom, node }) {
        // 需要过滤重叠元素，通过坐标值来进行比对过滤，当 已知某个元素x0  < x < 已知某个元素x1,已知某个元素y0  < x < 已知某个元素y1
        let flag = false
        const cssProps = getStyle(node) 
        for(let i = 0; i < recoreXY.length; i++) {
            const record = recoreXY[i]
            const xPercentage = (Math.min(right, record.xmax) - Math.max(x, record.xmin)) / (Math.max(right, record.xmax) - Math.min(x, record.xmin))
            const yPercentage = (Math.min(bottom, record.ymax) - Math.max(y, record.ymin)) / (Math.max(bottom, record.ymax) - Math.min(y, record.ymin))
            const allPercentage = xPercentage * yPercentage * 100
            if (!(right <= record.xmin || x >= record.xmax) && !(bottom <= record.ymin || y >= record.ymax) && allPercentage > coverPercentage) {
                flag = true
                break
            }
        }

        // 如果有覆盖且borderRadius有值，还是需要生成骨架div
        if (flag && cssProps.borderRadius !== '0px') {
            flag = false
        }
        
        if (!flag) {
            recoreXY.push({
                xmin: x,
                xmax: right,
                ymin: y,
                ymax: bottom,
                className: node.className
            })
        }
        return flag
    }

    function createSkeletonEle(node, isFixedWrapEle = false) {
        if (!node) return
        const {top, left, right, width, height, x, y, bottom } = node.getBoundingClientRect()
        if (!isFixedWrapEle && !customOverloappingFn(node) && isOverloapping({ x, y, right, bottom, node })) {
            return
        }

        const cssProps = getStyle(node)

        const info = {
            top,
            left,
            right,
            width,
            height,
            borderRadius: parseInt(cssProps.borderRadius),
            isFixedWrapEle,
            className: node.className || '',
            id: node.id
        }
        if (isFixedWrapEle) {
            info.backgroundColor = '#fff'
        }
        sketeNodes.push(info)
    }


    let _html = createStyle() + createWrapDiv()
    const childNodes = rootNode.childNodes
    if (!childNodes) {
        return Promise.resolve('')
    }

    function traviseNode(nodes, isFixed = false) {
        for (let i = 0; i < nodes.length; i++) {
            if (isHideEle(nodes[i])) continue
            const cssProps = getStyle(nodes[i])
            // 固定定位元素，直接过滤，先不生成骨架div
            if (cssProps.position === 'fixed') {
                if (!isFixed) {
                    fixedEles.push(nodes[i])
                    continue
                } else {
                    createSkeletonEle(nodes[i], true)
                }
            }
            if (shouldCreateSkeletonEle(nodes[i])) {
                createSkeletonEle(nodes[i])
                // 当前元素被生成了div之后，子元素就不需要生成了
                continue
            } 
            const _childNodes = nodes[i].childNodes
            if (_childNodes.length === 1 && _childNodes[0].nodeName === '#text' && _childNodes[0].nodeValue.trim().length) {
                createSkeletonEle(nodes[i])
            } else if (hasTextChildrenNode(_childNodes)) {
                createSkeletonEle(nodes[i])
            } else if (_childNodes.length > 0) {
                traviseNode(_childNodes, isFixed)
            }
        }
    }

    traviseNode(childNodes, false)

    recoreXY = []
    traviseNode(fixedEles, true)

    for (let k = 0; k < sketeNodes.length; k++) {
        let currentNode = sketeNodes[k]

        // 允许删除节点
        if (deleteNodeFn(k, sketeNodes[k])) {
            continue
        }

        // 允许在某个节点上或者下添加自定义节点,或者修改某个节点
        const newNodes = modifyNodeFn(k, sketeNodes[k])
        newNodes.length && sketeNodes.splice(k, 1, ...newNodes)
        
        if (newNodes.length === 1) {
            currentNode = newNodes[0]
        }

        let {isFixedWrapEle, borderRadius} = currentNode

        const {top, left, width, height} = transfromPxToVW(currentNode)

        const temp = {
            top,
            left,
            width,
            height,
            borderRadius,
            backgroundColor: isFixedWrapEle ? '#fff' : ''
        }
        const tempCreate = isFixedWrapEle ? createFixedWrapEle : createDiv
        _html += tempCreate(temp)
    }

    _html += createWrapEndDiv()

    return Promise.resolve(_html)

}

module.exports = evaluateScript
