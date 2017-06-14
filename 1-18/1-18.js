function addEvent (ele, type, handler) {
	if(ele.addEventListener){
		ele.addEventListener(type, handler, false);
	}else if(ele.attachEvent){
		ele.attachEvent("on" + type, function(){
			handler.apply(ele);
		});
	}else{
		ele[on + "type"] = handler;
	}
}



	var container = document.getElementById("container");
	var buttonList = document.getElementsByTagName("input");

	var queue = {
		str : [],

		leftPush : function (num) {
			this.str.unshift(num);
			this.paint();
		},

		rightPush : function (num) {
			this.str.push(num);
			this.paint();
		},

		isEmpty : function () {
			return (this.str.length == 0);
		},

		leftPop : function () {
			if(!this.isEmpty()){
				console.log(this.str.shift());
				this.paint();
			}else{
				console.log("The queue is already empty!");
			}
		},

		rightPop : function () {
			if(!this.isEmpty()){
				console.log(this.str.pop());
				this.paint();
			}else{
				console.log("The queue is already empty!");
			} 
		},

		paint : function(){
			var strInner = "";
			this.str.forEach(function(item, index){
				strInner += "<div>" + parseInt(item) + "</div>";
			});

			container.innerHTML = strInner;
			buttonList[0].value = "";

			addDivDelEvent();
		},

		deleteID : function (id) {
			console.log(this.str[id]);
			this.str.splice(id, 1);
			this.paint();
		}
	}


	function addDivDelEvent () {
		for(var cur = 0; cur < container.children.length; cur++){
			addEvent(container.children[cur], "click", function(cur){
				return function(){return queue.deleteID(cur)};
			}(cur));
		}
	}
	addDivDelEvent();

	addEvent(buttonList[1], "click", function(){
		var input = buttonList[0].value;
		if((/^[0-9]+$/).test(input)){
			queue.leftPush(input);
		}else{
			console.log("请输入数值");
		}
	});

	addEvent(buttonList[2], "click", function () {
		var input = buttonList[0].value;
		if((/^[0-9]+$/).test(input)){
			queue.rightPush(input);
		}else{
			console.log("请输入数值");
		}
	});

	addEvent(buttonList[3], "click", queue.leftPop.bind(queue));

	addEvent(buttonList[4], "click", queue.rightPop.bind(queue));