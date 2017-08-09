let data = {
    'root': {
        'Cor': {
            'Jason': {
                'Apple': {},
                'coc': {}
            },
            'boot': {
                'boy': {
                    'girl': {}
                },
                'teach': {},
                'touch': {}
            }
        },
        'home' : {
            'ball': {
                'kill': {}
            },
            'child': {
                'ssl': {},
                'money': {}
            }
        },
        'Bboy': {

        }
    }
}

;(function IIFE(){
    let box = document.querySelector('#box')

    /* 渲染树🌲函数 */
    function treeRender(data, parentElement){
        let key,
            treeView
        for(key in data){
            if(data.hasOwnProperty(key)){
                treeView = document.createElement('div')
                treeView.textContent = key
                treeView.className = 'off'

                if(isEmptyObject(data[key])){
                    treeView.className = ''
                }

                parentElement.appendChild(treeView)
                treeRender(data[key], treeView)
            }
        }
    }
    treeRender(data, box)


    let select = box.parentElement, //当前选中的节点
        addStr = document.querySelector('#addStr'),
        addNodeBtn = document.querySelector('#addNode'),
        removeNodeBtn = document.querySelector('#removeNode')


    /* 点击节点高亮 */
    function boxClick(e){
        select.style.color = 'black'
        if(e.target === select){
            select = box.parentElement
            return
        }
        select = e.target
        select.style.color = 'red'
    }

    /* 点击节点展开与折叠 */
    function show(e){
        let target = e.target
        if(target.className !== ''){
            target.className = target.className === 'on' ? 'off' : 'on'
        }
    }

    /* 指定节点展开 */
    function showNode(node){
        if(node.parentElement.id === 'box'){
            return
        }
        if(node.parentElement.className !== 'on'){
            showNode(node.parentElement)
        }
        node.parentElement.className = 'on'
    }

    box.addEventListener('click', function(e){
        boxClick(e)
        show(e)
    }.bind(this))


    /* 增加节点 */
    function addNode(){
        let value = addStr.value
        if(!value){
            return
        }
        let oDiv = document.createElement('div')
        oDiv.textContent = value
        select.appendChild(oDiv)
        if(select.className == '' || 'off'){
            select.className = 'on'
        }
    }


    /* 删除节点 */
    function removeNode(){
        if(select.parentElement.childElementCount - 1 === 0){
            select.parentElement.className = ''
        }
        select.parentNode.removeChild(select)
    }

    addNodeBtn.addEventListener('click', addNode)
    removeNodeBtn.addEventListener('click', removeNode)

    /* 构造函数 */
    function ergodic(btn, eachType, schInput){
        this.arr = []
        this.BFindex = 0

        this.btn = document.querySelector(`#${btn}`)
        this.eachType = eachType
        this.schInput = schInput ? document.querySelector(`#${schInput}`) : null

        this.init()
    }

    ergodic.prototype = {
        constractor: ergodic,

        init(){
            this.btn.addEventListener('click', function(){
                this.reset()
                this[this.eachType](box)
                this.render(this.schInput.value)
            }.bind(this))
        },
        
        /* 深度遍历 */
        traverseDF(node){
            if(node){
                this.arr.push(node)
                for(let i = 0, l = node.children.length; i < l; i++){
                    this.traverseDF(node.children[i])
                }
            }
        },

        /* 广度遍历 */
        traverseBF(node){
            if (node) {
                this.arr.push(node)
                this.traverseBF(node.nextElementSibling)
                node = this.arr[this.BFindex++]
                this.traverseBF(node.firstElementChild)
            }
        },

        /* 渲染函数 */
        render(text = ''){
            for(let i = 0, l = this.arr.length; i < l; i++){
                if(this.search(this.arr[i], text)){
                    showNode(this.arr[i])
                    console.log('找到了！')
                    this.arr[i].style.color = 'orange'
                }
            }
        },

        search(node, text){
            if(node.textContent.trim() === text){
                return true
            }
        },

        reset(){
            this.arr = []
            this.BFindex = 0
        }
    }
    
    new ergodic('schDFBtn', 'traverseDF', 'schBox')
    new ergodic('schBFBtn', 'traverseBF', 'schBox')




    
    function isEmptyObject(e){
        // let t
        // for(t in e){
        //     return false
        // }
        // return true

        if(Object.keys(e).length){
            return false
        }
        return true
    }
})()