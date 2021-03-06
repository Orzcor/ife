;(function IIFE(){
    let SPACESHIP_SPEED = 2,    //飞船飞行速度
        SPACESHIP_SIZE = 40,    //飞船大小
        SPACESHIP_COUNT = 4,    //飞船数量
        DEFAULT_CHARGE_RATE = 0.2,      //飞船充电速率
        DEFAULT_DISCHARGE_RATE = 0.5,   //飞船放电速率

        SCREEN_WIDTH = 600,     //canvas宽度
        SCREEN_HEIGHT = 500,    //canvas高度
        SCREEN_CENTER_X = SCREEN_WIDTH / 2,     //屏幕X轴中心坐标
        SCREEN_CENTER_Y = SCREEN_HEIGHT / 2,    //屏幕Y轴中心坐标

        SPACESHIP_SPEED_SLOW = 0.5,     //慢速飞行
        SPACESHIP_SPEED_MEDIUM = 2,     //中速飞行
        SPACESHIP_SPEED_FAST = 5,       //快速飞行

        CHARGE_RATE_SLOW = 0.1,         //慢速充电
        CHARGE_RATE_MEDIUM = 0.4,       //中速充电
        CHARGE_RATE_FAST = 1,           //快速充电

        DISCHARGE_RATE_SLOW = 0.2,      //慢速放电
        DISCHARGE_RATE_MEDIUM = 0.4,    //中速放电
        DISCHARGE_RATE_FAST = 0.7,      //快速放电

        POWERBAR_POS_OFFSET = 5,    //电量条位置位移
        POWERBAR_COLOR_GOOD = '#70ed3f',    //电量良好的状态颜色
        POWERBAR_COLOR_MEDIUM = '#fccd1f',  //电量一般状态颜色
        POWERBAR_COLOR_BAD = '#fb0000',     //电量差状态颜色
        POWERBAR_WIDTH = 5,         //电量条宽度

        PLANET_RADIUS = 60,     //行星半径
        ORBIT_COUNT = 4,        //轨道数量
        FAILURE_RATE = 0.1      //消息发送失败率


    /**
     * @description 行星上的造船厂
     */
    class Spaceship {
        /**
         * Creates an instance of Spaceship.
         * @param {any} id - 飞船序列号
         * @param {any} spd - 飞行速度
         * @param {any} charge - 飞行能耗
         * @param {any} discharge - 飞船充电速率
         * 
         * @memberOf Spaceship
         */
        constructor(id, spd, charge, discharge){
            this.id = id,
            this.power = 100,       //飞船初始电量
            this.spd = spd,
            this.charge = charge,
            this.discharge = discharge
            this.currState = 'stop',  //飞船初始状态
            this.orbit = 100 + 50 * id - SPACESHIP_SIZE / 2,     //飞船所在轨道的半径
            this.deg = 0,           //飞船初始位置
            this.adapter = new Adapter()
            this.timer = null

            BUS.register(this)
            this.signalManager().ejector()
        }

        /**
         * @description 飞船动力系统，控制飞船的飞行以及停止
         */
        dynamicManager () {
            let self = this
            const fly = function(){
                self.timer = setInterval(function(){
                    if(self.deg >= 360){
                        self.deg = 0
                    }
                    self.deg += self.spd
                }, 20)
            }

            const stop = function(){
                clearInterval(self.timer)
            }

            return {
                fly: fly,
                stop: stop
            }
        }

        /**
         * @description 能源系统，控制飞船能源
         */
        powerManager () {
            let self = this
            /**
             * @description 充电
             */
            const charge = function(){
                let timer = setInterval(function(){
                    if(self.currState == 'fly' || self.currState == 'destroy'){
                        clearInterval(timer)
                        return
                    }
                    if(self.power >= 100){
                        clearInterval(timer)
                        self.power = 100
                        return
                    }
                    self.power += self.charge
                }, 20)
            }

            /**
             * @description 放电
             */
            const discharge = function(){
                let timer = setInterval(function(){
                    if(self.currState == 'stop' || self.currState == 'destroy'){
                        clearInterval(timer)
                        return
                    }
                    if(self.power <= 0){
                        clearInterval(timer)
                        self.stateManager().changesState('stop')
                        self.power = 0
                        return
                    }
                    self.power -= self.discharge
                }, 20)
            }

            return {
                charge: charge,
                discharge: discharge
            }
        }
        
        /**
         * @description 状态系统，控制飞船状态进行运作
         */
        stateManager () {
            let self = this
            let states = {
                fly: function(){
                    self.currState = 'fly'
                    self.dynamicManager().fly()
                    self.powerManager().discharge()
                },
                stop: function(){
                    self.currState = 'stop'
                    self.dynamicManager().stop()
                    self.powerManager().charge()
                },
                destroy: function(){
                    self.currState = 'destroy'
                    self.power = 0
                    self.destroy()
                }
            }

            let changesState = function(state){
                states[state] && states[state]()
            }

            return {
                changesState: changesState
            }
        }

        /**
         * @description 信号系统
         */
        signalManager () {
            let self = this

            /**
             * @description 接受信号装置
             * @param {any} code 
             */
            const receive = function(code){
                let msg = self.adapter.decoding(code)
                if(self.id == msg.id && self.currState != msg.state){
                    self.stateManager().changesState(msg.state)
                }
            }

            /**
             * @description 信号发射器
             */
            const ejector = function () {
                let timer = setInterval(function(){
                    if(self.currState === 'destroy'){
                        clearInterval(timer)
                    }
                    
                    let msg = self.adapter.encoded({id: self.id, state: self.currState, power: self.power})
                    BUS.transmit(msg, receiver)
                }, 300)
            }
            
            return {
                receive: receive,
                ejector: ejector
            }
        }

        /**
         * @description 自爆装置
         */
        destroy () {
            BUS.remove(this.id)
        }
    }
    
    
    /**
     * @description Adapter适配器
     */
    class Adapter {
        constructor(){
        }

        /**
         * @description 加密
         * @memberOf Adapter
         */
        encoded(msg){
            let id = msg.id.toString(2),
                state,
                power
            for(let i = 4, l = id.length; i > l; i--){
                id = '0' + id
            }

            switch(msg.state){
                case 'fly':
                    state = '0001'
                    break
                case 'stop':
                    state = '0010'
                    break
                case 'destroy':
                    state = '1100'
                    break
            }

            if(msg.power){
                power = parseInt(msg.power).toString(2)
                for(let i = 8, l = power.length; i > l; i--){
                    power = '0' + power
                }

                return id + state + power
            }

            return id + state
        }

        /**
         * @description 解密
         * @memberOf Adapter
         */
        decoding(code){
            let id = parseInt(code.substring(0, 4), 2),
                state = code.substring(4, 8),
                power = parseInt(code.substring(8, 16), 2)

            switch(state){
                case '0001':
                    state = 'fly'
                    break
                case '0010':
                    state = 'stop'
                    break
                case '1100':
                    state = 'destroy'
                    break
            }
            
            return {
                id: id,
                state: state,
                power: power
            }
        }
    }


    /**
     * @description 行星上的发射器（指挥官）
     */
    const emitter = (function(){
        const adapter = new Adapter()

        /**
         * @description 传播消息
         * @param {*} msg 
         * @param {*} to 
         */
        const send = (msg) => {
            let code = adapter.encoded(msg)
            BUS.transmit(code)
        }

        /**
         * @description 直接通知造船厂造飞船，无需通过BUS介质
         */
        const create = (conf) => {
            let spaceships = BUS.getSpaceships(),
                num = [],
                id = 0,
                spd,
                charge,
                discharge

            if(spaceships.length >= 4){
                console.log('飞船数量最多为4')
                return
            }
            for(let i = 0; i < spaceships.length; i++){
                num.push(spaceships[i].id)
            }
            for(let i = 0; i < 4; i++){
                if(num.indexOf(i) === -1){
                    id = i
                    break
                }
            }

            switch(conf.dynamic){
                case 'slow':
                    spd = SPACESHIP_SPEED_SLOW
                    discharge = DISCHARGE_RATE_SLOW
                    break
                case 'medium':
                    spd = SPACESHIP_SPEED_MEDIUM
                    discharge = DISCHARGE_RATE_MEDIUM
                    break
                case 'fast':
                    spd = SPACESHIP_SPEED_FAST
                    discharge = DISCHARGE_RATE_FAST
                    break
            }

            switch(conf.power){
                case 'slow':
                    charge = CHARGE_RATE_SLOW
                    break
                case 'medium':
                    charge = CHARGE_RATE_MEDIUM
                    break
                case 'fast':
                    charge = CHARGE_RATE_FAST
                    break
            }

            new Spaceship(id, spd, charge, discharge)
        }

        /**
         * @description 指令按钮绑定
         */
        (function buttonHandle(){
            let orderBox = document.getElementById('orderBox'),
                createBtn = document.getElementById('createBtn'),
                shipId = document.getElementById('shipId'),


                dynamicBtn = document.getElementsByName('dynamic'),
                powerBtn = document.getElementsByName('power'),
                dynamic = '',
                power = ''

            orderBox.addEventListener('click', function(e){
                if(e.target.nodeName === 'BUTTON'){
                    switch(e.target.value){
                        case 'fly':
                            send({'id': shipId.selectedIndex, 'state': 'fly'})
                            break
                        case 'stop':
                            send({'id': shipId.selectedIndex, 'state': 'stop'})
                            break
                        case 'destroy':
                            send({'id': shipId.selectedIndex, 'state': 'destroy'})
                            break

                    }
                }
            })

            createBtn.addEventListener('click', function(){
                for(let i = 0; i < 3; i++){
                    if(dynamicBtn[i].checked){
                        dynamic = dynamicBtn[i].value
                    }
                    if(powerBtn[i].checked){
                        power = powerBtn[i].value
                    }
                }
                emitter.create({'dynamic': dynamic, 'power': power})
            })
        })()

        return {
            create: create
        }
    })()
    
    
    /**
     * @description 行星上的接收器
     */
    const receiver = (function(){
        const receive = function(code){
            DC.saveState(code)
        }

        return {
            receive: receive
        }
    })()


    /**
     * @description 新一代传播介质BUS
     */
    const BUS = (function(){
        let spaceships = []

        const register = function(obj){
            if(obj instanceof Spaceship){
                spaceships.push(obj)
            }
        }

        const getSpaceships = function(){
            return spaceships
        }

        const transmit = function(code, to){
            let self = this,
                adapter = new Adapter(),
                spaceships = BUS.getSpaceships(),
                timer = null
            timer = setInterval(function(){
                let success = Math.random() > FAILURE_RATE ? true : false
                if(success){
                    clearInterval(timer)
                    if(to){
                        to.receive(code)
                    }else{
                        for(let i = 0; i < spaceships.length; i++){
                            spaceships[i].signalManager().receive(code)
                        }
                    }
                }
            }, 300)
        }

        const remove = function(id){
            let num = [],
                index
            for(let i = 0; i < spaceships.length; i++){
                num.push(spaceships[i].id)
            }
            index = num.indexOf(id)
            if(index === -1){
                return
            }
            delete spaceships[index]
            let ship = spaceships.splice(index, 1)
        }

        return {
            register: register,
            getSpaceships: getSpaceships,
            transmit: transmit,
            remove: remove
        }
    })()


    /**
     * @description 数据处理中心
     */
    const DC = (function(){
        const showState = document.getElementById('showState'),
            stateList = [],
            adapter = new Adapter()

        /**
         * @description 保存飞船数据
         * @param {Object} msg 
         */
        const saveState = function(code){
            let num = [],
                msg = adapter.decoding(code),
                l = stateList.length

            for(let i = 0; i < l; i++){
                num.push(stateList[i].id)
            }
            let index = num.indexOf(msg.id)

            if(msg.state === 'destroy'){
                stateList.splice(index, 1)
                console.log(stateList)
            }else{

                if(l < 4 && index === -1){
                    stateList.push(msg)
                }else{
                    stateList[index].state = msg.state
                    stateList[index].power = msg.power
                }
            }

            drawState()
        }

        const drawState = function(){
            showState.innerHTML = ''

            for(let i = 0, l = stateList.length; i < l; i++){
                let box = document.createElement('div')
                box.className = 'stateBox'

                let num = document.createElement('p'),
                    state = document.createElement('p')
                    
                num.textContent = `${stateList[i].id + 1}号飞船`
                state.innerHTML = `状态：<span>${stateList[i].state}</span> 电量：<span>${stateList[i].power}%</span>`

                box.appendChild(num)
                box.appendChild(state)
                showState.appendChild(box)
            }
        }

        return {
            saveState: saveState
        }
    })()



    /**
     * @description 动画模块
     */
    const AnimUtil = (function(){
        const canvas = document.getElementById('screen')
        canvas.width = SCREEN_WIDTH
        canvas.height = SCREEN_HEIGHT
        let ctx = canvas.getContext('2d')   //获取屏幕画布
        
        let cacheCanvas = document.createElement('canvas')
        cacheCanvas.width = SCREEN_WIDTH
        cacheCanvas.height = SCREEN_HEIGHT
        let cacheCtx = cacheCanvas.getContext('2d') //生成缓存画布

        let timer = null

        /**
         * @description 画行星
         */
        var drawPlanet = function(_ctx) {
            var x = SCREEN_CENTER_X - PLANET_RADIUS;
            var y = SCREEN_CENTER_Y - PLANET_RADIUS;
            var planet = new Image();
            planet.src = "./img/blackhole.png";
            planet.onload = function() {
                _ctx.drawImage(planet, x, y, PLANET_RADIUS * 2, PLANET_RADIUS * 2);
            };
        };

        /**
         * [drawOrbit 画飞船轨道]
         * @param  {[type]} _ctx [目标画布]
         * @return {[type]}      [description]
         */
        var drawOrbit = function(_ctx) {
            for (var i = 0; i < ORBIT_COUNT; i++) {
                _ctx.strokeStyle = "#eee";
                _ctx.beginPath();
                _ctx.arc(SCREEN_CENTER_X, SCREEN_CENTER_Y, 100 + 50 * i, 0, 2 * Math.PI);
                _ctx.closePath();
                _ctx.stroke();
            }
        };

        /**
         * [动画更新时背景不用刷新，因此仅仅在初始化时绘制一次在background画布上的背景，减少计算量。background画布位于screen画布下面，通过css中z-index属性进行叠加]
         * @return {[type]} [description]
         */
        (function() {
            var canvas = document.getElementById("canvasBg");
            canvas.width = SCREEN_WIDTH;
            canvas.height = SCREEN_HEIGHT;
            var _ctx = canvas.getContext("2d");
            // _ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            drawPlanet(_ctx);
            drawOrbit(_ctx);
        })();

        /**
         * [drawSpaceship 画飞船]
         * @param  {[type]} _ctx      [目标画布,这里的画布是缓存画布]
         * @param  {[type]} spaceship [飞船]
         * @return {[type]}           [绘画成功返回true，失败返回false]
         */
        var drawSpaceship = function(_ctx, spaceship) {
            var spaceshipImg = new Image(); //创建飞船贴图
            spaceshipImg.src = "./img/min-iconfont-rocket-active.png";
            spaceshipImg.onload = function() { //当飞船贴图加载后开始在画布上画(由于onload是异步进行的，所以执行顺序上会不是太清晰)
                try { //由于存在获取不了画布的情况产生错误，因此采用try..catch将错误丢弃
                    _ctx.save(); //保存画布原有状态

                    // _ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                    _ctx.translate(SCREEN_CENTER_X, SCREEN_CENTER_Y); //更改画布坐标系，将画布坐标原点移到画布中心
                    _ctx.rotate(-spaceship.deg * Math.PI / 180); //根据飞船飞行角度进行画布旋转

                    //画电量条，根据电量状态改变颜色
                    _ctx.beginPath();
                    if (spaceship.power > 60) {
                        _ctx.strokeStyle = POWERBAR_COLOR_GOOD;
                    } else if (spaceship.power <= 60 && spaceship.power >= 20) {
                        _ctx.strokeStyle = POWERBAR_COLOR_MEDIUM;
                    } else {
                        _ctx.strokeStyle = POWERBAR_COLOR_BAD;
                    }
                    _ctx.lineWidth = POWERBAR_WIDTH;
                    _ctx.moveTo(spaceship.orbit, -POWERBAR_POS_OFFSET);
                    _ctx.lineTo(spaceship.orbit + SPACESHIP_SIZE * (spaceship.power / 100), -POWERBAR_POS_OFFSET);
                    _ctx.stroke();

                    _ctx.drawImage(spaceshipImg, spaceship.orbit, 0, SPACESHIP_SIZE, SPACESHIP_SIZE); //画飞船贴图
                    _ctx.restore(); //恢复画布到原有状态
                    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
                    ctx.drawImage(cacheCanvas, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); //将缓存画布内容复制到屏幕画布上
                    return true;
                } catch (error) {
                    return false;
                }
            };
        };

        /**
         * [onDraw 绘制屏幕画布]
         * @param  {[type]} spaceships [飞船队列]
         * @return {[type]}            [description]
         */
        var onDraw = function(spaceships) {
            if (!(spaceships === undefined || spaceships.every(function(item, index, array) {
                    return item === undefined; //判断飞船队列是否存在，以及飞船队列是否为空；若不是则执行下面步骤
                }))) {
                cacheCtx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); //每次更新清空缓存画布
                for (var i = 0; i < spaceships.length; i++) { //迭代绘制飞船
                    if (spaceships[i] !== undefined) {
                        drawSpaceship(cacheCtx, spaceships[i]);
                    }
                }
            } else {
                ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
            }
        };

        /**
         * [animLoop 动画循环]
         * @return {[type]} [description]
         */
        var animLoop = function() {
            requestAnimationFrame(animLoop);
            onDraw(BUS.getSpaceships());
        };


        /**
         * [setMediator  为AnimUtil设置Mediator，通过mediator保存的状态控制动画更新]
         * @param {[type]} _mediator [description]
         */
        var setMediator = function(_mediator) {
            mediator = _mediator;
        };

        return {
            setMediator: setMediator,
            animLoop: animLoop
        };
    })()


    window.onload = function(){
        AnimUtil.animLoop()
    }
})()