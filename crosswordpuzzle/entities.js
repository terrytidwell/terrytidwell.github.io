//------------------------------------------------------------------------
function createScreen(custom_reset)
{
  return {
    custom_reset : custom_reset,
    init: function (jut)
    {
      this.jut = jut;
    },

    reset: function ()
    {
      this.mouse_click_event = null;
      this.mouse_move_event = null;
      this.player_x = 0;
      this.player_y = 0;
      this.gamestate =
      {
        jut : this.jut,
        gameEntities : []
      };

      this.custom_reset();
    },

    handleMouseDown: function(event)
    {
      for (var i = 0; i < this.gamestate.gameEntities.length; i++)
      {
        if(this.gamestate.gameEntities[i].handleMouseDown)
        {
          this.gamestate.gameEntities[i].handleMouseDown(event);
        }
      }
    },

    handleMouseMove: function(event)
    {
      for (var i = 0; i < this.gamestate.gameEntities.length; i++)
      {
        if(this.gamestate.gameEntities[i].handleMouseMove)
        {
          this.gamestate.gameEntities[i].handleMouseMove(event);
        }
      }

    },

    handleTimeStep: function()
    {
      for (var i = 0; i < this.gamestate.gameEntities.length; i++)
      {
        if(this.gamestate.gameEntities[i].handleTimeStep)
        {
          this.gamestate.gameEntities[i].handleTimeStep(this.gamestate);
        }
      }

      for (var i = this.gamestate.gameEntities.length - 1; i >= 0; i--)
      {
        if(this.gamestate.gameEntities[i].active)
        {
          if(!this.gamestate.gameEntities[i].active())
          {
            this.gamestate.gameEntities.splice(i,1);
          }
        }
      }
    },

    paint: function (canvas, ctx)
    {
      this.gamestate.gameEntities.sort(function(a,b){
        var a_lvl = 0;
        var b_lvl = 0;
        if(a.paintLevel)
        {
          a_lvl = a.paintLevel();
        }
        if(b.paintLevel)
        {
          b_lvl = b.paintLevel();
        }
        return a_lvl - b_lvl;
      });

      for (var i = 0; i < this.gamestate.gameEntities.length; i++)
      {
        if (this.gamestate.gameEntities[i].paint)
        {
          this.gamestate.gameEntities[i].paint(canvas,ctx);
        }
      }
    }
  };
};


var PAINT_LEVEL = {
  BG : -1,
  EFFECT : 0,
  FG : 1,
  HUD_BG : 2,
  HUD : 3,
  AFTER_EFFECT : 4,
  OVERLAY : 5
};

//---------------------------------------------------------------------
function createImage(image, sx, sy, swidth, sheight, x, y, width, height)
{
  return {
    image: image,
    sx: sx,
    sy: sy,
    swidth : swidth,
    sheight : sheight,
    x: x,
    y: y,
    width: width,
    height: height,
    paint_level : PAINT_LEVEL.HUD,
    paint: function (canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      var width = this.width * canvas.height;
      var height = this.height * canvas.height;
      ctx.drawImage(this.image,
        this.sx, this.sy, this.swidth, this.sheight,
        x, y, width, height);
    },
    paintLevel: function ()
    {
      return this.paint_level;
    }
  };
};

//---------------------------------------------------------------------
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
        gamestate.gameEntities.push(this);
        gamestate.gameEntities.push(this.script[0]);
      }
    }
  };
};

//---------------------------------------------------------------------
function createPaintedObject(object, paint_level)
{
  return {
    paint : function(canvas, ctx)
    {
      object.paint(canvas, ctx);
    },
    paintLevel : function()
    {
      return paint_level;
    }
  };
};


//---------------------------------------------------------------------
function createInstantEvent(callback)
{
  return {
    needs_to_run : true,
    active : function()
    {
      return !this.needs_to_run;
    },
    handleTimeStep : function(gamestate)
    {
      this.needs_to_run = false;
      callback(gamestate);
    }
  };
};

