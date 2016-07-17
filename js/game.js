;(function(){

	class Random{
		static get(inicio,final){
			return Math.floor(Math.random() * final ) + inicio;
		}
	}

	function Timer(fn, t) {
	    var timerObj = setInterval(fn, t);

	    this.stop = function() {
	        if (timerObj) {
	            clearInterval(timerObj);
	            timerObj = null;
	        }
	        return this;
	    }

	    // start timer using current settings (if it's not already running)
	    this.start = function() {
	        if (!timerObj) {
	            this.stop();
	            timerObj = setInterval(fn, t);
	        }
	        return this;
	    }

	    // start with new interval, stop current interval
	    this.reset = function(newT) {
	        t = newT;
	        return this.stop().start();
	    }
	}

	class Food{
		constructor(x,y){
			this.x = x;
			this.y = y;
			this.width =10;
			this.height = 10;
		}

		draw(){
			ctx.fillRect(this.x,this.y,this.width,this.height);
		}
		static generate(){
			return new Food(Random.get(0,500),Random.get(0,300));
		}
	}

	class Square{
		constructor(x,y){
			this.x = x;
			this.y = y;
			this.width =10;
			this.height = 10;
			this.back = null //representa el cuadrado que estara por detrás
		}
		draw(){
			ctx.fillRect(this.x,this.y,this.width,this.height);
			if(this.hasback()){
				this.back.draw();
			}
		}

		add(){
			if(this.hasback()){return this.back.add();}
			this.back = new Square(this.x, this.y);
		}

		hasback(){
			return this.back !== null;
		}

		copy(){
			if(this.hasback()){
				this.back.copy();
				this.back.x = this.x;
				this.back.y = this.y;
			}
		}

		right(){
			this.copy();
			this.x += 10;
		}
		left(){
			this.copy();
			this.x -= 10;
		}
		up(){
			this.copy();
			this.y -= 10;
		}
		down(){
			this.copy();
			this.y += 10;
		}
		hit(head,segundo=false){
			if(this === head && !this.hasback()){
				return false;
			}
			if(this === head) return this.back.hit(head,true);
			if(segundo && !this.hasback()) return false;
			if(segundo ) return this.back.hit(head);

			//No es ni la cabeza ni el segundo
			if(this.hasback()){
				return snakeHit(this,head) || this.back.hit(head);
			}

			//Soy el ultimo
			return snakeHit(this,head);
		}
		hitBorder(){
			return this.x > 490 || this.x < 0 || this.y> 290 || this.y < 0

			
		}
	}


	class Snake{
		constructor(){
			this.head = new Square(100,0);
			this.draw();
			this.direction = "right";
			this.head.add();
			this.head.add();
			this.head.add();
			this.head.add();
		}

		draw(){
			this.head.draw();
		}

		right(){
			if(this.direction =='left') return;
			this.direction = "right";
		}

		left(){
			if(this.direction =='right') return;
			this.direction = "left";
		}

		down(){
			if(this.direction =='up') return;
			this.direction = "down";
		}

		up(){
			if(this.direction =='down') return;
			this.direction = "up";
		}

		move(){
			if(this.direction === 'right') return this.head.right();
			if(this.direction === 'left') return this.head.left();
			if(this.direction === 'up') return this.head.up();
			if(this.direction === 'down') return this.head.down();
		}
		eat(){
			this.head.add();
			puntaje += 10;
			showScore();
		}

		dead(){
			return this.head.hit(this.head) || this.head.hitBorder();
			
		}

	}
	function showScore(){
		document.getElementById("puntaje").value = puntaje;
	}

	function hit(a,b){
		var hit=false;
		if(b.x + b.width >= a.x && b.x < a.x + a.width){
			if(b.y + b.height >= a.y && b.y < a.y + a.height){
				hit = true;
			}
		}
		if(b.x <= a.x && b.x + b.width >= a.x + a.width){
			if(b.y <= a.y && b.y + b.height >= a.y+a.height){
				hit = true;
			}
		}
		if(a.x <= b.x && a.x + a.width >= b.x + b.width){
			if(a.y <= b.y && a.y + a.height >= b.y + b.height){
				hit = true;
			}
		}
		return hit;
	}

	const canvas = document.getElementById('canvas');
	const ctx =	canvas.getContext('2d');
	var snake = new Snake();
	const puntaje =  0;
	let foods = [];

	//El evento se deberia poner al canvas, pero como el listener solo empezara a funcionar
	//cuando el foco este dentro del canvas y eso ocurriria cuando el usuario da click dentro de este
	//Por lo tanto se coloca el listener dentro del window
	window.addEventListener("keydown",function(ev){
		if(ev.keyCode > 36 && ev.keyCode < 41){
			ev.preventDefault(); //Nos deshacemos del coportamiendo default de las flechas para los navegadores que es mover los scroll
		}
		if(ev.keyCode === 40) return snake.down();
		if(ev.keyCode === 39) return snake.right();
		if(ev.keyCode === 38) return snake.up();
		if(ev.keyCode === 37) return snake.left();
		return false;
	})

	const animacion = new Timer(function(){
		snake.move();
		ctx.clearRect(0,0,canvas.width,canvas.height);
		snake.draw();
		drawFoods();
		if(snake.dead()){
			displayMessageEndGame();
			animacion.stop();
		}
	},1000/8)

	function displayMessageEndGame(){
		swal({
	      title: "Oops! Perdiste", 
	      text: "Tu Puntaje fue de: " +  puntaje, 
	      type: "warning",
	      showCancelButton: true,
	      closeOnConfirm: true,
	      confirmButtonText: "Volver a Jugar",
	      cancelButtonText: "Cancelar",
	      confirmButtonColor: "#ec6c62"
	    }, function() {
	     	startGame();
	    });
	}

	function startGame(){
		snake = null;
		ctx.clearRect(0,0,canvas.width,canvas.height);
		snake = new Snake();
		animacion.reset(1000/8);
	}

	setInterval(function(){
		const food = Food.generate();
		foods.push(food);
		setTimeout(function(){
			removeFromFoods(food);
		},10000);
	},4000)

	function drawFoods(){
		for(const index in foods){
			const food = foods[index];
			if(typeof food !== 'undefined'){
				food.draw();
				if(hit(food,snake.head)){
					snake.eat();
					removeFromFoods(food);
				}	
			}
			
		}
	}
	function removeFromFoods(food){
		//retorna un nuevo arreglo con los elementos que retornan true de la condicion;
		foods = foods.filter(function(f){
			return food !== f;
		});
	}

	function snakeHit(cuadrado_uni, cuadrado_dos){
		return cuadrado_uni.x == cuadrado_dos.x && cuadrado_uni.y == cuadrado_dos.y;
	}

	document.getElementById("restart").addEventListener("click", startGame);
})();