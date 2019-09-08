var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

//小鸟构造函数
function Bird(x, y, image) {
    this.x = x;
    this.y = y;
    this.width = image.width / 2;
    this.height = image.height;
    this.image = image;
    this.draw = function(context, state) {
        if (state === "up")
            context.drawImage(image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        else {
            context.drawImage(image, this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
}

//柱子构造函数
function Obstacle(x, y, h, image) {
    this.x = x;
    this.y = y;
    this.width = image.width / 2;
    this.height = h;
    this.draw = function(context, state) {
        if (state === "up") {
            context.drawImage(image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        } else {
            context.drawImage(image, this.width, image.height - this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
    }
}

//FlappyBird构造函数
function FlappyBird() {}
FlappyBird.prototype = {
    bird: null, // 小鸟
    bg: null, // 背景图
    obs: null, // 障碍物
    obsList: [],

    mapWidth: 340, // 画布宽度
    mapHeight: 453, // 画布高度
    startX: 90, // 起始位置  
    startY: 225,
    obsDistance: 150, // 上下障碍物距离  
    obsSpeed: 2, // 障碍物移动速度  
    obsInterval: 2000, // 制造障碍物间隔ms  
    upSpeed: 8, // 上升速度  
    downSpeed: 3, // 下降速度  
    line: 56, // 地面高度
    score: 0, // 得分  
    touch: false, // 是否触摸
    gameOver: false,
    CreateMap: function() {
        //背景
        this.bg = new Image();
        this.bg.src = "img/bg.png";
        var startBg = new Image();
        startBg.src = "img/start.jpg";
        // 由于Image异步加载, 在加载完成时在绘制图像
        startBg.onload = function() {
            c.drawImage(startBg, 0, 0);
        };

        //小鸟
        var image = new Image();
        image.src = "img/bird.png";
        image.onload = function() {
            this.bird = new Bird(this.startX, this.startY, image);
            //this.bird.draw(c, "down");
        }.bind(this);

        //障碍物  
        this.obs = new Image();
        this.obs.src = "img/obs.png";
        this.obs = new Image();
        this.obs.src = "img/obs.png";
        this.obs.onload = function() {
            var h = 100; //设置第一根柱子高度
            var h2 = this.mapHeight - h - this.obsDistance - this.line;
            var obs1 = new Obstacle(this.mapWidth, 0, h, this.obs);
            var obs2 = new Obstacle(this.mapWidth, h + this.obsDistance, h2, this.obs);
            this.obsList.push(obs1);
            this.obsList.push(obs2);
        }.bind(this);
    },


    //产生柱子
    CreateObs: function() {
        //随机产生不同高度的柱子
        var h = Math.floor(Math.random() * (this.mapHeight - this.line - this.obsDistance));
        var h2 = this.mapHeight - h - this.obsDistance - this.line;
        var obs1 = new Obstacle(this.mapWidth, 0, h, this.obs);
        var obs2 = new Obstacle(this.mapWidth, h + this.obsDistance, h2, this.obs);
        this.obsList.push(obs1);
        this.obsList.push(obs2);

        //如果超过画布就移除障碍物
        if (this.obsList[0].x < -this.obsList[0].width) {
            this.obsList.splice(0, 2);
        }
    },

    //绘出柱子
    DrawObs: function() {
        c.fillStyle = "#0f0";
        for (var i = 0; i < this.obsList.length; i++) {
            this.obsList[i].x -= this.obsSpeed;
            if (i % 2) {
                this.obsList[i].draw(c, "up");
            } else {
                this.obsList[i].draw(c, "down");
            }
        }
    },

    //计算分数
    CountScore: function() {
        if (this.score == 0 && this.obsList[0].x <= this.startX - this.obsList[0].width) {
            this.score = 1;
            return true;
        }
        return false;
    },

    //显示分数
    ShowScore: function() {
        c.fillStyle = "#fff";
        c.lineWidth = 1;
        c.strokeStyle = "#000";
        c.fillText(this.score, 10, 50);
        c.strokeText(this.score, 10, 50);
    },

    //碰撞检测
    CanMove: function() {
        for (var i = 0; i < this.obsList.length; i += 2) {
            if (this.bird.y < 0 || this.bird.y > this.mapHeight - this.bird.height - this.line) {
                this.gameOver = true;
            }
            if (this.startX - this.obsList[i].width <= this.obsList[i].x && this.obsList[i].x <= this.startX + this.bird.width) {
                if (this.bird.y <= this.obsList[i].height || this.bird.y >= this.obsList[i].height + this.obsDistance - this.bird.height) {
                    this.gameOver = true;

                }
            }

        }
    },

    //触摸检测
    CheckTouch: function() {
        if (this.touch) {
            this.bird.y -= this.upSpeed;
            this.bird.draw(c, "up");
        } else {
            this.bird.y += this.downSpeed;
            this.bird.draw(c, "down");
        }
    },

    //清屏
    ClearScreen: function() {
        c.drawImage(this.bg, 0, 0);
    },

    //显示游戏结束页面
    ShowOver: function() {
        var gameOverImage = new Image();
        gameOverImage.src = "img/over.png";
        gameOverImage.onload = function() {
            c.drawImage(gameOverImage, (this.mapWidth - gameOverImage.width) / 2, (this.mapHeight - gameOverImage.height) / 2 - 50);
        }.bind(this);
    }

};

var game = new FlappyBird();
var speed = 20;
var gameTime = null;
var isPlay = false;
var btn_start;
window.onload = InitGame;


//初始化函数
function InitGame() {
    c.font = "3em 微软雅黑";
    game.CreateMap();

    canvas.onmousedown = function() {
        game.touch = true;
    }
    canvas.onmouseup = function() {
        game.touch = false;
    }
    canvas.onclick = function() {
        if (!isPlay) {
            isPlay = true;
            gameTime = RunGame(speed);
        }
    }
}

//开始游戏
function RunGame(speed) {
    var updateTimer = setInterval(function() {
        //如果通过第一个柱子就启动计分器
        if (game.CountScore()) {
            var scoreTimer = setInterval(function() {
                if (game.gameOver) {
                    clearInterval(scoreTimer);
                }
                game.score++;
            }, game.obsInterval);
        }

        game.CanMove();
        if (game.gameOver) {
            game.ShowOver();
            clearInterval(updateTimer);

        }
        game.ClearScreen();
        game.DrawObs();
        game.CheckTouch();
        game.ShowScore();
    }, speed);
    var obsTimer = setInterval(function() {
        if (game.gameOver) {
            clearInterval(obsTimer);
        }
        game.CreateObs();

    }, game.obsInterval);
}