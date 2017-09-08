(function IIFE(){
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
     * @description 造船厂
     */
    class Spaceship {
        /**
         * @constructor
         * @param {Number} id 
         */
        constructor (id, spd, charge, discharge) {
            this.id = id,
            this.power = 100,       //飞船初始电量
            this.spd = spd,
            this.charge = charge,
            this.discharge = discharge
            this.currState = 'stop',  //飞船初始状态
            this.orbit = 100 + 50 * id - SPACESHIP_SIZE / 2,     //飞船所在轨道的半径
            this.deg = 0,           //飞船初始位置
            this.timer = null

            mediator.listen(this)   //向mediator注册新飞船
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
         * @description 自爆装置
         * @param {Number} id
         */
        destroy (){
            let num = [],
                index
            for(let i = 0; i < mediator.spaceships.length; i++){
                num.push(mediator.spaceships[i].id)
            }
            index = num.indexOf(this.id)
            if(index === -1){
                return
            }
            let ship = mediator.spaceships.splice(index, 1)
        }

        /**
         * @description 状态系统
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
            return {
                receive: function(msg){
                    let order = self.adapterManager().decoding(msg)
                    if(self.id == order.id && self.currState != order.cmd){
                        self.stateManager().changesState(order.cmd)
                    }
                }
            }
        }

        /**
         * @description 指令系统
         */
        adapterManager () {
            let self = this
            /**
             * @description 解码
             * @param {String} msg 
             * @returns 
             */
            function decoding(msg){
                let id = parseInt(msg.substring(0, 4), 2),
                    cmd
    
                switch(msg.substring(4, 8)){
                    case '0001':
                        cmd = 'fly'
                        break
                    case '0010':
                        cmd = 'stop'
                        break
                    case '0011':
                        cmd = 'destroy'
                        break
                }
                
                return {
                    id: id,
                    cmd: cmd
                }
            }
            
            /**
             * @description 编码
             */
            function encoded(){
                let id = self.id.toString(2),
                    state = self.currState,
                    power = self.power.toString(2)

                for(let i = 4, l = id.length; i > l; i--){
                    id = '0' + id
                }

                switch(state){
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

                for(let i = 8, l = power.length; i > l; i--){
                    power = '0' + power
                }

                return id + state + power
            }

            return {
                decoding: decoding,
                encoded: encoded
            }
        }

        /**
         * @description 信号发射器
         */
        ejector () {

        }
    }


    /**
     * @description mediator广播介质
     */
    const mediator = {
        spaceships: [],
        /**
         * @description 订阅消息
         * @param {String} key - 缓存列表
         * @callback fn 订阅函数
         */
        listen: function(ship){
            this.spaceships.push(ship)
        },

        trigger: function(msg){
            let order = this.adapter(msg)
            let timer = setInterval(function() {
                let success = Math.random() > FAILURE_RATE ? true : false
                if(success){
                    clearTimeout(timer)
                    for(let i = 0; i < this.spaceships.length; i++){
                        this.spaceships[i].signalManager().receive(order)
                    }
                }else{
                    console.log('请求失败')
                }
            }.bind(this), 300)
        },

        create: function(conf){
            let num = [],
                id = 0,
                spd,
                charge,
                discharge

            if(this.spaceships.length >= 4){
                console.log('飞船数量最多为4')
                return
            }
            for(let i = 0; i < this.spaceships.length; i++){
                num.push(this.spaceships[i].id)
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
        },

        /**
         * @description 指令加密
         */
        adapter: function(msg){
            let id = msg.id.toString(2),
                cmd
            for(let i = 4, l = id.length; i > l; i--){
                id = '0' + id
            }

            switch(msg.cmd){
                case 'fly':
                    cmd = '0001'
                    break
                case 'stop':
                    cmd = '0010'
                    break
                case 'destroy':
                    cmd = '0011'
                    break
            }

            return id + cmd
        }
    }

    /**
     * @description 指挥官
     */
    const commander = (function () {
        function create(conf){
            mediator.create(conf)
        }

        function send(msg){
            mediator.trigger(msg)
        }

        return {
            create: create,
            send: send
        }
    })()

    /**
     * @description 动画工具
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
            onDraw(mediator.spaceships);
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

    /**
     * @description 按钮绑定
     */
    const buttonHandler = (function(){
        let createBtn = document.getElementById('createBtn'),
            startBtn = document.getElementById('startBtn'),
            stopBtn = document.getElementById('stopBtn'),
            destroyBtn = document.getElementById('destroyBtn'),
            shipId = document.getElementById('shipId'),

            dynamicBtn = document.getElementsByName('dynamic'),
            dynamic = '',
            powerBtn = document.getElementsByName('power'),
            power = ''

        createBtn.addEventListener('click', function(){
            for(let i = 0; i < 3; i++){
                if(dynamicBtn[i].checked){
                    dynamic = dynamicBtn[i].value
                }
                if(powerBtn[i].checked){
                    power = powerBtn[i].value
                }
            }
            commander.create({'dynamic': dynamic, 'power': power})
        })

        startBtn.addEventListener('click', function(){
            commander.send.call(this, {'id': shipId.selectedIndex, 'cmd': 'fly'})
        })

        stopBtn.addEventListener('click', function(){
            commander.send.call(this, {'id': shipId.selectedIndex, 'cmd': 'stop'})
        })

        destroyBtn.addEventListener('click', function(){
            commander.send.call(this, {'id': shipId.selectedIndex, 'cmd': 'destroy'})
        })
    })()

    window.onload = function(){
        AnimUtil.animLoop()
    }

})()