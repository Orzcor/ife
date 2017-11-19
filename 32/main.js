let log = console.log.bind(console)

const strategies = {
    isNonEmpty: function(value, errorMsg){
        if(value === ''){
            return errorMsg
        }
    },
    extent: function(value, minLength, maxLength, errorMsg){
        if(value.length < minLength || value.length > maxLength){
            return errorMsg
        }
    },
    pwdRule: function(value, errorMsg){
        if(value.match(/^[a-zA-Z0-9]$/)){
            return errorMsg
        }
    },
    isSame: function(value, value2, errorMsg){
        if(value !== value2){
            return errorMsg
        }
    },
    isMail: function(value, errorMsg){
        if (!/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(value)){
            return errorMsg
        }
    },
    isMobile: function(value, errorMsg){
        if (!/(^1[3|5|8][0-9]{9}$)/.test(value)){
            return errorMsg
        }
    }
}

let formData = [{
    value: '用户名',
    elem: 'input',
    type: '',
    name: 'username',
    checkout: [{
        'strategy': 'isNonEmpty',
        'errorMsg': '用户名不能为空'
    }],
    success: '用户名格式正确',
}, {
    value: '密码',
    elem: 'input',
    type: 'password',
    name: 'pwd',
    checkout: [{
        'strategy': 'isNonEmpty',
        'errorMsg': '密码不能为空'
    }],
    success: '密码格式正确',
}, {
    value: '密码确认',
    elem: 'input',
    type: 'password',
    name: 'pwdAffirm',
    same: 'password',
    checkout: [{
        'strategy': 'isNonEmpty',
        'errorMsg': '密码确认不能为空'
    }, {
        'strategy': 'isSame',
        'errorMsg': '两次密码不一致',
        'relevance': 'pwd'
    }],
    success: '两次密码一致',
}, {
    value: '邮箱',
    elem: 'input',
    type: 'text',
    name: 'email',
    checkout: [{
        'strategy': 'isNonEmpty',
        'errorMsg': '邮箱不能为空'
    }, {
        'strategy': 'isMail',
        'errorMsg': '邮箱格式不正确'
    }],
    success: '邮箱格式正确',
}, {
    value: '手机',
    elem: 'input',
    type: 'text',
    name: 'phone',
    checkout: [{
        'strategy': 'isNonEmpty',
        'errorMsg': '手机不能为空'
    }, {
        'strategy': 'isMobile',
        'errorMsg': '手机格式不正确',
    }],
    success: '手机格式正确',
}]


class FormFactory {
    constructor(data) {
        this.value = data.value
        this.elem = data.elem
        this.dom = null
        this.type = data.type
        this.name = data.name
        this.Validator = null
        this.checkout = data.checkout
        this.domBox = null

        this.init()
    }

    //生成DOM节点
    produceDom() {
        let dom = document.createElement(this.elem)
        dom.type = this.type
        dom.name = this.name

        this.dom = dom
    }

    addRule() {
        this.validator = new Validator()

        this.validator.add(this.dom, this.checkout, this.relevance)
    }

    render() {
        let domBox = {}

        let box = document.createElement('p'),
            label = document.createElement('strong'),
            br = document.createElement('br'),
            tip = document.createElement('span')

        label.textContent = `${this.value}：`

        box.appendChild(label)
        box.appendChild(this.dom)
        box.appendChild(br)
        box.appendChild(tip)

        domBox['box'] = box
        domBox['label'] = label
        domBox['dom'] = this.dom
        domBox['tip'] = tip
        this.domBox = domBox

        return domBox
    }

    bindEvent() {
        this.dom.addEventListener('blur', function(event){
            let errorMsg = this.validator.start()
            if(errorMsg){
                this.domBox.tip.textContent = `${errorMsg}`
            }else{
                this.domBox.tip.textContent = ``
            }
        }.bind(this))
    }

    init() {
        this.produceDom()
        this.addRule()
    }
}




class Validator {
    constructor() {
        this.cache = []
    }

