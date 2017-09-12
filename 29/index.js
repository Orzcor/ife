;(() => {
    let registerForm = document.getElementById('register')

    let strategies = {
        isNonEmpty: function(value, errorMsg){
            if(value === ''){
                return errorMsg
            }
        },
        extent: function(value, minLength, maxLength, errorMsg){
            if(value.length < minLength || value.length > maxLength){
                return errorMsg
            }
        }
    }

    class Validator {
        constructor(){
            this.cache = []
        }

        add(dom, rules){
            let self = this
            for(let i = 0, rule; rule = rules[i++];){
                ;(function(rule){
                    let strategyAry = rule.strategy.split(':')
                    let errorMsg = rule.errorMsg

                    self.cache.push(function(){
                        let strategy = strategyAry.shift()
                        strategyAry.unshift(dom.value)
                        strategyAry.push(errorMsg)
                        return strategies[strategy].apply(dom, strategyAry)
                    })
                })(rule)
            }
        }

        start(){
            for(let i = 0, validatorFunc; validatorFunc = this.cache[i++];){
                let errorMsg = validatorFunc()
                if(errorMsg){
                    return errorMsg
                }
            }
        }
    }


    let validataFunc = function(){
        let validator = new Validator()

        validator.add(registerForm.username, [{
            'strategy': 'isNonEmpty',
            'errorMsg': '姓名不能为空'
        }, {
            'strategy': 'extent:4:16',
            'errorMsg': '长度必须为4~16'
        }])

        return validator.start()
    }

    registerForm.usernameBtn.onclick = function(){
        let usernameHint = document.getElementsByName('usernameHint')[0]
        let errorMsg = validataFunc()

        if(errorMsg){
            usernameHint.className = 'usernameErr'
            usernameHint.innerHTML = `${errorMsg}`
            return false
        }

        usernameHint.className = 'usernameTrue'
        usernameHint.innerHTML = `名称格式正确`
    }
})()