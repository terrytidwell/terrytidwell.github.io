function createContainer(x,y,width,height) {
  return {
    x: x,
    y: y,
    width: width,
    height: height,
    visible : function ()
    {
      return true;
    },
    paint : function (gamestate, canvas, context)
    {
    },
    paintLevel : function()
    {
      return 0;
    }
  };
};

function createPanel(x, y, width, height, parent) {
  return {
    x: x * parent.width + parent.x,
    y: y * parent.height + parent.y,
    width: width * parent.width,
    height: height * parent.height,
    visible: true,
    paint : function (gamestate, canvas, ctx)
    {
      if (!this.visible)
      {
        return;
      }
      var x = Math.round(canvas.height * this.x);
      var width = Math.round(canvas.height * this.width);
      var y = Math.round(canvas.height * this.y);
      var height = Math.round(canvas.height * this.height);
      ctx.lineWidth = Math.max(1,canvas.width/600)
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.strokeStyle = "rgb(0, 192, 0)";
      ctx.shadowColor = "rgb(0, 192, 0)";
      ctx.lineCap = "round";
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.strokeRect(-canvas.width * 2 + x, y, width, height);
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.strokeRect(-canvas.width * 2 + x, y, width, height);
      ctx.shadowBlur = 1;
      ctx.strokeRect(-canvas.width * 2 + x, y, width, height);
      ctx.shadowBlur = 0;
    },
    paintLevel : function()
    {
      return 0;
    }
  };
};

function createScanSquare(x, y, width, height, parent, game_x, game_y) {
  return {
    game_x : game_x,
    game_y : game_y,
    x: x,
    y: y,
    parent : parent,
    width: width,
    height: height,
    paint : function (gamestate, canvas, ctx)
    {
      if(!parent.visible)
      {
        return;
      }
      var box_bound_x = Math.round((this.x + this.parent.x) * canvas.height);
      var box_bound_y = Math.round((this.y + this.parent.y) * canvas.height);
      var width = Math.round(this.width * canvas.height);
      var height = Math.round(this.height * canvas.height);
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.shadowColor = "rgb(0, 32, 0)";
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = 1;
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = 0;
    },
    paintLevel : function()
    {
      return 0;
    }
  };
};

