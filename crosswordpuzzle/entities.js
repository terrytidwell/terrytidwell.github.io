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
function createDetective()
{
  var imageAspectRatio = 900/496;
  var imageWidth = 3/4*g_aspect_ratio;
  var face = createImage(g_poirot,
    0,0,900,496,(g_aspect_ratio-imageWidth)/2,0,imageWidth,imageWidth/imageAspectRatio);
  var mustache = createImage(g_stache,
    0,0,900*1.6,496*1.6,(g_aspect_ratio-imageWidth)/.907,imageWidth/imageAspectRatio/2.06,imageWidth,imageWidth/imageAspectRatio);
  var text = createText("Hello detective!",g_aspect_ratio/2, imageWidth/imageAspectRatio*1, imageWidth/imageAspectRatio/10);
  text.text_done = function () {
    detective.toggleTalk(false);
  };
  var detective = {
    waggle: 0,
    theta: 0,
    face : face,
    mustache : mustache,
    paint_level : PAINT_LEVEL.HUD,
    theta : 0,
    waggle : 1/300,
    handleTimeStep : function (gamestate)
    {
      this.theta++;
      text.handleTimeStep(gamestate);
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
      ctx.globalAlpha = .25;
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
      ctx.globalAlpha = 1;
      
      y = mustache.y;
      mustache.y += Math.sin(this.theta) * this.waggle;
      mustache.paint(canvas, ctx);
      mustache.y = y;
      
      face.paint(canvas, ctx);
      text.paint(canvas, ctx);
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
    display: "",
    x: x,
    y: y,
    height: height,
    text_done : function (){},
    handleTimeStep()
    {
      if (this.display.length < this.text.length)
      {
        this.display += this.text.charAt(this.display.length);
        if (this.display.length === this.text.length)
        {
          this.text_done();
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
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.display, x, y);
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