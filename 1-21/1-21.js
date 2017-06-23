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

function splitInput (text) {
	var inputArr = [];
	inputArr = text.split(/[^0-9a-zA-Z\u4e00-\u9fa5]+/).filter(function (item) {
		return item.length !== 0;
	});
	return inputArr;
}

	var container = document.getElementById("container");
	var buttonList = document.getElementsByTagName("input");
	var oText = document.getElementById("inputBox");

	var queue = {
		str : [],

		leftPush : function (arr) {
			for(var i = arr.length - 1; i >= 0; i--){
				this.str.unshift(arr[i]);
			}
			this.paint();
		},

		rightPush : function (arr) {
			for(var i = 0; i < arr.length; i++){
				this.str.push(arr[i]);
			}
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

		paint : function(str){
			var strInner = "";

			if(str){
				strInner = this.str.map(function(e){
					var repText = e.replace(new RegExp(str, "g"), "<span class='z-sch'>" + str + "</span>");
					return "<div>" + repText + "</div>";
				}).join("");

				container.innerHTML = strInner;
				return ;
			}

			this.str.forEach(function(item, index){
				strInner += "<div>" + item + "</div>";
			});

			container.innerHTML = strInner;

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

	function searchDivContent (text) {
		if(text.trim() == "" || container.children.length <= 1){
			return false;
		}
		
		queue.paint(text);
	}

	addEvent(buttonList[0], "click", function(){
		var input = splitInput(oText.value.trim());
		queue.leftPush(input);
	});

	addEvent(buttonList[1], "click", function () {
		var input = splitInput(oText.value.trim());
		queue.rightPush(input);
	});

	addEvent(buttonList[2], "click", queue.leftPop.bind(queue));

	addEvent(buttonList[3], "click", queue.rightPop.bind(queue));

	addEvent(buttonList[5], "click", function(){
		var inputValue = buttonList[4].value;
		searchDivContent(inputValue);
		addDivDelEvent();
	});