function createMapSquare(x,y,width,height,parent, game_x, game_y) {
  return {
    game_x : game_x,
    game_y : game_y,
    x: x,
    y: y,
    parent : parent,
    width: width,
    height: height,
    highlighted : false,
    move_signal: false,
    handleMouseMove : function(x,y)
    {
      if(!parent.visible)
      {
        return;
      }
      x -= this.parent.x;
      y -= this.parent.y;
      this.highlighted = (x > this.x && x < this.x + this.width &&
        y > this.y && y < this.y + this.height);
    },
    handleMouseDown : function(x,y)
    {
      if(!parent.visible)
      {
        return;
      }
      x -= this.parent.x;
      y -= this.parent.y;
      this.move_signal = (x > this.x && x < this.x + this.width &&
        y > this.y && y < this.y + this.height);
    },
    handleTimeStep(gamestate)
    {
      if(!parent.visible)
      {
        return;
      }
      if (this.move_signal)
      {
        this.move_signal = false;
        gamestate.player.setWaypoint(this);
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      if(!parent.visible)
      {
        return;
      }
      var box_bound_x = Math.round((this.x + this.parent.x) * canvas.height);
      var box_bound_y = Math.round((this.y + this.parent.y) * canvas.height);
      var width = Math.round(this.width * canvas.height);
      var height = Math.round(this.height * canvas.height);
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.shadowColor = (this.highlighted && Math.random() < .95 ? "rgb(0, 64, 0)" : "rgb(0, 32, 0)");
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = 1;
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = 0;
    },
    paintLevel : function()
    {
      return 0;
    }
  };
};

function createPlayer(location) {
  return {
    INITIAL_STATE : -1,
    WAITING_STATE : 0,
    MOVING_STATE : 1,
    DYING_STATE : 2,
    DEATH_STATE : 3,
    GAME_OVER_STATE : 4,
    state : -1,
    state_timer : 0,
    waypoint_signal_waiting : false,
    waypoint_signal : null,
    current_waypoint : null,
    current_location : location,
    healthy : function()
    {
      return this.state !== this.DYING_STATE &&
        this.state !== this.DEATH_STATE &&
        this.state !== this.GAME_OVER_STATE;
    },
    suggestDialogue : function (gamestate, name, line)
    {
      if (!this.healthy())
      {
        return;
      }
      if (gamestate.current_message.active())
      {
        return false;
      }
      gamestate.current_message = createIncomingMessage(gamestate.bottom_panel, name, line);
      gamestate.gameEntities.push(gamestate.current_message);
      return true;
    },
    importantDialogue : function (gamestate, name, line)
    {
      if (!this.healthy())
      {
        return;
      }
      this.alertDialogue(gamestate, name, line);
    },
    alertDialogue : function (gamestate, name, line)
    {
      gamestate.current_message.cancel();
      gamestate.current_message = createIncomingMessage(gamestate.bottom_panel, name, line);
      gamestate.gameEntities.push(gamestate.current_message);
    },
    setWaypoint : function(location)
    {
      this.waypoint_signal_waiting = true;
      this.waypoint_signal = location;
    },
    handleTimeStep : function(gamestate)
    {
      var old_state = this.state;
      this.handleState(gamestate);
      if (this.state !== old_state)
      {
        this.exitState(gamestate, old_state);
        this.enterState(gamestate);
      }
    },
    handleState : function(gamestate)
    {
      if (this.state != this.DYING_STATE 
        && this.state != this.DEATH_STATE 
        && this.state != this.GAME_OVER_STATE)
      {
        for (monster in gamestate.monsters)
        {
          if(gamestate.monsters[monster].current_location.game_x ==
            this.current_location.game_x &&
            gamestate.monsters[monster].current_location.game_y ==
            this.current_location.game_y)
          {
            this.state = this.DYING_STATE;
            gamestate.monsters[monster].state = gamestate.monsters[monster].ATTACKING_STATE;
            return;
          }
        }
      }
      switch(this.state)
      {
        case this.DEATH_STATE:
          if (this.state_timer > 0)
          {
            this.state_timer--;
          }
          else
          {
            this.state = this.GAME_OVER_STATE;
            return;
          }
          break;        
        case this.DYING_STATE:
          if (this.state_timer > 0)
          {
            this.state_timer--;
          }
          else
          {
            this.state = this.DEATH_STATE;
            return;
          }
          if (this.state_timer % 30 == 0)
          {
            
            var string = Util.randomItem([
              ["Alice","OH GOD!"],
              ["Alice","AHHHHHH!"],
              ["Alice","PLEASE!"],
              ["Alice","HELP!"],
              ["Medical Alert","Leg fracture detected."],
              ["Medical Alert","Skull fracture detected."],
              ["Medical Alert","Spinal fracture detected."],
              ["Medical Alert","Severe laceration detected."],
            ]);
            this.alertDialogue(gamestate, string[0], string[1]);
          }
          break;
        case this.WAITING_STATE:
          if (this.waypoint_signal_waiting)
          {
            this.waypoint_signal_waiting = false;
            this.waypoint = this.waypoint_signal;
            this.state = this.MOVING_STATE;
          }
          break;
        case this.MOVING_STATE:
          if (this.waypoint_signal_waiting)
          {
            this.waypoint_signal_waiting = false;
            if (this.waypoint.game_x == this.waypoint_signal.game_x &&
              this.waypoint.game_y == this.waypoint_signal.game_y)
            {
              //do nothing
            }
            if (this.current_location.game_x == this.waypoint_signal.game_x &&
              this.current_location.game_y == this.waypoint_signal.game_y)
            {
              this.suggestDialogue(gamestate,"Alice", Util.randomItem(["I'm there.", "Made it."]));
              this.state = this.WAITING_STATE;
              return;
            }
            else
            {
              this.waypoint = this.waypoint_signal;
              this.state_timer = 50;
            }
          }
          
          if (this.state_timer > 0)
          {
            this.state_timer--;
          }
          else
          {
            var current_x = this.current_location.game_x;
            var current_y = this.current_location.game_y;
            var x_diff = this.waypoint.game_x - current_x;
            var y_diff = this.waypoint.game_y - current_y;
            if (Math.abs(x_diff) > Math.abs(y_diff))
            {
              //move_x
              if (x_diff > 0)
              {
                current_x++;
              }
              else if (x_diff < 0)
              {
                current_x--;
              }
            }
            else
            {
              //move_x
              if (y_diff > 0)
              {
                current_y++;
              }
              else if (y_diff < 0)
              {
                current_y--;
              }
            }
            this.current_location = gamestate.map[current_x][current_y];
            gamestate.player_marker.setLocation(this.current_location);
            gamestate.player_radar.setLocation(gamestate.radar[current_x][current_y]);
            if (this.current_location.game_x == this.waypoint.game_x &&
              this.current_location.game_y == this.waypoint.game_y)
            {
              this.suggestDialogue(gamestate,"Alice", Util.randomItem(["I'm there.", "Made it."]));
              this.state = this.WAITING_STATE;
            }
            this.state_timer = 50;
          }
          break;
      }
    },
    exitState : function(gamestate, state)
    {
      switch(state)
      {
        case this.WAITING_STATE:
          break;
        case this.MOVING_STATE:
          break;
      }
    },
    enterState : function(gamestate)
    {
      switch(this.state)
      {
        case this.GAME_OVER_STATE:
          gamestate.gameEntities.push(createDeathVeil());
          break;
        case this.DEATH_STATE:
          this.state_timer = 25;
          var string = Util.randomItem([
            ["Medical Alert","Cardiac arrest detected."],
          ]);
          this.alertDialogue(gamestate, string[0], string[1]);
          break;
        case this.DYING_STATE:
          this.state_timer = 150+29;
          var string = Util.randomItem([
            ["Alice","What the hell is that?!"],
            ["Alice","Oh no!"]
          ]);
          this.alertDialogue(gamestate, string[0], string[1]);
          break;
        case this.MOVING_STATE:
          if (this.current_location.game_x == this.waypoint.game_x &&
            this.current_location.game_y == this.waypoint.game_y)
          {
            this.suggestDialogue(gamestate, "Alice", Util.randomItem(["Already there."]));
            this.state = this.WAITING_STATE;
            return;
          }
          this.suggestDialogue(gamestate, "Alice", Util.randomItem(["Roger.", "On the move.", "OK. Heading that way now."]));
          this.state_timer = 50;
          break;
      }
    }
  };
};

function createMonster(location, icon)
{
  return {
    INITIAL_STATE : 0,
    WAITING_STATE : 1,
    MOVING_STATE : 2,
    ATTACKING_STATE : 3,
    state : 0,
    state_timer : 0,
    current_location : location,
    icon : icon,
    waypoint : null,
    alive : true,
    active : function()
    {
      return this.alive;
    },
    cancel : function()
    {
      this.alive = false;
      this.icon.cancel();
    },
    handleTimeStep : function(gamestate)
    {
      var old_state = this.state;
      this.handleState(gamestate);
      if (this.state !== old_state)
      {
        this.exitState(gamestate, old_state);
        this.enterState(gamestate);
      }
    },
    handleState : function(gamestate)
    {
      switch(this.state)
      {
        case this.INITIAL_STATE:
          this.state = this.WAITING_STATE;
          break;
        case this.WAITING_STATE:
          if (this.state_timer > 0)
          {
            this.state_timer--;
          }
          else
          {
            this.state = this.MOVING_STATE;
          }
          break;
        case this.MOVING_STATE:
          if (this.state_timer > 0)
          {
            this.state_timer--;
          }
          else
          {
            this.current_location = this.waypoint;
            this.state = this.WAITING_STATE;
            this.icon.location = gamestate.radar[this.current_location.game_x][this.current_location.game_y];
          }
          break;
      }
    },
    exitState : function(gamestate, state)
    {
      switch(state)
      {
        case this.MOVING_STATE:
          break;
      }
    },
    enterState : function(gamestate)
    {
      switch(this.state)
      {
        case this.WAITING_STATE:
          this.state_timer = 25 * (Math.round(Math.random() * 2 + 7));
          break;
        case this.MOVING_STATE:
          var possible_directions = [];
          if(this.current_location.game_x > 0)
          {
            possible_directions.push([-1,0]);
          }
          if(this.current_location.game_x < 3)
          {
            possible_directions.push([1,0]);
          }
          if(this.current_location.game_y > 0)
          {
            possible_directions.push([0,-1]);
          }
          if(this.current_location.game_y < 3)
          {
            possible_directions.push([0,1]);
          }
          var direction=Util.randomItem(possible_directions);
          this.waypoint = gamestate.map[this.current_location.game_x + direction[0]][this.current_location.game_y + direction[1]];
          this.state_timer = 25;
          break;
      }
    }
  };
};

function createFloatey(x,radius)
{
  return {
    x : x,
    radius : radius,
    y : Math.random(),
    
    theta : Math.random() * 2 * Math.PI,
    handleTimeStep : function(gamestate)
    {
      this.y -= this.radius/60;
      if (this.y < -this.radius)
      {
        this.y = 1+this.radius;
      }
      
      this.theta += Math.PI * this.radius;
      this.x += Math.cos(this.theta) * this.radius / 30;
    },
    paint : function (gamestate, canvas, ctx)
    {
      var radius = Math.round(this.radius * canvas.height);
      
      var playerCenterX = Math.round(-canvas.width * 2 + (this.x) * canvas.height);
      var playerCenterY = Math.round(this.y * canvas.height);
      ctx.beginPath();
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.fillStyle = "rgb(0,0,0)"
      ctx.shadowColor = "rgb(0,"+Math.round(1/this.radius)+",0)";
      ctx.shadowBlur = Math.round(radius);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, radius, 0, 2 * Math.PI);
      ctx.fill();
    },
    paintLevel : function()
    {
      return radius;
    }
  };
};

