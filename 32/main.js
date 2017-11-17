let log = console.log.bind(console)

const strategies = {
    isNonEmpty: function(value, errorMsg){
        if(value === ''){
            return errorMsg
        }
    },
    extent: function(value, minLength, maxLength, errorMsg){if(value.length < minLength || value.length > maxLength){
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
    checkout: ['isNonEmpty:用户名不能为空'],
    success: '用户名格式正确',
}, {
    value: '密码',
    elem: 'input',
    type: 'password',
    name: 'pwd',
    checkout: ['isNonEmpty:密码不能为空'],
    success: '密码格式正确',
}, {
    value: '密码确认',
    elem: 'input',
    type: 'password',
    name: 'pwdAffirm',
    checkout: ['isNonEmpty:密码确认不能为空'],
    success: '两次密码一致',
}, {
    value: '邮箱',
    elem: 'input',
    type: 'email',
    name: 'email',
    checkout: ['isNonEmpty:邮箱不能为空'],
    success: '邮箱格式正确',
}, {
    value: '手机',
    elem: 'input',
    type: 'text',
    name: 'phone',
    checkout: ['isNonEmpty:手机不能为空', 'isMobile:手机格式不正确'],
    success: '手机格式正确',
}]


class FormFactory {
    constructor(formData) {
        this.form = null
        this.data = formData
        this.validator = null
        this.checkout = {}
        this.elems = {}
        
        this.init(formData)
    }

    produce(formData) {
        let form = document.createElement('form'),
            button = document.createElement('button')

        button.textContent = '提交'

        let label = document.createElement('label'),
            input = document.createElement('input')

        for(let i = 0, data; data = formData[i++];){
            let box = document.createElement('p'),
                label = document.createElement('strong'),
                elem = document.createElement(data.elem),
                br = document.createElement('br'),
                tip = document.createElement('span')

            label.textContent = `${data.value}：`
            elem.type = data.type
            elem.name = data.name

            box.appendChild(label)
            box.appendChild(elem)
            box.appendChild(br)
            box.appendChild(tip)
    
            this.elems[data.name] = elem
            this.checkout[data.name] = data.checkout

            form.appendChild(box)
        }

        this.form = form
        form.appendChild(button)
        document.body.appendChild(form)
    }

    init() {
        this.produce(this.data)
        this.validator = new Validator(this.elems)
        this.validator.add(this.checkout)
    }
}

class Validator{
    constructor(elems) {
        this.cache = []
        this.elems = elems
    }

    add(checkout) {
        let self = this,
            names = Object.keys(checkout)
        names.forEach(function(item){
            let rules = checkout[item],
                elem = this.elems[item]

            for(let i = 0, l = rules.length; i < l; i++){
                (function(rules, item, elem){
                    let strategyAry = rules[i].split(':')
                    let strategy = strategyAry.shift()

                    self.cache.push(function(){
                        let para = strategyAry.concat()
                        para.unshift(elem.value)
                        return strategies[strategy].apply(null, para)
                    })
                })(rules, item, elem)
            }

        }, this)

    }

    start() {
        for(let i = 0, fn; fn = this.cache[i++];){
            let error = fn()
            if(error){
                return error
            }
        }
    }
}


let form1 = new FormFactory(formData)


form1.form.addEventListener('submit', function(event){
    let error = form1.validator.start()
    if(error){
        log(error)
        event.preventDefault()
        return false
    }
})