//---------------------------------------------------------------------
function createLetter(letter)
{
  var newLetter = {
    fade_in : true,
    fade_out : false,
    paint_level : PAINT_LEVEL.HUD,
    fade_counter : 1,
    fade_counter_max : 10,
    letters : [],
    active : function ()
    {
      return this.fade_counter > 0;
    },
    handleMouseDown : function(event)
    {
      if (!this.fade_in)
      {
        this.fade_out = true;
        return true;
      }
    },
        handleTimeStep : function (gamestate)
    {
      if (this.fade_in)
      {
        this.fade_counter++;
        this.fade_in = this.fade_counter < this.fade_counter_max;
        return;
      }
      if (this.fade_out)
      {
        if (this.fade_counter > 0)
        {
          this.fade_counter--;
        }
      }
    },
    paint: function (canvas, ctx)
    {
      var fade = this.fade_counter / this.fade_counter_max;
      ctx.globalAlpha = fade;
      
      for (let i = 0; i < this.letters.length; i++)
      {
        this.letters[i].paint(canvas, ctx);
      }
      
      ctx.globalAlpha = 1;
    },
    paintLevel: function ()
    {
      return this.paint_level;
    }
  };
  for (let y = 0; y < letter.length; y++)
  {
    for (let x = 0; x < letter[y].length; x++)
    {
      if (letter[y].charAt(x) !== ' ')
      {
        newLetter.letters.push(new LetterBox((x+1)*GRID_SIZE,(y+.5)*2*GRID_SIZE,GRID_SIZE,letter[y].charAt(x)));
      }
    }
  }
  return newLetter;
};

//---------------------------------------------------------------------
function createDetective(script)
{
  var imageAspectRatio = 900/496;
  var imageWidth = 3/4*g_aspect_ratio;
  var y_offset = 1/6;
  var play = new IconButton(g_play, g_aspect_ratio - (INVERSE_PHI * 26/35 * GRID_SIZE * 2), 1 - (INVERSE_PHI * 26/35 * GRID_SIZE * 2), (INVERSE_PHI * 26/35 * GRID_SIZE * 2));
  var face = createImage(g_poirot,
    0,0,900,496,(g_aspect_ratio-imageWidth)/2,0+y_offset,imageWidth,imageWidth/imageAspectRatio);
  var mustache = createImage(g_stache,
    0,0,900*1.6,496*1.6,(g_aspect_ratio-imageWidth)/.907,imageWidth/imageAspectRatio/2.06+y_offset,imageWidth,imageWidth/imageAspectRatio);
  var detective = {
    waggle: 0,
    theta: 0,
    face : face,
    mustache : mustache,
    paint_level : PAINT_LEVEL.HUD,
    script : script,
    text : null,
    theta : 0,
    waggle : 1/300,
    fade_in : true,
    fade_counter : 1,
    fade_counter_max : 10,
    waiting_for_next_text : false,
    active : function ()
    {
      return this.fade_counter > 0;
    },
    queueDiag : function ()
    {
      this.toggleTalk(true);
      this.text = createText(this.script.shift(), g_aspect_ratio/2, imageWidth/imageAspectRatio*1+y_offset, imageWidth/ imageAspectRatio/10);
      this.text.text_done = function ()
      {
        detective.toggleTalk(false);
        detective.waiting_for_next_text = true;
      }
    },
    handleMouseDown : function(event)
    {
      if (!this.waiting_for_next_text)
      {
        this.text.display = this.text.script;
        this.text.text_done();
      }
      else if (this.waiting_for_next_text)
      {
        this.text = null;
        this.waiting_for_next_text = false;
        return true;
      }
    },
    handleTimeStep : function (gamestate)
    {
      if (this.fade_in)
      {
        this.fade_counter++;
        this.fade_in = this.fade_counter < this.fade_counter_max;
        return;
      }
      this.theta++;
      if (this.text === null && this.script.length !== 0)
      {
        this.queueDiag();
      }
      if (this.text !== null)
      {
        this.text.handleTimeStep(gamestate);
      }
      else
      {
        if (this.fade_counter > 0)
        {
          this.fade_counter--;
        }
      }
    },
    toggleTalk : function (talk)
    {
      if (talk)
      {
        this.waggle = 1/300;
      }
      else
      {
        this.waggle = 0;
      }
    },
    paint: function (canvas, ctx)
    {
      var fade = this.fade_counter / this.fade_counter_max;
      ctx.globalAlpha = fade * .25;
      var x = mustache.x;
      var y = mustache.y;
      mustache.x += 2/600;
      mustache.y += 2/600 + Math.sin(this.theta) * this.waggle;
      mustache.paint(canvas, ctx);
      mustache.x = x;
      mustache.y = y;
      
      x = face.x;
      y = face.y;
      face.x += 2/600;
      face.y += 2/600;
      face.paint(canvas, ctx);
      face.x = x;
      face.y = y;
      ctx.globalAlpha = fade;
      
      y = mustache.y;
      mustache.y += Math.sin(this.theta) * this.waggle;
      mustache.paint(canvas, ctx);
      mustache.y = y;
      
      face.paint(canvas, ctx);
      if (this.text !== null)
      {
        this.text.paint(canvas, ctx);
      }
      if (this.waiting_for_next_text)
      {
        var x = play.x;
        play.x -= Math.sin(this.theta/4) * 1/300;
        play.paint(canvas, ctx);
        play.x = x;
      }
      ctx.globalAlpha = 1;
    },
    paintLevel: function ()
    {
      return this.paint_level;
    }
  };
  return detective;
};