function createPlayerIcon(location, parent) {
  return {
    percentage: 0,
    location: location,
    parent: parent,
    alive : true,
    active : function()
    {
      return this.alive;
    },
    cancel : function()
    {
      this.alive = false;
    },
    handleTimeStep : function(gamestate)
    {
      this.percentage += 3;
      if (this.percentage > 100)
      {
        this.percentage-=100;
      }
    },
    setLocation : function(location)
    {
      this.location = location;
    },
    paint : function (gamestate, canvas, ctx)
    {
      if(!this.parent.visible)
      {
        return;
      }
      if(this.location === null)
      {
        return;
      }
      if(Math.random() < .01)
      {
        return;
      }
      var radius = Math.min(this.location.width/2, this.location.height/2) * canvas.height;
      
      var playerCenterX = Math.round(-canvas.width * 2 + (this.parent.x + this.location.x + this.location.width/2) * canvas.height);
      var playerCenterY = Math.round((this.parent.y + this.location.y + this.location.height/2) * canvas.height);
      ctx.beginPath();
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.fillStyle = "rgb(0,0,0)"
      ctx.shadowColor = "rgb(0,255,0," + (1-this.percentage/100) + ")";
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, Math.round(radius/8), 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, Math.round(radius/8), 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 1;
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, Math.round(radius/8), 0, 2 * Math.PI);
      ctx.fill();
      
      var min_ring_size = (radius/8);
      var max_ring_size = (radius * 4/5);
      var ring_size = Math.round((max_ring_size - min_ring_size) * (this.percentage/100) + min_ring_size);
      ctx.shadowColor = "rgba(0,255,0," + (1-this.percentage/100) + ")";
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, ring_size, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, ring_size, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.shadowBlur = 1;
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, ring_size, 0, 2 * Math.PI);
      ctx.stroke();
    },
    paintLevel : function()
    {
      return 1;
    }
  };
};

