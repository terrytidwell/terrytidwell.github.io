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
      this.mouse_click_event = false;
      this.mouse_click_x = 0;
      this.mouse_click_y = 0;
      this.mouse_x = 0;
      this.mouse_y = 0;
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
      this.mouse_click_event = true;
      this.mouse_click_x = event.offsetX / event.currentTarget.height;
      this.mouse_click_y = event.offsetY / event.currentTarget.height;
    },

    handleMouseMove: function(event)
    {
      this.mouse_x = event.offsetX / event.currentTarget.height;
      this.mouse_y = event.offsetY / event.currentTarget.height;
    },

    handleTimeStep: function()
    {

      for (var i = 0; i < this.gamestate.gameEntities.length; i++)
      {
        if(this.gamestate.gameEntities[i].handleMouseMove)
        {
          this.gamestate.gameEntities[i].handleMouseMove(this.mouse_x, this.mouse_y);
        }
      }

      if (this.mouse_click_event)
      {
        this.mouse_click_event = false;
        for (var i = 0; i < this.gamestate.gameEntities.length; i++)
        {
          if(this.gamestate.gameEntities[i].handleMouseDown)
          {
            this.gamestate.gameEntities[i].handleMouseDown(this.mouse_click_x, this.mouse_click_y);
          }
        }
      }

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
          this.gamestate.gameEntities[i].paint(this.gamestate,canvas,ctx);
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
    waggle: 0,
    theta: 0,
    paint: function (gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = (this.y + Math.sin(this.theta++) * this.waggle) * canvas.height;
      var width = this.width * canvas.height;
      var height = this.height * canvas.height;
      ctx.drawImage(this.image,
        this.sx, this.sy, this.swidth, this.sheight,
        x, y, width, height);
    }
  };
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
    counter : 50,
    text_done : function (){},
    text_restarted : function (){},
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
      else
      {
        this.counter--;
        if (this.counter === 0)
        {
          this.counter = 50;
          this.display = "";
          this.text_restarted();
        }
      }
    },
    paint: function (gamestate, canvas, ctx)
    {
      var height = canvas.height * this.height;
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      ctx.font = Math.round(height) + "px American Typewriter";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.display, x, y);
    }
  };
};

//---------------------------------------------------------------------
function createBackground()
{
  return {
    fillStyle : "#ffffff",
    paint : function (gamestate, canvas, ctx)
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