//---------------------------------------------------------------------
function createText(text, x, y, height)
{
  return {
    text: text,
    display: [""],
    script: null,
    x: x,
    y: y,
    height: height,
    text_done : function (){},
    handleTimeStep()
    {
      if (this.script === null)
      {
        return;
      }
      var current = this.display.length - 1;
      
      if (this.display[current].length < this.script[current].length)
      {
        this.display[current] += this.script[current].charAt(this.display[current].length);
        if (this.display[current].length === this.script[current].length)
        {
          if (current < this.script.length - 1)
          {
            this.display.push("");
          }
          else
          {
            this.text_done();
          }
        }
      }
    },
    paint: function (canvas, ctx)
    {
      var height = canvas.height * this.height;
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      ctx.font = Math.round(height) + "px American Typewriter";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      
      if (this.script === null)
      {
        this.script = [""];
        var words = this.text.split(" ");
        if (words.length !== 0)
        {
          var current_line = words[0];
          this.script = [words[0]];
          
          for (let word = 1; word < words.length; word++)
          {
            var candidate_line = current_line + " " + words[word];
            if (ctx.measureText(candidate_line).width < canvas.width)
            {
              this.script[this.script.length - 1] += " " + words[word];
              current_line = candidate_line;
            }
            else
            {
              current_line = words[word];
              this.script.push(current_line);
            }
          }
        }
      }
      

      for (let i = 0; i < this.display.length; i++)
      {
        var offset = ctx.measureText(this.script[i]).width/2;
        ctx.fillText(this.display[i], x - offset, y);
        y+=height * 1.5;
      }
    },
    paintLevel: function()
    {
      return PAINT_LEVEL.HUD;
    }
  };
};

function createFill()
{
  return {
    fillStyle : "#ffffff",
    paint_level : PAINT_LEVEL.BG,
    paint : function (canvas, ctx)
    {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = this.fillStyle;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    paintLevel : function ()
    {
      return this.paint_level;
    }
  };
}

//---------------------------------------------------------------------
function createBackground()
{
  return {
    fillStyle : "#ffffff",
    paint : function (canvas, ctx)
    {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = this.fillStyle;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.BG;
    }
  };
};