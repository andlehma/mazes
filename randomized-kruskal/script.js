const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;
let mazeW = mazeH = 10;
let cellW = cellH = canvas.width/mazeW;
let frameLength = 50;

function node(y, x){
	this.y = y;
	this.x = x;
	this.visited = false;
	this.current = false;
	this.walls = [1, 1, 1, 1]; // top right bottom left
	this.closed = function(){
		return this.walls[0] && this.walls[1] && this.walls[2] && this.walls[3];
	}
	this.draw = function(){
		let absX = this.x * cellW;
		let absY = this.y * cellH;
		if (this.current){
			ctx.fillStyle = "#ADD8E6";
			ctx.fillRect(absX, absY, cellW, cellH);
		} else if (this.closed()){
			ctx.fillStyle = "black";
			ctx.fillRect(absX, absY, cellW, cellH);
		} else {
			ctx.lineWidth = 1;
			ctx.strokeStyle = "black";
			ctx.beginPath();
			// up
			if (this.walls[0]){
				ctx.moveTo(absX, absY);
				ctx.lineTo(absX + cellW, absY);
			}
			// right
			if (this.walls[1]){
				ctx.moveTo(absX + cellW, absY);
				ctx.lineTo(absX + cellW, absY + cellH);
			}
			// down
			if (this.walls[2]){
				ctx.moveTo(absX, absY + cellH);
				ctx.lineTo(absX + cellW, absY + cellH);
			}
			// left
			if (this.walls[3]){
				ctx.moveTo(absX, absY);
				ctx.lineTo(absX, absY + cellH);
			}
			ctx.stroke();
		}
	}
}

function drawAll(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	mazeMat.forEach(row => {
		row.forEach(node => {
			node.draw();
		});
	});
}

function getNeighbors(mat, y, x){
	let neighbors = [];
	// up
	if (mat[y-1]){
		if (!mat[y-1][x].visited) neighbors.push(mat[y-1][x]);
	}
	// right
	if (mat[y][x+1]){
		if (!mat[y][x+1].visited) neighbors.push(mat[y][x+1]);
	}
	// down
	if (mat[y+1]){
		if (!mat[y+1][x].visited) neighbors.push(mat[y+1][x]);
	}
	// left
	if (mat[y][x-1]){
		if (!mat[y][x-1].visited) neighbors.push(mat[y][x-1]);
	}
	return neighbors;
}

let mazeMat = [];
function init(){
	mazeW = parseInt(document.getElementById("maze-width").value);
	mazeH = parseInt(document.getElementById("maze-height").value);
	frameLength = parseFloat(-document.getElementById("speed").value) + 900;
	cellW = cellH = canvas.width/mazeW;
	canvas.height = cellW * mazeH;
	mazeMat = [];
	for (let i = 0; i < mazeH; i++){
		let row = [];
		for (let j = 0; j < mazeW; j++){
			row.push(new node(i, j));
		}
		mazeMat.push(row);
	}
}


function allVisited(mat){
	let av = true;
	mat.forEach(row => {
		row.forEach(node =>{
			if (!node.visited){
				av = false;
			}
		});
	});
	return av;
}

function getDir(n1, n2){
	// up
	if (n2.y - n1.y == -1){
		return 0;
	}
	// right
	if (n2.x - n1.x == 1){
		return 1;
	}
	// down
	if (n2.y - n1.y == 1){
		return 2;
	}
	// left
	if (n2.x - n1.x == -1){
		return 3;
	}
	return Error("Error: nodes are not neighbors");
}

function accessMat(mat, i){
	return mat[parseInt(i / mat[0].length)][parseInt((i % mat[0].length))]
}

function disjointFind(sets, x){
	let index;
	sets.forEach(set => {
		if (set.includes(x)){
			index = sets.indexOf(set);
		}
	});
	return index;
}

function union(sets, x, y){
	let x_index = disjointFind(sets, x);
	let x_set = sets[x_index];
	let y_index = disjointFind(sets, y);
	let y_set = sets[y_index];
	let new_set = x_set.concat(y_set);
	y_index = disjointFind(sets, y);
	sets.splice(y_index, 1);
	sets.push(new_set);
}

function generate(mat){
	let height = mat.length;
	let width = mat[0].length;
	let n_walls = ((height - 1) * width) + ((width - 1) * height);
	let walls_per_row = (2 * width) - 1;
	let walls = [];
	let sets = [];
	mat.forEach(row => {
		row.forEach(node => {
			sets.push([node]);
		});
	});
	for (let i = 0; i < n_walls; i++){
		walls.push(i);
	}
	shuffle(walls);
	walls.forEach(wall => {
		let row = parseInt(wall/walls_per_row);
		let col;
		if (row == height - 1){
			col = parseInt(wall % walls_per_row);
		} else {
			col = parseInt(wall % walls_per_row / 2);
		}
		let node = mat[row][col];
		let next;
		if (row == height - 1){
			next = mat[row][col + 1];
		} else {
			if (row % 2 == 0){
				if (wall % 2 == 1){
					next = mat[row][col + 1];
				} else {
					next = mat[row + 1][col];
				}
			} else {
				if (wall % 2 == 1){
					next = mat[row + 1][col];
				} else {
					next = mat[row][col + 1];
				}
			}
		}
		if (disjointFind(sets, node) != disjointFind(sets, next)){
			console.log(wall);
			console.log(node);
			console.log(next);
			node.walls[getDir(node, next)] = 0;
			next.walls[getDir(next, node)] = 0;
			union(sets, node, next);
		}
	});
	drawAll();
}

function run(){
	init();
	generate(mazeMat);
}

function randomInt(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function shuffle(arr){
	for (let i = arr.length - 1; i > 0; i--){
		let j = randomInt(0, i);
		let temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

let myarr = [0, 1, 2, 3, 4, 5, 6];

init();
drawAll();
