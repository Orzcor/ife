;(() => {
    const tip = {
        'username': '长度为4~16个字符',
        'pwd': '6到16位数字和字母组合',
        'pwdAffirm': '重复输入密码',
        'email': 'example@haha.com',
        'phone': '请输入11位手机号码',
    }

    const trueMsg = {
        'pwd': '密码可用',
        'email': '邮箱格式正确',
        'phone': '手机格式正确',
        'username': '名称格式正确',
        'pwdAffirm': '两次密码一致',
    }

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

    const validator = (function(){
        const cache = {}

        function add(doms, rules){
            let key = doms[0].name
            for(let i = 0, rule; rule = rules[i++];){
                ;(function(rule){
                    let strategyAry = rule.strategy.split(':')
                    let errorMsg = rule.errorMsg
                    
                    if(!cache[key]){
                        cache[key] = []
                    }

                    let strategy = strategyAry.shift()
                    for(let i = doms.length, l = 0; i > l; i--){
                        strategyAry.unshift(doms[i - 1].value)
                    }
                    strategyAry.push(errorMsg)

                    cache[key].push(function(){
                        for(let i = doms.length, l = 0; i > l; i--){
                            strategyAry.shift()
                        }
                        for(let i = doms.length, l = 0; i > l; i--){
                            strategyAry.unshift(doms[i - 1].value)
                        }
                        return strategies[strategy].apply(doms[0], strategyAry)
                    })
                })(rule)
            }
        }

        function start(key){
            for(let i = 0, validatorFunc; validatorFunc = cache[key][i++];){
                let errorMsg = validatorFunc()
                if(errorMsg){
                    return errorMsg
                }
            }
        }

        function all(){
            let errors = {}
            for(let key in cache){
                for(let i = 0, validatorFunc; validatorFunc = cache[key][i++];){
                    let errorMsg = validatorFunc()
                    if(errorMsg){
                        errors[key] = errorMsg
                        break
                    }
                }
            }
            return errors
        }

        return {
            'add': add,
            'start': start,
            'all': all
        }
    })()

    
    let registerForm = document.getElementById('register'),
        inputs = document.getElementsByTagName('input'),
        submitBtn = document.getElementById('submitBtn')

    validator.add([registerForm.username], [{
        'strategy': 'isNonEmpty',
        'errorMsg': '姓名不能为空'
    }, {
        'strategy': 'extent:4:16',
        'errorMsg': '长度必须为4~16'
    }])

    validator.add([registerForm.pwd], [{
        'strategy': 'isNonEmpty',
        'errorMsg': '密码不能为空'
    }, {
        'strategy': 'extent:6:16',
        'errorMsg': '密码长度必须为6~16位'
    }, {
        'strategy': 'pwdRule',
        'errorMsg': '密码必须为数字和字母'
    }])

    validator.add([registerForm.pwdAffirm, registerForm.pwd], [{
        'strategy': 'isSame',
        'errorMsg': '两次密码不一致'
    }])

    validator.add([registerForm.email], [{
        'strategy': 'isMail',
        'errorMsg': '邮箱格式不正确'
    }])

    validator.add([registerForm.phone], [{
        'strategy': 'isMobile',
        'errorMsg': '手机格式不正确'
    }])

    ;[].forEach.call(inputs, function(item, i){
        item.addEventListener('focus', function(){
            let msg = validator.start(this.name)
            let hint = this.parentElement.getElementsByTagName('span')[0]
            
            hint.className = 'default'
            hint.textContent = tip[this.name]
        })
        item.addEventListener('blur', function(){
            let msg = validator.start(this.name)
            let hint = this.parentElement.getElementsByTagName('span')[0]
            
            hint.className = msg ? false : true
            hint.textContent = msg ? msg : trueMsg[this.name]
        })
    })

    submitBtn.addEventListener('click', function(e){
        let errors = validator.all()
        let hasProp = false
        for(let key in errors){
            hasProp = true

            let dom = registerForm[key]
            let hint = dom.parentElement.getElementsByTagName('span')[0]
            hint.className = 'false'
            hint.textContent = errors[key]
        }

        if(hasProp){
            e.preventDefault()
        }
    })
})()