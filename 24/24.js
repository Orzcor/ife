;(function IIFE(){
    let box = document.querySelector('#box'),
        select = box.parentElement,
        addStr = document.querySelector('#addStr'),
        addNodeBtn = document.querySelector('#addNode'),
        removeNodeBtn = document.querySelector('#removeNode')

    box.addEventListener('click', function(e){
        boxClick(e)
    }.bind(this))

    function boxClick(e){
        select.style.background = 'white'
        if(e.target === select){
            select = box.parentElement
            return
        }
        select = e.target
        select.style.background = 'red'
    }

    function addNode(){
        let value = addStr.value
        if(!value){
            return
        }
        let oDiv = document.createElement('div')
        oDiv.textContent = value
        select.appendChild(oDiv)
    }

    function removeNode(){
        select.parentNode.removeChild(select)
    }

    addNodeBtn.addEventListener('click', addNode)
    removeNodeBtn.addEventListener('click', removeNode)





    function ergodic(btn, eachType, schInput){
        this.arr = []
        this.timer = null
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
                this.schInput ? this.render(this.schInput.value) : this.render()
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

        render(text = ''){
            let i = 0,
                l = this.arr.length
            this.arr[i].style.background = 'blue'
            this.timer = setInterval(function(){
                if(text){
                    if(this.search(this.arr[i], text)){
                        console.log('找到了！')
                        this.arr[i].style.color = 'white'
                        clearInterval(this.timer)
                        return
                    }
                }
                i++
                if(i < l){
                    this.arr[i - 1].style.background = 'white'
                    this.arr[i].style.background = 'blue'
                }else{
                    clearInterval(this.timer)
                    this.arr[l - 1].style.background = 'white'
                }
            }.bind(this), 500)
        },

        search(node, text){
            if(node.firstChild.nodeValue.trim() === text){
                return true
            }
        },

        reset(){
            this.arr = []
            clearInterval(this.timer)
            let divs = document.querySelector('div')
            for(let i = 0, l = divs.length; i < l; i++){
                divs[i].style.background = 'white'
            }
        }
    }
    
    new ergodic('DFBtn', 'traverseDF')
    new ergodic('BFBtn', 'traverseBF')
    new ergodic('schDFBtn', 'traverseDF', 'schBox')
    new ergodic('schBFBtn', 'traverseBF', 'schBox')
})()




