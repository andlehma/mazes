// randomized version of kruskal's minimum spanning tree algorithm
// creates a list of walls and a list containing a disjoint set for
// each cell. for each wall in some random order, if the cells belong
// to separate disjoint sets, remove the wall and join the sets
// containing each cell.

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

function drawAll(mat){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	mat.forEach(row => {
		row.forEach(node => {
			node.draw();
		});
	});
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

function getDir(n1, n2){
	// up
	if (n2.y - n1.y === -1){
		return 0;
	}
	// right
	if (n2.x - n1.x === 1){
		return 1;
	}
	// down
	if (n2.y - n1.y === 1){
		return 2;
	}
	// left
	if (n2.x - n1.x === -1){
		return 3;
	}
	return Error("nodes are not neighbors");
}

function disjointSet(value){
	this.value = value;
	this.parent = this;
	this.rank = 0;

	this.find = function(){
		let parent = this.parent;
		if (parent !== this){
			this.parent = parent.find();
		}
		return this.parent;
	}

	this.union = function(s){
		let thisParent = this.find();
		let sParent = s.find();

		if (thisParent === sParent){
			return;
		}
		if (thisParent.rank < sParent.rank){
			thisParent.parent = sParent;
		} else if (thisParent.rank > sParent.rank){
			sParent.parent = thisParent;
		} else {
			sParent.parent = thisParent;
			thisParent.rank += 1;
		}
	}
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
			sets.push(new disjointSet(node));
		});
	});
	for (let i = 0; i < n_walls; i++){
		walls.push(i);
	}
	shuffle(walls);
	function Iterate(){
		if (walls.length > 0){
			let wall = walls.pop();
			let row = parseInt(wall/walls_per_row);
			let col;
			if (row === height - 1){
				col = parseInt(wall % walls_per_row);
			} else {
				col = parseInt(wall % walls_per_row / 2);
			}
			let currVal = mat[row][col];
			let currSet = sets.find((element) => {return element.value === currVal})
			currVal.current = true;
			let nextVal;
			if (row === height - 1){
				nextVal = mat[row][col + 1];
			} else {
				// for even rows, even numbers are bottom walls
				// and odd numbers are side (right) walls
				if (row % 2 === 0){
					if (wall % 2 === 1){
						nextVal = mat[row][col + 1];
					} else {
						nextVal = mat[row + 1][col];
					}
				} else {
				// for odd rows, odd numbers are bottom walls
				// and even numbers are side (right) walls
					if (wall % 2 === 1){
						nextVal = mat[row + 1][col];
					} else {
						nextVal = mat[row][col + 1];
					}
				}
			}
			let nextSet = sets.find((element) => {return element.value === nextVal});
			nextVal.current = true;
			if (currSet.find() != nextSet.find()){
				currVal.walls[getDir(currVal, nextVal)] = 0;
				nextVal.walls[getDir(nextVal, currVal)] = 0;
				currSet.union(nextSet);
			}
			drawAll(mazeMat);
			currVal.current = false;
			nextVal.current = false;
			setTimeout(()=>{Iterate()}, frameLength);
		} else {
			// open top left and bottom right
			mat[0][0].walls[3] = 0;
			mat[mat.length - 1][mat[mat.length - 1].length - 1].walls[1] = 0;
			// clear the blue square
			drawAll(mazeMat);
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

function shuffle(arr){
	for (let i = arr.length - 1; i > 0; i--){
		let j = randomInt(0, i);
		let temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}
}

init();
drawAll(mazeMat);
