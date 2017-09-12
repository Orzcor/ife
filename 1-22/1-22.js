;(function IIFE(){
    let button = document.querySelector('#buttonBox')
    let box = document.querySelector('#box')
    let arr = []
    let timer = null

    function preOrder(node){
        if(node){
            arr.push(node)
            preOrder(node.firstElementChild)
            preOrder(node.lastElementChild)
        }
    }

    function inOrder(node){
        if(node){
            inOrder(node.firstElementChild)
            arr.push(node)
            inOrder(node.lastElementChild)
        }
    }

    function postOrder(node){
        if(node){
            postOrder(node.firstElementChild)
            postOrder(node.lastElementChild)
            arr.push(node)
        }
    }

    function render(){
        let i = 0,
            l = arr.length
        arr[i].style.background = 'blue'
        timer = setInterval(function(){
            i++
            if(i < l){
                arr[i - 1].style.background = 'white'
                arr[i].style.background = 'blue'
            }else{
                clearInterval(timer)
                arr[l - 1].style.background = 'white'
            }
        }, 500)
    }

    function reset(){
        arr = []
        clearInterval(timer)
        let divs = document.querySelector('div')
        for(let i = 0, l = divs.length; i < l; i++){
            divs[i].style.background = 'white'
        }
    }

    buttonBox.addEventListener('click', function(e){
        if(e.target && e.target.nodeName === 'INPUT'){
            if(e.target.value === '前序'){
                reset()
                preOrder(box)
                render()
            }
            if(e.target.value === '中序'){
                reset()
                inOrder(box)
                render()
            }
            if(e.target.value === '后序'){
                reset()
                postOrder(box)
                render()
            }
        }
    })
})()