function createMonsterIcon(location, parent) {
  return {
    location: location,
    parent: parent,
    alive : true,
    active : function()
    {
      return this.alive;
    },
    cancel : function()
    {
      this.alive = false;
    },
    handleTimeStep : function(gamestate)
    {
    },
    setLocation : function(location)
    {
      this.location = location;
    },
    paint : function (gamestate, canvas, ctx)
    {
      if(!this.parent.visible)
      {
        return;
      }
      if(this.location === null)
      {
        return;
      }
      if(Math.random() < 20/25)
      {
        return;
      }
      var text_size = Math.round(location.height * INVERSE_PHI * canvas.height);
      ctx.font = text_size + "px " + g_font;
      var playerCenterX = Math.round(-canvas.width * 2 + (this.parent.x + this.location.x + this.location.width/2) * canvas.height);
      var playerCenterY = Math.round((this.parent.y + this.location.y + this.location.height/2) * canvas.height);
      
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.shadowColor = "rgb(0,255,0)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      var text = "!";
      ctx.shadowBlur = Math.round(text_size * 2 / 3);
      ctx.fillText(text, playerCenterX, playerCenterY);
      ctx.shadowBlur = Math.round(text_size / 3);
      ctx.fillText(text, playerCenterX, playerCenterY);
      ctx.shadowBlur = 1;
      ctx.fillText(text, playerCenterX, playerCenterY);
      
      return;
      
      var radius = Math.min(this.location.width/2, this.location.height/2) * canvas.height;
      
      var playerCenterX = Math.round(-canvas.width * 2 + (this.parent.x + this.location.x + this.location.width/2) * canvas.height);
      var playerCenterY = Math.round((this.parent.y + this.location.y + this.location.height/2) * canvas.height);
      ctx.beginPath();
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.fillStyle = "rgb(0,0,0)"
      ctx.shadowColor = "rgb(0,255,0";
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, Math.round(radius/8), 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, Math.round(radius/8), 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 1;
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, Math.round(radius/8), 0, 2 * Math.PI);
      ctx.fill();
    },
    paintLevel : function()
    {
      return 1;
    }
  };
};

