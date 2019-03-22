const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let iW = window.innerWidth;
let iH = window.innerHeight;
canvas.width = 500;
canvas.height = 500;
let mazeW = mazeH = 10;
let cellW = cellH = canvas.width/mazeW;

function node(y, x){
	this.y = y;
	this.x = x;
	this.visited = false;
	this.walls = [1, 1, 1, 1]; // top right bottom left
	this.draw = function(){
		let absX = this.x * cellW;
		let absY = this.y * cellH;
		if (this.walls == [1, 1, 1, 1]){
			ctx.fillStyle = "black";
			ctx.fillRect(absX, absY, cellH, cellW);
		} else {
			ctx.lineWidth = 4;
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

function getNeighbors(mat, y, x){
	let neighbors = [];
	// up
	if (mat[y-1]){
		if (!mat[y-1][x].visited) neighbors.push(mat[y-1][x]);
	}
	// right
	if (mat[x+1]){
		if (!mat[y][x+1].visited) neighbors.push(mat[y][x+1]);
	}
	// down
	if (mat[y+1]){
		if (!mat[y+1][x].visited) neighbors.push(mat[y+1][x]);
	}
	// left
	if (mat[x-1]){
		if (!mat[y][x-1].visited) neighbors.push(mat[y][x-1]);
	}
	return neighbors;
}

mazeMat = [];
for (let i = 0; i < mazeH; i++){
	let row = [];
	for (let j = 0; j < mazeW; j++){
		row.push(new node(i, j));
	}
	mazeMat.push(row);
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
	while (!allVisited(mat)){
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
	}
}

generate(mazeMat);

function animate() {
	requestAnimationFrame(animate);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";

	mazeMat.forEach(row => {
		row.forEach(node => {
			node.draw();
		});
	});
};

function randomInt(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

function randomFloat(min,max){
	return Math.random()*(max-min+1)+min;
}

animate();
