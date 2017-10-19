const JutGameEngine = (function() {
  var canvas = document.createElement('canvas');
  var current_screen = null;
  this.ctx = g_canvas.getContext("2d");
  
  this.resize = function ()
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
      current_screen.paint(g_ctx);
    }
  },
  
  this.init = function()
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
    
    window.addEventListener('resize', this.resize, false);
    window.addEventListener('orientationchange', this.resize, false);
    this.resize();

  }
  
}());