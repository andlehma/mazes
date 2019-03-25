// randomized version of a depth-first search algorithm
// starting from one cell of the grid, randomly move
// in any valid direction until a cell is found with no
// valid neighbors. backtrack until an unvisited valid
// cell is available, repeat until every cell is visited

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
			ctx.fillStyle = "#ADD8E6"
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

function generate(mat){
	let curr = mat[0][0];
	curr.visited = true;
	let queue = [];
	function Iterate(){
		curr.current = false;
		if (!allVisited(mat)){
			neighbors = getNeighbors(mat, curr.y, curr.x);
			if (neighbors.length > 0){
				next = neighbors[randomInt(0, neighbors.length - 1)];
				queue.push(curr);
				curr.walls[getDir(curr, next)] = 0;
				next.walls[getDir(next, curr)] = 0;
				next.visited = true;
				curr = next;
			} else if (queue.length > 0){
				curr = queue.pop();
			}
			curr.current = true;
			drawAll();
			setTimeout(()=>{Iterate()}, frameLength);
		} else {
			// open top left and bottom right
			mat[0][0].walls[3] = 0;
			mat[mat.length - 1][mat[mat.length - 1].length - 1].walls[1] = 0;
			// clear the blue square
			curr.current = false;
			drawAll();
		}
	}
	Iterate();
}

function run(){
	init();
	generate(mazeMat);
}

function randomInt(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

init();
drawAll();
