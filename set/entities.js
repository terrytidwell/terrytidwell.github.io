//------------------------------------------------------------------------
const Util = {
  
  forEach: function (obj, fn)
  {
    var key;
    for (key in obj)
    {
      if (obj.hasOwnProperty(key))
      {
          fn(obj[key]);
      }
    }
  },

  randomItem: function (arr)
  {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  shuffle: function (arr)
  {
    var current_index = arr.length, temp, random_index;
    while (0 != current_index)
    {
      // Pick a remaining element.
      random_index = Math.floor(Math.random() * current_index);
      current_index -= 1;

      // And swap it with the current element.
      temp = arr[current_index];
      arr[current_index] = arr[random_index];
      arr[random_index] = temp;
    }
    return arr;
  }
};

//------------------------------------------------------------------------
var PAINT_LEVEL = {
  BG : -1,
  FG : 1,
  HUD_BG : 2,
  HUD : 3
};

var COLOR = {
  RED: 0,
  GREEN: 1,
  BLUE: 2,
  properties : {
    getRgb(color) {
      switch (color)
      {
        case (COLOR.RED) :
          return "#FF9900";
        case (COLOR.GREEN) :
          return "#BCBCBC";
        case (COLOR.BLUE) :
          return "#3299BB";
      };
    }
  }
};
/*
pastel
.style-0 path { fill: #FF9900; }
.style-1 path { fill: #424242; }
.style-2 path { fill: #E9E9E9; }
.style-3 path { fill: #BCBCBC; }
.style-4 path { fill: #3299BB; }
*/

/*
50'
#6F491A
#BCE7B1
#0CB6AB
#0189A1
#FEFFB1
*/

var SHAPE = {
  TRIANGLE: 0,
  CIRCLE: 1,
  SQUARE: 2,
  properties : {
  }
};

var FILL = {
  EMPTY: 0,
  STRIPED: 1,
  FULL: 2,
  properties : {
  }
};

var CARDINALITY = {
  ONE : 0,
  TWO : 1,
  THREE : 2,
  properties : {
  }
};

function randomProperty()
{
  return Math.floor(Math.random() * 3);
}

function otherProperty(property1, property2)
{
  return 3 - property1 - property2
}

function completeSet(property1, property2)
{
  if (property1 !== property2)
  {
    return otherProperty(property1, property2);
  }
  return property1;
};

function createDistinctProperty(property1, property2)
{
  if (property1 === property2)
  {
    return changeProperty(property1);
  }
  return otherProperty(property1, property2);;
}

function changeProperty(property)
{
  return (property + 1 + Math.floor(Math.random() * 2)) % 3;
}

function compareElements(a, b, c)
{
  if (a == c)
  {
    if (a != b)
    {
      return false;
    }
  }
  else
  {
    if (a + b + c != 3)
    {
      return false;
    }
  }
  return true;
}

function detectSet3Cards(card1, card2, card3)
{
  return compareElements(card1.cardinality, card2.cardinality, card3.cardinality) &&
    compareElements(card1.shape, card2.shape, card3.shape) &&
    compareElements(card1.color, card2.color, card3.color) &&
    compareElements(card1.fill, card2.fill, card3.fill);
}

function detectSet(cards)
{
  return detectSet3Cards(cards[0], cards[1], cards[2]);
}

//-----------------------------------------------------------------
function createCompletingShape(shape1, shape2, x, y, size)
{
  return createShape(
    completeSet(shape1.shape, shape2.shape),
    completeSet(shape1.color, shape2.color),
    completeSet(shape1.fill, shape2.fill),
    completeSet(shape1.cardinality, shape2.cardinality),
    x,
    y,
    size
  );
};

function createDifferentShape(shape, x, y, size)
{
  var properties = [
    shape.shape,
    shape.color,
    shape.fill,
    shape.cardinality
  ];
  
  var index_to_modify = Math.floor(Math.random() * properties.length);
  for (let i = 0; i < properties.length; i++)
  {
    if (i === index_to_modify)
    {
      properties[i] = changeProperty(properties[i]);  
    }
    else
    {
      properties[i] = randomProperty();
    }
  }
  return createShape(
    properties[0],
    properties[1],
    properties[2],
    properties[3],
    x,
    y,
    size
  );
}

function createDistinctShape(shape1, shape2, x, y, size)
{
  var properties = [
    createDistinctProperty(shape1.shape, shape2.shape),
    createDistinctProperty(shape1.color, shape2.color),
    createDistinctProperty(shape1.fill, shape2.fill),
    createDistinctProperty(shape1.cardinality, shape2.cardinality),
  ];
  
  var index_to_modify = Math.floor(Math.random() * properties.length);
  for (let i = 0; i < properties.length; i++)
  {
    if (i === index_to_modify)
    {
      //do nothing  
    }
    else
    {
      properties[i] = randomProperty();
    }
  }
  return createShape(
    properties[0],
    properties[1],
    properties[2],
    properties[3],
    x,
    y,
    size
  );
}

function createEvilRandomShape(shape1, shape2, x, y, size)
{
  var properties = [
    completeSet(shape1.shape, shape2.shape),
    completeSet(shape1.color, shape2.color),
    completeSet(shape1.fill, shape2.fill),
    completeSet(shape1.cardinality, shape2.cardinality)
  ];
  var index_to_modify = Math.floor(Math.random() * properties.length);
  properties[index_to_modify] = changeProperty(properties[index_to_modify]);
  return createShape(
    properties[0],
    properties[1],
    properties[2],
    properties[3],
    x,
    y,
    size
  );
};


function createShape(shape, color, fill, cardinality, x, y, size)
{
  var paintCard = function(shape, color, fill, cardinality, x, y, size, ctx)
  {
    var rgb = COLOR.properties.getRgb(color);
    if (cardinality === CARDINALITY.ONE)
    {
      paintShape(shape, rgb, fill, x, y, size, ctx);
    }
    else if (cardinality === CARDINALITY.TWO)
    {
      var small_size = size / 2;
      paintShape(shape, rgb, fill, x, y + size / 2 - small_size / 2, small_size, ctx);
      paintShape(shape, rgb, fill, x + small_size, y + size / 2 - small_size / 2, small_size, ctx);
    }
    else if (cardinality === CARDINALITY.THREE)
    {
      var small_size = size / 2;
      paintShape(shape, rgb, fill, x + size / 2 - small_size / 2, y, small_size, ctx);
      paintShape(shape, rgb, fill, x, y + size - small_size, small_size, ctx);
      paintShape(shape, rgb, fill, x + small_size, y + size - small_size, small_size, ctx);
    }
  }

  var paintShape = function(shape, rgb, fill, x, y, size, ctx)
  {
    ctx.strokeStyle = rgb;
    ctx.fillStyle = '#ffffff';
    if (fill === FILL.FULL)
    {
      ctx.fillStyle = rgb;
    }
    ctx.lineWidth = Math.round(size / 13);
    ctx.lineCap = "round";
    x += ctx.lineWidth;
    y += ctx.lineWidth;
    size -= ctx.lineWidth * 2;

    if (shape == SHAPE.TRIANGLE)
    {
      if (fill === FILL.FULL)
      {
        ctx.beginPath();
        ctx.moveTo(Math.round(x), Math.round(y + size));
        ctx.lineTo(Math.round(x + size / 2), Math.round(y + ctx.lineWidth/2));
        ctx.lineTo(Math.round(x + size), Math.round(y + size));
        ctx.closePath();
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(Math.round(x), Math.round(y + size));
      ctx.lineTo(Math.round(x + size / 2), Math.round(y + ctx.lineWidth/2));
      ctx.lineTo(Math.round(x + size), Math.round(y + size));
      ctx.closePath();
      ctx.stroke();
      if (fill === FILL.STRIPED)
      {
        for (var line_count = 1; line_count < 6; line_count++)
        {
          var fraction = Math.abs(line_count - 3);
          ctx.beginPath();
          ctx.moveTo(Math.round(x + line_count * size / 6), Math.round(y + fraction * size / 3 + ctx.lineWidth/2));
          ctx.lineTo(Math.round(x + line_count * size / 6), Math.round(y + size));
          ctx.stroke();
        }
      }
    }

    else if (shape === SHAPE.CIRCLE)
    {
      if (fill === FILL.FULL)
      {
        ctx.beginPath();
        ctx.moveTo(Math.round(x + size), Math.round(y + size / 2));
        ctx.arc(Math.round(x + size / 2), Math.round(y + size / 2), size / 2, 0, 2 * Math.PI, false);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(Math.round(x + size), Math.round(y + size / 2));
      ctx.arc(Math.round(x + size / 2), Math.round(y + size / 2), size / 2, 0, 2 * Math.PI, false);
      ctx.stroke();
      if (fill === FILL.STRIPED)
      {
        for (var line_count = 1; line_count < 6; line_count++)
        {
          var distance = size * Math.abs(line_count - 3) / 6;
          var half_height = Math.sqrt(size * size / 4 - distance * distance);
          var offset = size / 2 - half_height;
          ctx.beginPath();
          ctx.moveTo(Math.round(x + line_count * size / 6), Math.round(y + offset));
          ctx.lineTo(Math.round(x + line_count * size / 6), Math.round(y + size - offset));
          ctx.stroke();
        }
      }
    }

    else if (shape === SHAPE.SQUARE)
    {
      if (fill === FILL.FULL)
      {
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size));
      }
      ctx.strokeRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size));
      if (fill === FILL.STRIPED)
      {
        for (var line_count = 1; line_count < 6; line_count++)
        {
          ctx.beginPath();
          ctx.moveTo(Math.round(x + line_count * size / 6), Math.round(y));
          ctx.lineTo(Math.round(x + line_count * size / 6), Math.round(y + size));
          ctx.stroke();
        }
      }
    }
  }
  
  return {
    shape : shape,
    color : color,
    fill : fill,
    cardinality : cardinality,
    x : x,
    y : y,
    size : size,
    alive : true,
    rotation : 0,
    intensity : 0, //.3,
    offset : 0,
    dy : 0,
    active : function()
    {
      return this.alive;
    },
    cancel : function ()
    {
      this.alive = false;
    },
    handleTimeStep(gamestate)
    {
      this.rotation-=.25;
      if (this.offset > 0)
      {
        this.dy += 1/128;
        this.offset-=this.dy;
        if (this.offset <= 0)
        {
          this.offset = 0;
          this.intensity = .2;
          this.rotation = 0;
          this.dy = 0;
        }
      }
      
      var current_rotation = 0;
      if (this.intensity > 0)
      {
        this.intensity*=.90;
      }
      if (this.intensity < 0.005)
      {
        this.intensity = 0;
      }
    },
    paint : function(gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = (this.y - this.offset) * canvas.height;
      var size = this.size * canvas.height;
      
      ctx.save();
      var current_rotation = 0;
      if (this.intensity !== 0)
      {
        current_rotation = this.intensity*Math.sin(this.rotation);
      }
      if(current_rotation < 0)
      {
        ctx.translate(x, y + size);
        ctx.rotate(current_rotation);
        x = 0;
        y = -size;
      }
      else
      {
        ctx.translate(x + size, y + size);
        ctx.rotate(current_rotation);
        x = -size;
        y = -size;
      }
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x,y,size,size);
      paintCard(this.shape, this.color, this.fill, this.cardinality, x, y, size, ctx);
      ctx.restore();
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createButton(graphic, bgcolor, highlight, onclick, x, y, size)
{
  return {
    x : x,
    y : y,
    size : size,
    graphic : graphic,
    highlighted : false,
    handleMouseDown : function(x, y)
    {
      if (this.x <= x && x <= this.x + this.size &&
        this.y <= y && y <= this.y + this.size)
      {
        this.highlighted = true;
        onclick();
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      var size = this.size * canvas.height;
      ctx.lineWidth = size/26;
      
      if (this.highlighted)
      {
        //x += ctx.lineWidth;
        y += 2*ctx.lineWidth;
      }
      else
      {
        ctx.globalAlpha=.5;
        ctx.fillStyle = "#000000";
        ctx.fillRect(x, y + 2*ctx.lineWidth, size, size);
        ctx.globalAlpha=1;  
      }
      ctx.fillStyle = this.highlighted ? highlight : bgcolor;
      ctx.fillRect(x,y,size,size);
      
      ctx.strokeStyle = "#ffffff";
      ctx.drawImage(this.graphic, x, y, size, size);
      ctx.globalAlpha=.5;
      ctx.beginPath();
      ctx.moveTo(x + size - ctx.lineWidth, y + ctx.lineWidth);
      ctx.lineTo(x + ctx.lineWidth, y + ctx.lineWidth);
      ctx.lineTo(x + ctx.lineWidth, y + size - ctx.lineWidth);
      ctx.stroke();
      ctx.globalAlpha=1;
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.HUD;
    }
  };
};

function createScore(x, y, height)
{
  return {
    value : 0,
    x : x,
    y : y,
    height : height,
    timer : 0,
    max_timer : 3,
    direction : 0,
    handleTimeStep : function(gamestate)
    {
      if (this.timer <= this.max_timer && this.timer >= 0)
      {
        this.timer+=this.direction;
        if (this.timer >= this.max_timer)
        {
          this.timer = this.max_timer;
          this.direction = -2;
        }
        if (this.timer <= 0)
        {
          this.timer = 0;
          this.direction = 0;
        }
      }
    },
    increment()
    {
      this.value++;
      this.direction = 1;
    },
    update(new_value)
    {
      this.value = new_value;
      this.direction = 1;
    },
    paint : function (gamestate, canvas, ctx)
    {
      var growth = 1 + ((this.timer / this.max_timer) * .5);
      var height = Math.round(growth * this.height * canvas.height);
      var x = Math.round(this.x * canvas.height);
      var y = Math.round(this.y * canvas.height);
      ctx.font = height + "px " + g_font;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";
      ctx.fillText(this.value, x, y);
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.HUD;
    }
  };
};

//---------------------------------------------------------------------
function createBackground()
{
  return {
    paint : function (gamestate, canvas, ctx)
    {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#CBDBE0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.BG;
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