    add(dom, checkout, relevance = null) {
        for(let i = 0, l = checkout.length; i < l; i++){
            let rule = checkout[i],
                strategyAry = rule['strategy'].split(':'),
                strategy = strategyAry.shift(),
                errorMsg = rule['errorMsg'],
                relevance = rule['relevance']

            strategyAry.push(errorMsg)

            this.cache.push(function(){
                let para = strategyAry.concat()

                let value = dom.value,
                    relevanceDom

                if(relevance){
                    relevanceDom = document.getElementsByName(relevance)[0]
                    para.unshift(relevanceDom.value)
                }

                para.unshift(value)
                return strategies[strategy].apply(null, para)
            })
        }
    }

    start() {
        for(let i = 0, l = this.cache.length; i < l; i++){
            let fn = this.cache[i],
                errorMsg = fn()
            if(errorMsg){
                return errorMsg
            }
        }
    }
}

let form1 = document.createElement('form')
for(let i = 0, l = formData.length; i < l; i++){
    let domObj = new FormFactory(formData[i]),
        domBox = domObj.render()
    
    domObj.bindEvent()
    form1.appendChild(domBox.box)
}

document.body.appendChild(form1)





// class FormFactory {
//     constructor(formData) {
//         this.form = null
//         this.data = formData
//         this.validator = null
//         this.checkout = {}
//         this.elems = {}
        
//         this.init(formData)
//     }

//     produce(formData) {
//         let form = document.createElement('form'),
//             button = document.createElement('button')

//         button.textContent = '提交'

//         let label = document.createElement('label'),
//             input = document.createElement('input')

//         for(let i = 0, data; data = formData[i++];){
//             let box = document.createElement('p'),
//                 label = document.createElement('strong'),
//                 elem = document.createElement(data.elem),
//                 br = document.createElement('br'),
//                 tip = document.createElement('span')

//             label.textContent = `${data.value}：`
//             elem.type = data.type
//             elem.name = data.name

//             box.appendChild(label)
//             box.appendChild(elem)
//             box.appendChild(br)
//             box.appendChild(tip)
    
//             this.elems[data.name] = elem
//             this.checkout[data.name] = data.checkout

//             form.appendChild(box)
//         }

//         this.form = form
//         form.appendChild(button)
//         document.body.appendChild(form)
//     }

//     binding() {
//         let elems = Object.keys(this.elems)
//         for(let i = 0, l = elems.length; i < l; i++){
//             let elem = elems[i]
//             this.elems[elem].addEventListener('blur', (function(validator){
//                 return function(){
//                     let error = validator.start(this.name)
//                     let tip = this.parentElement.querySelector('span')
//                     if(error){
//                         tip.textContent = `${error}`
//                     }else{
//                         tip.textContent = ''
//                     }
//                 }
//             })(this.validator))
//         }
//     }

//     init() {
//         this.produce(this.data)
//         this.validator = new Validator(this.elems)
//         this.validator.add(this.checkout)
//         this.binding()
//     }
// }

// class Validator{
//     constructor(elems) {
//         this.cache = {}
//         this.elems = elems
//     }

//     add(checkout) {
//         let self = this,
//             names = Object.keys(checkout)

//         names.forEach(function(item){
//             let rules = checkout[item],
//                 elem = this.elems[item]

//             if(!self.cache[item]){
//                 self.cache[item] = []
//             }

//             for(let i = 0, l = rules.length; i < l; i++){
//                 (function(rules, item, elem){
//                     let strategyAry = rules[i].split(':')
//                     let strategy = strategyAry.shift()

//                     self.cache[item].push(function(){
//                         let para = strategyAry.concat()
//                         para.unshift(elem.value)
//                         return strategies[strategy].apply(null, para)
//                     })
//                 })(rules, item, elem)
//             }

//         }, this)

//     }

//     start(key) {
//         let rules = this.cache[key]
//         for(let i = 0, fn; fn = rules[i++];){
//             return fn()
//         }
//     }

//     all() {
//         let keys = Object.keys(this.cache)
//         for(let i = 0, l = keys.length; i < l; i++){
//             let key = keys[i]
//             let rules = this.cache[key]
//             for(let j = 0, fn; fn = rules[j++];){
//                 let error = fn()
//                 if(error) return error
//             }
//         }
        
//     }
// }


// let form1 = new FormFactory(formData)


// form1.form.addEventListener('submit', function(event){
//     let error = form1.validator.all()
//     if(error){
//         log(error)
//         event.preventDefault()
//         return false
//     }
// })






