const JutGameEngine = (function() {
  var canvas = document.getElementById("canvas");
  var current_screen = resourceTracker;
  var ctx = canvas.getContext("2d");
  var FPS = 25;
  var MILLIS_PER_SECOND = 1000;
  
  var resize = function ()
  {
    var widthToHeightRation = 9/16;
    var currentWidthToHeightRatio = window.innerWidth/window.innerHeight;
    if(currentWidthToHeightRatio < widthToHeightRation)
    {
      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth / widthToHeightRation;
      canvas.style.left = "0px";
      canvas.style.top = Math.floor((window.innerHeight - canvas.height)/2) + "px";
    }
    else
    {
      canvas.width = window.innerHeight * widthToHeightRation;
      canvas.height = window.innerHeight;
      canvas.style.left = Math.floor((window.innerWidth - canvas.width)/2) + "px";
      canvas.style.top = "0px"; 
    }
    
    if (current_screen)
    {
      current_screen.paint(canvas, ctx);
    }
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
      switchToScreen(GameScreen);
    }
  };
  
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
    
    current_screen = resourceTracker;

    // start processing events
    setTimeout(eventLoop, 40);
  };
  
  var eventLoop = function()
  {
    var start_time = Date.now();

    current_screen.handleTimeStep();
    current_screen.paint(canvas, ctx);

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
  
  var switchToScreen = function(screen)
  {
    screen.reset();
    current_screen = screen;
  };
  
  return {
    init : init,
    switchToScreen : switchToScreen,
    loadAudio : loadAudio,
    loadImage : loadImage
  };
  
}());