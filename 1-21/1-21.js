// function addEvent (ele, type, handler) {
// 	if(ele.addEventListener){
// 		ele.addEventListener(type, handler, false);
// 	}else if(ele.attachEvent){
// 		ele.attachEvent("on" + type, function(){
// 			handler.apply(ele);
// 		});
// 	}else{
// 		ele[on + "type"] = handler;
// 	}
// }

// function splitInput (text) {
// 	var inputArr = [];
// 	inputArr = text.split(/[^0-9a-zA-Z\u4e00-\u9fa5]+/).filter(function (item) {
// 		return item.length !== 0;
// 	});
// 	return inputArr;
// }

// 	var textInput = document.getElementById("textInput");
// 	var hobbyInput = document.getElementById("hobbyInput");

// 	var textBox = document.getElementById("container");
// 	var hobbyBox = document.getElementsByTagName("input");

// 	var hobbyBtn = document.getElementById("hobbyBtn");

// 	var queue = {
// 		str : [],

// 		push : function (arr) {
// 			for(var i = 0; i < arr.length; i++){
// 				this.str.push(arr[i]);
// 			}
// 			this.paint();
// 		},

// 		rightPop : function () {
// 			if(!this.isEmpty()){
// 				console.log(this.str.pop());
// 				this.paint();
// 			}else{
// 				console.log("The queue is already empty!");
// 			} 
// 		},

// 		paint : function(str){
// 			var strInner = "";

// 			if(str){
// 				strInner = this.str.map(function(e){
// 					var repText = e.replace(new RegExp(str, "g"), "<span class='z-sch'>" + str + "</span>");
// 					return "<div>" + repText + "</div>";
// 				}).join("");

// 				container.innerHTML = strInner;
// 				return ;
// 			}

// 			this.str.forEach(function(item, index){
// 				strInner += "<div>" + item + "</div>";
// 			});

// 			container.innerHTML = strInner;

// 			addDivDelEvent();
// 		},
 
// 		deleteID : function (id) {
// 			console.log(this.str[id]);
// 			this.str.splice(id, 1);
// 			this.paint();
// 		}
// 	}

// 	function addDivDelEvent () {
// 		for(var cur = 0; cur < container.children.length; cur++){
// 			addEvent(container.children[cur], "click", function(cur){
// 				return function(){return queue.deleteID(cur)};
// 			}(cur));
// 		}
// 	}

// 	function searchDivContent (text) {
// 		if(text.trim() == "" || container.children.length <= 1){
// 			return false;
// 		}
		
// 		queue.paint(text);
// 	}

// 	// addEvent(textInput, "");

// 	addEvent(hobbyBtn, "click", function(){
// 		console.log("i am hobbyBtn");
// 	});


;(function IIFE(){
	let Regular = /[^0-9a-zA-Z\u4e00-\u9fa5]+/,
		Regular2 = /[&\|\\\*^%'".+_=,;}{?><~`$#@\s/-]/ig,
		Regular3 = /[,\s\n]+/


	function Queue (input, output, button){
		this.input = document.querySelector(`#${input}`)
		this.output = document.querySelector(`#${output}`)
		this.button = document.querySelector(`#${button}`)
		this.arr = []

		this.button ? this.init('buttonEvent') : this.init('keyEvent')
	}

	Queue.prototype = {
		constructor: Queue,

		init: function(type){
			this.setQueue(type)
		},

		setArr: function(num){
			this.arr.splice(0, num)
			this.render()
		},

		render: function(){
			let num = 0
			this.output.innerHTML = ''
			for(let i = 0, l = this.arr.length; i < l; i++){
				if(l > 10){
					this.setArr(l - 10)
					return
				}else{
					this.output.innerHTML += `<span index="${i}">${this.arr[i]}</span>`
				}
			}
		},

		setText: function(e){
			if(e.target && e.target.nodeName === 'SPAN'){
				switch(e.type){
					case 'mouseover':
						e.target.textContent = `删除：${e.target.textContent}`
						break
					case 'mouseout':
						e.target.textContent = e.target.innerHTML.replace('删除：', '')
						break
					case 'click':
						this.output.removeChild(e.target)
						let index = e.target.getAttribute('index')
						this.arr.splice(index, 1)
						this.render()
						break
				}
			}
		},

		addTag: function(e){
			if(Regular3.test(e.target.value) || e.keyCode == 13){
				let str = e.target.value.replace(Regular2, '')
				this.arr.push(str)
				this.arr = this.arr.unique()
				e.target.value = ''
				this.render()
			}
		},

		addHobby: function(){
			let str = this.input.value.trim()
			this.input.value = ''
			let data = str.split(Regular).filter((e) => e.length !== 0)
			this.arr = this.arr.concat(data).unique()
			this.render();
		},

		setQueue: function(type){
			addEvent(this.output, 'mouseover', this.setText)
			addEvent(this.output, 'mouseout', this.setText)
			addEvent(this.output, 'click', this.setText.bind(this))

			if(type === 'buttonEvent'){
				addEvent(this.button, 'click', this.addHobby.bind(this))
			}else{
				addEvent(this.input, 'keyup', this.addTag.bind(this))
			}
		}
	}

	if(!Array.prototype.unique){
		Array.prototype.unique = function(){
			let res = []
			this.forEach((item, i) => res.indexOf(item) === -1 ? res.push(item) : '')
			return res
		}
	}

	function addEvent (ele, type, handler) {
		if(ele.addEventListener){
			ele.addEventListener(type, handler, false)
		}else if(ele.attachEvent){
			ele.attachEvent("on" + type, function(){
				handler.apply(ele)
			})
		}else{
			ele[on + "type"] = handler
		}
	}

	window.Queue = Queue
})()

new Queue('tagInput', 'tagBox')
new Queue('hobbyInput', 'hobbyBox', 'hobbyBtn')