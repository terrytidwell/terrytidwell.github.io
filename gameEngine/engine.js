var createJutGameEngine = function(new_canvas) {

//public:
  var switchToScreen = function(screen)
  {
    screen.reset();
    current_screen = screen;
  };

  var loadImage = function (url)
  {
    var image = new Image();
    resourceTracker.add();
    image.onload = function (event)
    {
      resourceTracker.onload(event);
    };
    image.src = url;
    return image;
  };

  var loadAudio = function (url)
  {
    var audio = new buzz.sound(
      url, {
        //formats: [ "wav" ],
        preload: true,
        autoplay: false,
        loop: false
      });
    resourceTracker.add();
    audio.bindOnce("canplay", function (event)
    {
      resourceTracker.onload(event)
    });
    return audio;
  };
  
  var addTitleScreen = function(new_screen)
  {
    screens.unshift(new_screen);
  }
  
  var setFullScreenMode = function()
  {
    resize = resizeToFullScreen;
  }
  
  var setMaintainAspectRatioMode = function(new_aspect_ratio)
  {
    widthToHeightRatio = new_aspect_ratio;
    resize = resizeAndMaintainAspectRatio;
  }
  
  var setStaticCanvasMode = function()
  {
    resize = resizeNoOp;    
  }
  
  var init = function()
  {
    document.addEventListener('wheel', function(event) {
      if(current_screen.handleMouseWheel)
      {
        current_screen.handleMouseWheel(event);
      }
    });

    canvas.addEventListener("mousedown", function (event) {
      if(current_screen.handleMouseDown)
      {
        current_screen.handleMouseDown(event);
      }
    }, false);

    canvas.addEventListener("mouseup", function (event) {
      if(current_screen.handleMouseUp)
      {
        current_screen.handleMouseUp(event);
      }
    }, false);

    canvas.addEventListener("mouseleave", function (event) {
      if(current_screen.handleMouseUp)
      {
        current_screen.handleMouseUp(event);
      }
    }, false);

    canvas.addEventListener("mouseout", function (event) {
      if(current_screen.handleMouseUp)
      {
        current_screen.handleMouseUp(event);
      }
    }, false);

    canvas.addEventListener("mousemove", function (event) {
      if(current_screen.handleMouseMove)
      {
        current_screen.handleMouseMove(event);
      }
    }, false);

    document.addEventListener("keydown", function (event) {
      if(current_screen.handleKeyDown)
      {
        current_screen.handleKeyDown(event);
      }
    }, false);

    document.addEventListener("keyup", function (event) {
      if(current_screen.handleKeyUp)
      {
        current_screen.handleKeyUp(event);
      }
    }, false);
    
    window.addEventListener('resize', resize, false);
    window.addEventListener('orientationchange', resize, false);
    resize();

    resourceTracker.init();
    /*for(let screen = 0; screen < screens.length; screen++)
    {
      screens[screen].init();
    }
    */
    
    current_screen = resourceTracker;

    // start processing events
    setTimeout(eventLoop, 0);
  };
  
//private:
  var canvas = new_canvas;
  var current_screen = resourceTracker;
  var ctx = new_canvas.getContext("2d");
  var FPS = 25;
  var MILLIS_PER_SECOND = 1000;
  var screens = [];
  var widthToHeightRatio = 16/9;
  var resize = resizeNoOp;

  
  var resizeNoOp = function ()
  {
    return;
  }
    
  var resizeToFullScreen = function ()
  {
    canvas.width = window.innerWidth;
    canvas.height = window.innerWidth;
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    
    if (current_screen)
    {
      ctx.save();
      current_screen.paint(canvas, ctx);
      ctx.restore();
    }
  }
  
  var resizeAndMaintainAspectRatio = function ()
  {
    var currentWidthToHeightRatio = window.innerWidth/window.innerHeight;
    if(currentWidthToHeightRatio < widthToHeightRatio)
    {
      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth / widthToHeightRatio;
      canvas.style.left = "0px";
      canvas.style.top = Math.floor((window.innerHeight - canvas.height)/2) + "px";
    }
    else
    {
      canvas.width = window.innerHeight * widthToHeightRatio;
      canvas.height = window.innerHeight;
      canvas.style.left = Math.floor((window.innerWidth - canvas.width)/2) + "px";
      canvas.style.top = "0px"; 
    }
    
    if (current_screen)
    {
      ctx.save();
      current_screen.paint(canvas, ctx);
      ctx.restore();
    }
  };
  
  var resourceTracker = {
    m_added: 1, // I track myself loading
    m_loaded: 0,

    init: function ()
    {
        this.onload(null); //and here I'm loaded
    },

    handleTimeStep: function ()
    {
      if (this.m_loaded == this.m_added)
      {
        this.onAllLoaded();
      }
    },

    paint: function (canvas, ctx)
    {
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // paint the background
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font="Bold 80px Arial";
      ctx.fillStyle = "rgb(92, 92, 92)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        Math.floor(100 * this.m_loaded / this.m_added) + "%",
        canvas.width / 2,
        canvas.height / 2
      );
    },

    add: function ()
    {
      ++this.m_added;
    },

    onload: function (event)
    {
      ++this.m_loaded;
      if (this.m_loaded == this.m_added)
      {
        this.onAllLoaded();
      }
    },

    onAllLoaded: function ()
    {
      switchToScreen(screens[0]);
    }
  };
  
  var eventLoop = function()
  {
    var start_time = Date.now();

    current_screen.handleTimeStep();
    ctx.save();
    current_screen.paint(canvas, ctx);
    ctx.restore();

    var end_time = Date.now();
    var comp_time = end_time - start_time;
    if (comp_time > (MILLIS_PER_SECOND / FPS) || comp_time < 0) {
      setTimeout(eventLoop, 0);
    }
    else
    {
      setTimeout(eventLoop, (MILLIS_PER_SECOND / FPS) - comp_time);
    }
  } 
  
  return {
    init : init,
    switchToScreen : switchToScreen,
    loadAudio : loadAudio,
    loadImage : loadImage,
    addTitleScreen : addTitleScreen,
    setFullScreenMode : setFullScreenMode,
    setMaintainAspectRatioMode : setMaintainAspectRatioMode,
    setStaticCanvasMode : setStaticCanvasMode,
  };
};