function createScanLine() {
  return {
    y : 0,
    handleTimeStep : function(gamestate)
    {
      this.y+=.75;
      if(this.y > 100)
      {
        this.y = 0;
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      ctx.lineWidth = Math.max(1, Math.round(canvas.height/400));
      ctx.strokeStyle = "rgba(0,0,0,.25)";
      ctx.putImageData(ctx.getImageData(0,Math.round(canvas.height * this.y / 100), canvas.width, ctx.lineWidth*2), -3, Math.round(canvas.height * this.y / 100));
    },
    paintLevel : function()
    {
      return 100;
    }
  };
};

function createDeGauss()
{
  return {
    bounce : 0,
    handleTimeStep : function(gamestate)
    {
      if (this.bounce > 0)
      {
        this.bounce--;
      }
      if (Math.random() < .01)
      {
        this.bounce = 5;
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      if (this.bounce <= 0)
      {
        return;
      }
      ctx.lineWidth = Math.max(1, Math.round(canvas.height/400));
      var current_bounce = Math.random()*this.bounce - this.bounce/2;
      for(var y = 0; y < canvas.width; y+=ctx.lineWidth*2)
      {
        current_bounce += Math.random()*this.bounce - this.bounce/2;
        ctx.putImageData(ctx.getImageData(0,y, canvas.width, ctx.lineWidth*2), current_bounce, y);
      }
    },
    paintLevel : function()
    {
      return 101;
    }
  };
};

function createLcdLines()
{
  return {
    paint : function (gamestate, canvas, ctx)
    {
      ctx.lineWidth = Math.max(1, Math.round(canvas.height/400));
      ctx.strokeStyle = "rgba(0,0,0,.25)";
      for(var y = 0; y < canvas.height; y+=2*ctx.lineWidth)
      {
        ctx.beginPath();
        ctx.moveTo(0,y);
        ctx.lineTo(canvas.width,y);
        ctx.stroke();
      }
    },
    paintLevel : function()
    {
      return 102;
    }
  };
};

function createDeathVeil()
{
  return {
    percent : 0,
    paint : function (gamestate, canvas, ctx)
    {
      if(this.percent < 100)
      {
        this.percent+=5;
      }
      else
      {
        gamestate.jut.switchToScreen(DemoScreen);
      }
      ctx.fillStyle = "rgba(0,0,0,"+this.percent/100+")";
      ctx.fillRect(0,0,canvas.width,canvas.height);
    },
    paintLevel : function()
    {
      return 103;
    }
  };
};

function createMap(gamestate, map_panel, scan_panel)
{
  var boxes = 4;
  var centerY = map_panel.height / 2;
  var centerX = map_panel.width / 2;
  var unit = 0;
  var divisions = boxes * 5 + boxes + 1;
  var dimension = 0;
  if (map_panel.height > map_panel.width)
  {
    dimension = map_panel.width;
  }
  else
  {
    dimension = map_panel.height;
  }
  var unit = dimension / divisions;
  var left = centerX - (dimension / 2) + unit;
  var top = centerY - (dimension / 2) + unit;
  for (var x = 0; x < boxes; x++)
  {
    gamestate.map.push([]);
    gamestate.radar.push([]);
    for(var y = 0; y < boxes; y++)
    {
      var box_bound_x = 6 * unit * x + left;
      var box_bound_y = 6 * unit * y + top
      var mapSquare = createMapSquare(box_bound_x, box_bound_y, unit*5, unit*5, map_panel, x, y);
      gamestate.gameEntities.push(mapSquare);
      gamestate.map[x].push(mapSquare);
      var scanSquare = createScanSquare(box_bound_x, box_bound_y, unit*5, unit*5, scan_panel, x, y);
      gamestate.gameEntities.push(scanSquare);
      gamestate.radar[x].push(mapSquare);
    }
  }
};

function createScriptedEvent()
{
  return {
    script : [],
    push : function(event)
    {
      this.script.push(event);
    },
    handleTimeStep : function (gamestate)
    {
      if (this.script.length !== 0 && !this.script[0].active())
      {
        this.script.shift();
        if (this.script.length !== 0)
        {
          gamestate.gameEntities.push(this.script[0]);
        }
      }
    },
    start : function(gamestate)
    {
      if (this.script.length > 0)
      {
        gamestate.gameEntities.push(this.script[0]);
      }
    }
  };
};

function createRepairHud(game_x,game_y,parent,icon)
{
  return {
    game_x : game_x,
    game_y : game_y,
    selected : false,
    parent: parent,
    percent_completed : 0,
    total_percent : 600,
    icon : icon,
    text : createText("-", parent.width/2, parent.height/2, 1/30 * INVERSE_PHI, parent, "center"),
    handleTimeStep : function(gamestate)
    {
      if (this.selected && parent.visible)
      {
        if (this.percent_completed < this.total_percent)
        {
          this.percent_completed = Math.min(this.total_percent, this.percent_completed + 2);
        }
      }
      else
      {
        if (this.percent_completed < this.total_percent)
        {
          //this.percent_completed = Math.max(0, this.percent_completed - 1);
        }
      }
      if (this.percent_completed >= this.total_percent)
      {
        this.icon.alive = false;
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      this.text.text = "repaired " + Math.round(this.percent_completed / this.total_percent * 100) + "%";
      this.text.paint(gamestate,  canvas, ctx);
    },
  };
};

function createHudHolder(parent)
{
  return {
    parent : parent,
    default_objects : [
      createText("no signal", parent.width/2, parent.height/2, 1/30 * INVERSE_PHI, parent, "center")
    ],
    huds : [],
    hud_indicator : [],
    selected_hud : null,
    handleTimeStep : function(gamestate)
    {
      this.selected_hud = null;
      for (hud in this.huds)
      {
        this.huds[hud].selected = false;
        if (this.huds[hud].game_x === gamestate.player.current_location.game_x &&
          this.huds[hud].game_y === gamestate.player.current_location.game_y &&
          gamestate.player.state === gamestate.player.WAITING_STATE)
        {
          this.selected_hud = this.huds[hud];
          this.selected_hud.selected = true;
        }
        this.huds[hud].handleTimeStep();
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      if(!parent.visible)
      {
        return;
      }
      
      if(this.selected_hud === null)
      {
        for (object in this.default_objects)
        {
          this.default_objects[object].paint(gamestate,  canvas, ctx);
        }
      }
      else
      {
        this.selected_hud.paint(gamestate,  canvas, ctx);
      }
    },
    paintLevel : function ()
    {
      return 1;
    }
  }; 
};

function createText(text, x, y, height, parent, align)
{
  return {
    x: x,
    y : y,
    height : height,
    parent : parent,
    text : text,
    align : align,
    alive : true,
    color : "rgb(0,192,0)",
    cancel : function ()
    {
      this.alive = false;
    },
    active : function ()
    { 
      return this.alive;
    },
    paint : function (gamestate, canvas, ctx)
    {
      if(!parent.visible)
      {
        return;
      }
      var box_bound_x = Math.round((this.x + this.parent.x) * canvas.height);
      
      var box_bound_y = Math.round((this.y + this.parent.y) * canvas.height);
      
      ctx.textAlign = this.align;
      ctx.textBaseline = "middle";
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.shadowColor = this.color
      var text_size = Math.round(this.height * canvas.height);
      ctx.font = text_size + "px " + g_font;
        
      var text = this.text;
      ctx.shadowBlur = Math.round(text_size * 2 / 3);
      ctx.fillText(text, -canvas.width * 2 + box_bound_x, box_bound_y);
      ctx.shadowBlur = Math.round(text_size / 3);
      ctx.fillText(text, -canvas.width * 2 + box_bound_x, box_bound_y);
      ctx.shadowBlur = 1;
      ctx.fillText(text, -canvas.width * 2 + box_bound_x, box_bound_y);
    },
    paintLevel : function ()
    {
      return 1;
    }
  };
};

function createTerminal(x,y,width,height,parent)
{
  return {
    x : x,
    y : y,
    width : width,
    height : height,
    parent : parent,
    current_line : 0,
    lines : [],
    addBlankLine : function ()
    {
      this.current_line++;
    },
    clear : function()
    {
      for ( line in this.lines)
      {
        this.lines[line].cancel();
        
      }
      this.lines = [];
      this.current_line = 0;
    },
    addTypingText : function(text)
    {
      var line = createTypingText(
        text,
        1/30 * 1.5,
        1/30 * (this.current_line + 1) + 1/30 * 1.5,
        1/30,
        this.parent,
        "left");
      line.blur();
      line.text_element.color = "rgb(0,128,0)";
      this.lines.push(line);
      this.current_line++;
    },
    addText : function (text)
    {
      var line = createText(
        text,
        1/30 * 1.5,
        1/30 * (this.current_line + 1) + 1/30 * 1.5,
        1/30,
        this.parent,
        "left");
      line.color = "rgb(0,128,0)";
      line.blur = function () {};
      line.focus = function () {};
      line.completed = function () { return true; };
      line.handleTimeStep = function () {};
      this.lines.push(line);
      this.current_line++;
    },
    completed : function ()
    {
      return this.lines[this.lines.length - 1].completed();
    },
    handleTimeStep : function ()
    {
      var focus_set = false;
      for (let line = 0; line < this.lines.length; line++)
      {
        if (!focus_set &&
          !this.lines[line].completed())
        {
          this.lines[line].focus();
          focus_set = true;
        }
        else if (!focus_set && 
          line === this.lines.length - 1)
        {
          this.lines[line].focus();
          focus_set = true;
        }
        else
        {
          this.lines[line].blur();
        }

        this.lines[line].handleTimeStep();
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      for ( line in this.lines)
      {
        this.lines[line].paint(gamestate,  canvas, ctx);
      }
    },
    paintLevel : function ()
    {
      return 1;
    }
  };
};

function createTypingText(text, x, y, height, parent, align)
{
  return {
    x: x,
    y : y,
    height : height,
    parent : parent,
    text : text,
    rendered_text : "",
    align : align,
    alive : true,
    has_focus : false,
    cursor_timer : 0,
    text_element : createText("", x, y, height, parent, align),
    type_timer : 1,
    focus : function ()
    {
      this.has_focus = true;
    },
    blur : function ()
    {
      this.has_focus = false;
    },
    cancel : function ()
    {
      this.alive = false;
    },
    active : function ()
    { 
      return this.alive;
    },
    completed : function ()
    {
      return this.rendered_text.length === this.text.length;
    },
    handleTimeStep : function ()
    {
      if (!this.has_focus)
      {
        this.text_element.text = this.rendered_text;
        return;
      }
      
      if (this.type_timer > 0)
      {
        this.type_timer--;
      }
      
      if (this.type_timer === 0)
      {
        if (this.rendered_text.length < this.text.length)
        {
          this.rendered_text += this.text.charAt(this.rendered_text.length);
        }
        this.type_timer = 1;
      }
      
      this.cursor_timer++
      this.text_element.text = this.rendered_text + ((Math.floor(this.cursor_timer / 10) % 2) == 0 && this.has_focus ? "_" : " ");
    },
    paint : function (gamestate, canvas, ctx)
    {
      this.text_element.paint(gamestate,  canvas, ctx);
    },
    paintLevel : function ()
    {
      this.text_element.paintLevel();
    }
  };
};

function createMenuItems(name, parent, x, width, y, height)
{
  return {
    x : x,
    width : width,
    y : y,
    height : height, 
    parent : parent,
    name : name,
    highlighted : false,
    click_signal : false,
    selected : false,
    handleMouseMove : function(x,y)
    {
      if(!parent.visible)
      {
        return;
      }
      x -= this.parent.x;
      y -= this.parent.y;
      this.highlighted = (x > this.x && x < this.x + this.width &&
        y > this.y && y < this.y + this.height);
    },
    handleMouseDown : function(x,y)
    {
      if(!parent.visible)
      {
        return;
      }
      x -= this.parent.x;
      y -= this.parent.y;
      this.click_signal = (x > this.x && x < this.x + this.width &&
        y > this.y && y < this.y + this.height);
    },
    handleTimeStep(gamestate)
    {
      if(!parent.visible)
      {
        return;
      }
      if (this.click_signal)
      {
        this.click_signal = false;
        gamestate.menu_handler[this.name]();
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      if(!parent.visible)
      {
        return;
      }
      var box_bound_x = Math.round((this.x + this.parent.x) * canvas.height);
      var box_bound_y = Math.round((this.y + this.parent.y) * canvas.height);
      var width = Math.round(this.width * canvas.height);
      var height = Math.round(this.height * canvas.height);
      ctx.shadowOffsetX = canvas.width * 2;
      var shadow_intensity = 32;
      if (this.highlighted)
      {
        shadow_intensity+=32;
      }
      if (this.selected)
      {
        shadow_intensity+=64;
      }
      ctx.shadowColor = "rgb(0, " + shadow_intensity + ", 0)";
      ctx.shadowBlur = Math.round(canvas.height/40);
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = Math.round(canvas.height/80);
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = 1;
      ctx.fillRect(-canvas.width * 2 + box_bound_x, box_bound_y, width, height);
      ctx.shadowBlur = 0;
      
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgb(0, " + (shadow_intensity + 32) + ", 0)";
      var text_size = Math.round(this.height * INVERSE_PHI * canvas.height);
      ctx.font = text_size + "px " + g_font;
      
      var text = this.name;
      ctx.shadowBlur = Math.round(text_size * 2 / 3);
      ctx.fillText(text, 
        Math.round(-canvas.width * 2 + (this.x + this.parent.x + this.width / 2) * canvas.height),
        Math.round((this.y + this.parent.y + this.height / 2) * canvas.height));
      ctx.shadowBlur = Math.round(text_size / 3);
      ctx.fillText(text, 
        Math.round(-canvas.width * 2 + (this.x + this.parent.x + this.width / 2) * canvas.height),
        Math.round((this.y + this.parent.y + this.height / 2) * canvas.height));
      ctx.shadowBlur = 1;
      ctx.fillText(text, 
        Math.round(-canvas.width * 2 + (this.x + this.parent.x + this.width / 2) * canvas.height),
        Math.round((this.y + this.parent.y + this.height / 2) * canvas.height));
    },
    paintLevel : function()
    {
      return 1;
    }
  };
};

function createTimerLoop(timeout, event)
{
  return {
    timeout : timeout,
    event : event,
    active : function()
    {
      return this.timeout > 0;
    },
    handleTimeStep : function()
    {
      if (this.timeout > 0)
      {
        this.timeout--;
      }
      
      this.event();
    }
  };
};


function createTimer(timeout, event)
{
  return {
    timeout : timeout,
    event : event,
    active : function()
    {
      return this.timeout > 0;
    },
    handleTimeStep : function()
    {
      if (this.timeout > 0)
      {
        this.timeout--;
      }
      
      if (this.timeout === 0)
      {
        this.event()
      }
    }
  };
};

function createConditionalEvent(condition, event)
{
  return {
    condition : condition,
    event : event,
    waiting : true,
    active : function()
    {
      return this.waiting;
    },
    handleTimeStep : function()
    {
      this.waiting = !this.condition();
      
      if (!this.waiting)
      {
        this.event()
      }
    }
  };
};

function createIncomingMessage(panel, sender, message)
{
  return {
    panel : panel,
    sender : sender,
    message : message,
    need_to_parse : true,
    parsed_message : [""],
    displayed_sender : "",
    displayed_message : [""],
    position : 0,
    outro_timer : 50,
    cancel : function ()
    {
      this.outro_timer = 0;
    },
    active : function()
    {
      return this.outro_timer > 0;
    },
    handleTimeStep : function(gamestate)
    {
      if (this.need_to_parse)
      {
        return;
      }
      
      var display_line = this.displayed_message.length - 1;
      if (this.sender.length > this.displayed_sender.length)
      {
        this.displayed_sender = this.sender;
      }
      else if (this.parsed_message[display_line].length > 
        this.displayed_message[display_line].length)
      {
        this.displayed_message[display_line] += 
          this.parsed_message[display_line].charAt(this.displayed_message[display_line].length);
      }
      else if (this.parsed_message[display_line].length ===
        this.displayed_message[display_line].length && 
        this.parsed_message.length > this.displayed_message.length)
      {
        this.displayed_message.push("");
      }
      else if (this.outro_timer > 0)
      {
        this.outro_timer--
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.shadowOffsetX = canvas.width;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = "rgb(0,128,0)";
      var text_size = Math.round(canvas.height / 30);
      ctx.font = text_size + "px " + g_font;
      var indent = Math.round(canvas.height / 30 * 1.5 + this.panel.x * canvas.height);
      if (this.need_to_parse)
      {
        var bounds = this.panel.width * canvas.height - indent * 2;
        this.need_to_parse = false;
        var words = this.message.split(" ");
        var current_line = "";
        for ( word in words)
        {
          if (ctx.measureText(current_line + " " + words[word]).width < bounds)
          {
            current_line += words[word] + " ";
            this.parsed_message[this.parsed_message.length - 1] += words[word] + " ";
          }
          else
          {
            current_line = words[word] + " ";
            this.parsed_message.push(current_line);
          }
        }
      }
      
      var line_level = Math.round(canvas.height / 30 * 1.5 + this.panel.y * canvas.height);
      var text = this.displayed_sender;
      ctx.shadowBlur = Math.round(text_size * 2 / 3);
      ctx.fillText(text, -canvas.width + indent, line_level);
      ctx.shadowBlur = Math.round(text_size / 3);
      ctx.fillText(text, -canvas.width + indent, line_level);
      //ctx.shadowColor = "rgba(0,255,0," + (this.textFadeInTimer / this.textFadeInTimerLimit) + ")";
      ctx.shadowBlur = 1;
      //ctx.fillStyle = "rgba(0,0,0," + .75 * (this.textFadeInTimer / this.textFadeInTimerLimit) + ")";
      ctx.fillText(text, -canvas.width + indent, line_level);
      
      for (var i = 0; i < this.displayed_message.length; i++)
      {
        var line_level = Math.round(canvas.height / 30 * (3.5 + i) + this.panel.y * canvas.height);
        var text = this.displayed_message[i];
        ctx.shadowBlur = Math.round(text_size * 2 / 3);
        ctx.fillText(text, -canvas.width + indent, line_level);
        ctx.shadowBlur = Math.round(text_size / 3);
        ctx.fillText(text, -canvas.width + indent, line_level);
        //ctx.shadowColor = "rgba(0,255,0," + (this.textFadeInTimer / this.textFadeInTimerLimit) + ")";
        ctx.shadowBlur = 1;
        //ctx.fillStyle = "rgba(0,0,0," + .75 * (this.textFadeInTimer / this.textFadeInTimerLimit) + ")";
        ctx.fillText(text, -canvas.width + indent, line_level);
      }
    },
    paintLevel : function ()
    {
      return 1;
    }
  };
};
