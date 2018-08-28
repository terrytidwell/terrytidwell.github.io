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

//------------------------------------------------------------------------
var PAINT_LEVEL = {
  BG : -1,
  EFFECT : 0,
  FG : 1,
  HUD_BG : 2,
  HUD : 3,
  AFTER_EFFECT : 4,
  OVERLAY : 5
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
};

function changeProperty(property)
{
  return (property + 1 + Math.floor(Math.random() * 2)) % 3;
};

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
};

function detectSet3Cards(card1, card2, card3)
{
  return compareElements(card1.cardinality, card2.cardinality, card3.cardinality) &&
    compareElements(card1.shape, card2.shape, card3.shape) &&
    compareElements(card1.color, card2.color, card3.color) &&
    compareElements(card1.fill, card2.fill, card3.fill);
};

function detectSet(cards)
{
  return detectSet3Cards(cards[0], cards[1], cards[2]);
};

function sortCards(cards)
{
  cards.sort(function(a,b){
    var value = 
      (a.cardinality * 27 + a.fill*9 + a.shape*3 + a.color) -
      (b.cardinality * 27 + b.fill*9 + b.shape*3 + b.color);
      
    return value;
  });
}

function createTileSet(set_size, desired_sets)
{
  var return_set = [];
  var allShapes = [];
  for(var all = 0; all < 81; all++)
  {
    var current = all;
    var prop1 = Math.floor(current / 27);
    current -= prop1 * 27;
    var prop2 = Math.floor(current / 9);
    current -= prop2 * 9;
    var prop3 = Math.floor(current / 3);
    current -= prop3 * 3;
    allShapes.push({
      color: prop1,
      fill: prop2,
      cardinality: prop3,
      shape: current}
    );
    
  }
  Util.shuffle(allShapes);
  
  for (let i = 0; i < set_size; i++)
  {
    return_set.push(allShapes.shift());
  }
  var i = [0, 1, 2];
  var sets = [];
  while(sets.length !== desired_sets)
  {
    var matched = [
      false, false, false, false,
      false, false, false, false,
      false, false, false, false
    ];
    var unmatched = 12;
    sets = [];
    for(i[0] = 0; i[0] <  return_set.length - 2; i[0]++)
    {
      for(i[1] = i[0] + 1; i[1] <  return_set.length - 1; i[1]++)
      {
        for(i[2] = i[1] + 1; i[2] <  return_set.length; i[2]++)
        {
          if (
            detectSet3Cards(
              return_set[i[0]],
              return_set[i[1]],
              return_set[i[2]]
            )
          )
          {
            sets.push([i[0],i[1],i[2]]);
            for(iter in i)
            {
              if (!matched[i[iter]])
              {
                matched[i[iter]] = true;
                unmatched--;
              }
            }
          }
        }
      }
    }
    
    var shapes_indices = [
        0, 1, 2, 3,
        4, 5, 6, 7,
        8, 9, 10, 11
      ];
    if (sets.length < desired_sets)
    {
      var swapped = false;
      while (!swapped)
      {
        Util.shuffle(shapes_indices);
        var shape1 = return_set[shapes_indices[0]];
        var shape2 = return_set[shapes_indices[1]];
        var shape3 = return_set[shapes_indices[2]];
        
        var prop1 = completeSet(shape1.cardinality, shape2.cardinality);
        var prop2 = completeSet(shape1.color, shape2.color);
        var prop3 = completeSet(shape1.fill, shape2.fill);
        var prop4 = completeSet(shape1.shape, shape2.shape);
        //make sure it's ok to put it in
        for (var all = 0; all < allShapes.length; all++)
        {
          if (allShapes[all].cardinality === prop1 &&
            allShapes[all].color === prop2 &&
            allShapes[all].fill === prop3 &&
            allShapes[all].shape === prop4)
          {
            swapped = true;
            return_set.push(allShapes[all]);
            allShapes.splice(all,1);
            return_set.splice(shapes_indices[2],1);
            allShapes.push(shape3);
            break;
          }
        }
      }
    }
    else if (sets.length > desired_sets)
    {
      var set_index = Math.floor(sets.length * Math.random());
      var set_member = Math.floor(3 * Math.random());
      var index_to_remove = sets[set_index][set_member];
      return_set.push(allShapes.shift());
      allShapes.push(return_set[index_to_remove]);
      return_set.splice(index_to_remove,1);
    }
  }
  console.log("current sets" + sets);
  
  return return_set;
};

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

function paintCard(shape, color, fill, cardinality, x, y, size, ctx)
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
};

function paintShape (shape, rgb, fill, x, y, size, ctx)
{
  ctx.strokeStyle = rgb;
  ctx.fillStyle = '#ffffff';
  if (fill === FILL.FULL)
  {
    ctx.fillStyle = rgb;
  }
  ctx.shadowColor = ctx.strokeStyle;
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
};

function createVelociGamesLogo()
{
  return {
    timer : 1,
    y_offset : -1,
    dy : 0,
    handleTimeStep : function(gamestate)
    {
      this.active_timer--;
      this.dy += 1/128;
      this.y_offset+=this.dy;
      if (this.y_offset >= 0)
      {
        this.y_offset = 0;
        this.timer+=1;
      }
    },
    paint : function(gamestate, canvas, ctx)
    {
      var size = canvas.height / 6;
      ctx.font = Math.round(canvas.height/6) + "px " + g_font;
      var textWidth = ctx.measureText("VelociGames").width
      var dtext = textWidth - ctx.measureText("elociGames").width;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#000000";
      //ctx.fillText("VelociGames", canvas.width/2, canvas.height/2);
      ctx.fillText("elociGames", canvas.width/2 + dtext/2, canvas.height/2);
      var correction = size/2 - dtext/2;
      var x = canvas.width/2 - textWidth/2 - correction;
      var y = canvas.height/2 - size/2 + size + this.y_offset * canvas.height;
      var pivot_x = x + size/2;
      var pivot_y = canvas.height/2 - size/2 + size + this.y_offset * canvas.height;
      var theta = Math.PI - Math.PI/32;
      if (this.timer > 1 && this.timer < 75)
      {
        theta += (1/this.timer * Math.cos(this.timer) * Math.PI/16);
        
      }
      ctx.save();
      ctx.translate(pivot_x,pivot_y);
      ctx.rotate(theta);
      paintShape(SHAPE.TRIANGLE, COLOR.properties.getRgb(COLOR.RED), FILL.FULL, x-pivot_x, y-pivot_y, size, ctx);
      ctx.restore();
      ctx.fillStyle = "#CBDBE0";
      ctx.beginPath();
      ctx.arc(pivot_x,  canvas.height/2 - size/2 + size, size/5, 0, 2*Math.PI);
      ctx.fill();
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createGauge(callback)
{
  return {
    actual_fill : 5/6,
    display_fill : 0,
    started : false,
    called_callback : false,
    increment : function ()
    {
      this.actual_fill += .1;
      if (this.actual_fill > 1)
      {
        this.actual_fill = 1;
      }
      if (this.actual_fill < 0)
      {
        this.actual_fill = 0;
      }
    },
    decrement : function ()
    {
      this.actual_fill -= .2;
      if (this.actual_fill > 1)
      {
        this.actual_fill = 1;
      }
      if (this.actual_fill < 0)
      {
        this.actual_fill = 0;
      }
    },
    handleTimeStep : function (gamestate)
    {
      if (this.started)
      {
        //.004 is hard
        this.actual_fill -= .001;
      }
      if (this.actual_fill > 1)
      {
        this.actual_fill = 1;
      }
      if (this.actual_fill <= 0)
      {
        this.actual_fill = 0;
        if (this.display_fill <= .10)
        {
          if(!this.called_callback)
          {
            this.called_callback = true;
            callback();
          }
        }
      }
      var diff = this.actual_fill - this.display_fill
      this.display_fill += .05 * diff;
      
      
    },
    paint : function(gamestate, canvas, ctx)
    {
      var outer_radius = 1/4*canvas.height;
      ctx.lineWidth = outer_radius/26;
      var inner_radius = 1/8*canvas.height;
      var middle_radius = (outer_radius + inner_radius) / 2;
      var small_radius = 1/32*canvas.height;
      var center_x = canvas.width/2;
      var center_y = canvas.height;
      
      var color = "#808080";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, Math.PI, 2*Math.PI);
      ctx.fill();
      
      color = "#404040";
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius - ctx.lineWidth, Math.PI, 2*Math.PI);
      ctx.stroke();
      
      color = (this.display_fill >= .33 && this.display_fill <= .67) ? "#FFFF00" : "#808000";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, 4/3*Math.PI, 5/3*Math.PI);
      ctx.arc(center_x, center_y, outer_radius, 5/3*Math.PI, 4/3*Math.PI, true);
      ctx.fill();
      
      color = (this.display_fill >= 0 && this.display_fill < .33) ? "#FF0000" : "#800000";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, Math.PI, 4/3*Math.PI);
      ctx.arc(center_x, center_y, outer_radius, 4/3*Math.PI, Math.PI, true);
      ctx.fill();
      
      color = (this.display_fill > .67 && this.display_fill <= 1) ? "#00FF00" : "#008000";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, 5/3 * Math.PI, 2*Math.PI);
      ctx.arc(center_x, center_y, outer_radius, 2*Math.PI, 5/3 * Math.PI, true);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,.5)";
      ctx.beginPath();
      ctx.arc(center_x, center_y, outer_radius - ctx.lineWidth, Math.PI, 2*Math.PI);
      ctx.stroke();
      
      ctx.strokeStyle = "rgba(0,0,0,.5)";
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius + ctx.lineWidth, Math.PI, 2*Math.PI);
      ctx.stroke();
      
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, 4/3*Math.PI, 5/3*Math.PI);
      ctx.arc(center_x, center_y, outer_radius, 5/3*Math.PI, 4/3*Math.PI, true);
      ctx.closePath();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, Math.PI, 4/3*Math.PI);
      ctx.arc(center_x, center_y, outer_radius, 4/3*Math.PI, Math.PI, true);
      ctx.closePath();
      ctx.stroke();
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, inner_radius, 5/3 * Math.PI, 2*Math.PI);
      ctx.arc(center_x, center_y, outer_radius, 2*Math.PI, 5/3 * Math.PI, true);
      ctx.closePath();
      ctx.stroke();
      
      color = "#000000";
      ctx.fillStyle = color;
      ctx.font = Math.round(ctx.lineWidth*3) + "px " + g_font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("kS/hr",center_x, center_y - inner_radius/2);
      
      ctx.beginPath();
      ctx.arc(center_x, center_y, small_radius, 0, 2*Math.PI);
      ctx.fill();
      
      var display_angle =  this.display_fill * Math.PI + Math.PI;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(center_x, center_y, small_radius, display_angle - display_angle * .1, display_angle + display_angle * .1);
      ctx.arc(center_x, center_y, middle_radius, display_angle + display_angle * .001, display_angle - display_angle * .001, true);
      ctx.fill();
      
      //for (var tick = .33/5; tick < .99; tick += .33/5)
      //{
        /*
        var tick = this.actual_fill;
        var angle = tick * Math.PI + Math.PI;
        ctx.beginPath();
        ctx.arc(center_x, center_y, middle_radius, angle - angle * .001, angle + angle * .001);
        ctx.arc(center_x, center_y, outer_radius, angle + angle * .001, angle - angle * .001, true);
        ctx.fill();
        */
      //}
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.HUD;
    }
  };
}

function createPanel()
{
  function drawScrew(center_x,center_y,radius,inner_radius,ctx)
  {
    ctx.fillStyle = "#505050";
    ctx.beginPath();
    ctx.arc(center_x,center_y,radius,0,2*Math.PI);
    ctx.fill();
    

    
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(center_x, center_y, inner_radius,Math.PI,3/2*Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(center_x+ctx.lineWidth/2,center_y + radius);
    ctx.lineTo(center_x+ctx.lineWidth/2,center_y - radius);
    ctx.stroke();
    
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(center_x,center_y, radius,0,2*Math.PI);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(center_x,center_y + radius);
    ctx.lineTo(center_x,center_y - radius);
    ctx.stroke();
  };
  
  return {
    paint : function(gamestate, canvas, ctx)
    {
      ctx.fillStyle = "#424242"
      ctx.fillRect(0,3/4*canvas.height,canvas.width,canvas.height);
      /*var gradient = ctx.createLinearGradient(0,3/4*canvas.height,0,(3/4+1/64)*canvas.height);
      gradient.addColorStop(0,"rgb(0,0,0)");
      gradient.addColorStop(1,"#424242");
      ctx.fillStyle = gradient;
      */
      ctx.lineWidth = 1/256 * canvas.height;
      ctx.fillStyle = "#424242";
      ctx.fillRect(0,3/4*canvas.height,canvas.width,canvas.height);
      ctx.strokeStyle = "#000000";
      ctx.strokeRect(0+ctx.lineWidth/2,3/4*canvas.height,canvas.width-ctx.lineWidth,canvas.height);
      ctx.strokeStyle = "#606060";
      ctx.beginPath();
      ctx.moveTo(ctx.lineWidth*1.5,canvas.height);
      ctx.lineTo(ctx.lineWidth*1.5,canvas.height*3/4+ctx.lineWidth)
      ctx.lineTo(canvas.width - ctx.lineWidth,canvas.height*3/4+ctx.lineWidth)
      ctx.stroke();
      
      /*
      ctx.strokeStyle = "#000000";
      ctx.beginPath();
      ctx.moveTo(ctx.lineWidth*4.5,canvas.height);
      ctx.lineTo(ctx.lineWidth*4.5,canvas.height*3/4+ctx.lineWidth*4)
      ctx.lineTo(canvas.width - ctx.lineWidth*4.5,canvas.height*3/4+ctx.lineWidth*4)
      ctx.lineTo(canvas.width - ctx.lineWidth*4.5,canvas.height)
      ctx.stroke();
      */
      
      ctx.lineWidth = 1/64 * canvas.height / 13;
      var radius = 1/64 * canvas.height;
      var center_x = radius * 2;
      var center_y = 3/4*canvas.height + radius*2;
      var inner_radius = 1/72 * canvas.height;
      
      drawScrew(center_x,center_y,radius,inner_radius,ctx);
      
      center_x = canvas.width - radius * 2;
      
      drawScrew(center_x,center_y,radius,inner_radius,ctx);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.HUD_BG;
    }
  };
};

function createBlurEffect()
{
  return {
    blur : 30,
    focus : 0,
    focus_max : 25,
    direction : 1,
    handleTimeStep : function(gamestate)
    {
      this.focus += this.direction;
      
      if (this.focus < 0)
      {
        this.focus = 0;
        this.direction = 1;
      }
      else if (this.focus > this.focus_max)
      {
        this.focus = this.focus_max;
        this.direction = -1;
      }
      this.blur = 20 * (1 - this.focus / this.focus_max);
    },
    paint : function(gamestate, canvas, ctx)
    {
      ctx.shadowBlur=Math.round(this.blur);
      ctx.shadowOffsetX = canvas.width * 2;
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.EFFECT;
    }
  };
};

function createLogo2()
{
  return {
    paint : function (gamestate, canvas, ctx)
    {
      var center_x = canvas.width/2;
      var center_y = canvas.height/2;
      var height = canvas.height * 3/4;
      var width = 3/5 * height;
      var x = center_x - width/2;
      var y = center_y - height/2;
      
      ctx.lineWidth = Math.round(width / 13);
      ctx.strokeStyle = "rgb(0, 0, 0, .25)";
      ctx.fillStyle = "rgba(0, 0, 0, .25)";
      var start_angle = Math.atan(3/5);
      ctx.fillStyle = COLOR.properties.getRgb(COLOR.BLUE);
      ctx.beginPath();
      ctx.arc(x + 12/18 * width, y + 6/18 * height, Math.sqrt(1/3 * width * 1/3 * width + 1/3 * height * 1/3 * height), .5 * Math.PI + start_angle, 1.5 * Math.PI + start_angle);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = COLOR.properties.getRgb(COLOR.RED);
      ctx.beginPath();
      ctx.arc(x + 6/18 * width, y + 12/18 * height, Math.sqrt(1/3 * width * 1/3 * width + 1/3 * height * 1/3 * height), 1.5 * Math.PI + start_angle, 2.5 * Math.PI + start_angle);
      ctx.closePath();
      ctx.fill();
      
      return;
      
      ctx.strokeStyle = "rgb(0, 0, 0, .25)";
      ctx.fillStyle = "rgba(0, 0, 0, .25)";
      ctx.fillRect(x, y, width, height);
      ctx.lineWidth = Math.round(width / 26);
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + width, y);
      ctx.stroke();
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createLogo()
{
  return {
    angle : 0,
    timer : 0,
    handleTimeStep : function ()
    {
      this.timer++;
      if (Math.floor((this.timer % 36)/18) === 0)
      {
        this.angle += 2 * Math.PI * 1/24/9;
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      var center_x = canvas.width/2;
      var center_y = canvas.height/2;
      var size = canvas.height;
      var radius = size/2;
      var inner_radius = radius * 14/16;
      var next_radius = radius * 12/16;
      var x = center_x - size/2;
      var y = center_y - size/2;
      
      ctx.lineWidth = Math.round(size / 13);
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.beginPath();
      var num_teeth = 24;
      for(var teeth = 0; teeth < num_teeth; teeth++)
      {
        var start_arc = (teeth + .5) / num_teeth * 2 * Math.PI + this.angle;
        var end_arc = (teeth + 1.5) / num_teeth * 2 * Math.PI + this.angle;
        if (teeth % 2 < 3)// === 0)
        {
          start_arc += (2 * Math.PI * .15 / num_teeth);
          end_arc -= (2 * Math.PI * .15 / num_teeth);
        }
        ctx.arc(center_x, center_y, (teeth % 2 == 0) ? radius : inner_radius, start_arc, end_arc);
      }
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.beginPath();
      ctx.arc(center_x, center_y, next_radius, 0, 2*Math.PI);
      ctx.fill();
      
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.beginPath();
      ctx.arc(center_x, center_y, radius * 11/16, 0, 2*Math.PI);
      ctx.fill();
      
      /*
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.beginPath();
      ctx.arc(center_x, center_y, radius * 9/16, 0, 2*Math.PI);
      ctx.fill();
      */
      
      ctx.font=Math.round(6/9 *  radius * 11/16) + "px Arial";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S.E.T.", canvas.width / 2, canvas.height / 2);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createBox(x,y,width,height)
{
  return {
    x: x,
    y: y,
    width : width,
    height : height,
    paint : function (gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      var width = this.width * canvas.height;
      var height = this.height * canvas.height;
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(x,y,width,height);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.BG;
    }
  }
}

function createCountDown()
{
  return {
    timer : 0,
    period : 25,
    countdown : 4,
    active : function ()
    {
      return this.countdown > 0;
    },
    handleTimeStep : function (gamestate)
    {
      this.timer++;
      if (this.timer > this.period)
      {
        this.timer = 0;
        this.countdown--;
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      ctx.lineWidth = Math.round(canvas.height / 90);
      ctx.strokeStyle = "rgb(0, 0, 0)";
      ctx.fillStyle = "rgb(128, 128, 128)";
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(canvas.width / 2, -canvas.height / 2);
      var percent_covered = 1.5 + 2 * this.timer / this.period;
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height, 1.5*Math.PI, percent_covered*Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(canvas.width / 2, -canvas.height / 2);
      var percent_covered = 1.5 + 2 * this.timer / this.period;
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height, 1.5*Math.PI, percent_covered*Math.PI);
      ctx.closePath();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0,canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.round(160/450*canvas.height), 0, 2*Math.PI);
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.round(200/450*canvas.height), 0, 2*Math.PI);
      ctx.stroke();
      
      ctx.font=Math.round(6/9 * canvas.height) + "px Arial";
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.countdown, canvas.width / 2, canvas.height / 2);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createWordButton(word, x, y, height, onclick)
{
  return  {
    x : x,
    y : y,
    word : word,
    height : height,
    onclick : onclick,
    last_width : 0,
    highlighted : false,
    handleMouseMove : function (x,y)
    {
      if (this.x - this.last_width / 2 <= x &&
        x <= this.x + this.last_width / 2 &&
        this.y - this.height / 2 <= y &&
        y <= this.y + this.height / 2)
      {
        if (!this.highlighted)
        {
          this.highlighted = true;
        }
      }
      else
      {
        this.highlighted = false;
      }
    },
    handleMouseDown : function (x,y)
    {
      this.handleMouseMove (x, y);
      if (this.highlighted)
      {
        this.onclick();
      }
    },
    paint : function(gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      var height = this.height * canvas.height;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = Math.round(height) + "px " + g_font;
      
      var width_on_screen = ctx.measureText(this.word).width;
      this.last_width = width_on_screen / canvas.height;
      
      if(this.highlighted)
      {
        ctx.fillStyle = "rgba(0,0,0,.25)";
        ctx.fillRect(Math.round(x - height/2), Math.round(y - height/2), height, height);
      }
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillText(this.word, Math.round(x), Math.round(y));
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createLetterShape(letter, shape, color, x, y, size)
{
  return  {
    x : x,
    y : y,
    letter : letter,
    shape : shape,
    color : color,
    fill : FILL.FULL,
    cardinality : CARDINALITY.ONE,
    size : size,
    paint : function(gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      var size = this.size * canvas.height;

      paintCard(this.shape, this.color, this.fill, this.cardinality, x, y, size, ctx);
      ctx.lineWidth = size/13;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = Math.round(size) + "px " + g_font;
      ctx.fillStyle = "rgb(255, 255, 255)";
      
      ctx.strokeText(this.letter, Math.round(x + size/2), Math.round(y + size/2 + ctx.lineWidth));
      ctx.fillText(this.letter, Math.round(x + size/2), Math.round(y + size/2 + ctx.lineWidth));
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createShapeButton(shape, color, fill, cardinality, x, y, size, callback)
{
  return {
    shape : shape,
    color : color,
    fill : fill,
    cardinality : cardinality,
    x : x,
    y : y,
    size : size,
    alive : true,
    selected : false,
    callback : callback,
    active : function()
    {
      return this.alive;
    },
    cancel : function ()
    {
      this.alive = false;
    },
    handleMouseDown(x,y)
    {
      if (x >= this.x && x <= this.x + this.size &&
        y >= this.y && y <= this.y + this.size
      )
      {
        this.selected = !this.selected;
        this.callback();
      }
    },
    handleTimeStep(gamestate)
    {
    },
    paint : function(gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = (this.y) * canvas.height;
      var size = this.size * canvas.height;

      if(this.selected)
      {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(x,y,size,size);
      }
      paintCard(this.shape, this.color, this.fill, this.cardinality, x, y, size, ctx);
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createShape(shape, color, fill, cardinality, x, y, size)
{
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
      ctx.shadowColor = ctx.fillStyle;
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

function createScreenClick(callback)
{
  return {
    handleMouseDown : function(x,y)
    {
      callback();
    }
  };
};

function createButton(graphic, onclick, x, y, size)
{
  return {
    x : x,
    y : y,
    size : size,
    graphic : graphic,
    handleMouseDown : function(x, y)
    {
      if (this.x <= x && x <= this.x + this.size &&
        this.y <= y && y <= this.y + this.size)
      {
        onclick();
      }
    },
    paint : function (gamestate, canvas, ctx)
    {
      var x = this.x * canvas.height;
      var y = this.y * canvas.height;
      var size = this.size * canvas.height;
    
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.fillRect(x,y,size,size);

      ctx.drawImage(this.graphic, x + size/4, y + size/4, size/2, size/2);
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.HUD;
    }
  };
};

function createText(text, x, y, height, align)
{
  return {
    text : text,
    x : x,
    y : y,
    height : height,
    align : align,
    paint : function (gamestate, canvas, ctx)
    {
      var height = Math.round(this.height * canvas.height);
      var x = Math.round(this.x * canvas.height);
      var y = Math.round(this.y * canvas.height);
      ctx.font = height + "px " + g_font;
      ctx.textAlign = this.align;
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.text, x, y);
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.HUD;
    }
  };
};

function createIcon(graphic,x,y,size)
{
  return {
    graphic : graphic,
    x : x,
    y : y,
    size : size,
    paint : function (gamestate, canvas, ctx)
    {
      var size = Math.round(this.size * canvas.height);
      var x = Math.round(this.x * canvas.height);
      var y = Math.round(this.y * canvas.height);
      ctx.globalAlpha = .25;
      ctx.drawImage(this.graphic, x, y, size, size);
      ctx.globalAlpha = 1;
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.FG;
    }
  };
};

function createClock(x, y, height, align)
{
  return {
    child_text : createText("0:00",x,y,height,align),
    current_time : 0,
    x : x,
    y : y,
    height : height,
    align : align,
    stopped : false,
    handleTimeStep : function(gamestate)
    {
      if (this.stopped)
      {
        return;
      }
      this.current_time++;
      var current_seconds = Math.floor(this.current_time/25);
      var current_minutes = Math.floor(current_seconds/60);
      current_seconds = current_seconds - current_minutes * 60;
      
      this.child_text.text = current_minutes + ":" + 
        (current_seconds < 10 ? "0" + current_seconds : current_seconds);
    },
    paint : function (gamestate, canvas, ctx)
    {
      this.child_text.paint(gamestate, canvas, ctx);
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.HUD;
    }
  };
}

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
      var gradient = ctx.createLinearGradient(0,0,0,canvas.height);
      gradient.addColorStop(0, "rgb(39,171,255)");
      gradient.addColorStop(1, "rgb(225,6,192)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.BG;
    }
  };
};

//---------------------------------------------------------------------
function createCancelRumble()
{
  return {
    paint : function (gamestate, canvas, ctx)
    {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.AFTER_EFFECT;
    }
  };
};

function createRumble()
{
  return {
    paint : function (gamestate, canvas, ctx)
    {
      var jiggle_x = Math.random() * 1/450 * canvas.height;
      var jiggle_y = Math.random() * 1/450 * canvas.height;
      ctx.setTransform(1, 0, 0, 1, jiggle_x, jiggle_y);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.EFFECT;
    }
  };
}

//---------------------------------------------------------------------
function createFlickerEffect()
{
  return {
    normalFillStyle : "rgba(0,0,0,.30)",
    dimFillStyle : "rgba(0,0,0,.40)",
    scratches : [
      {x_top: 0, x_stray: 0, age : 170, period : 170, active: 100},
      {x_top: 0, x_stray: 0, age : 150, period : 150, active: 190},
    ],
    paint : function (gamestate, canvas, ctx)
    {
      ctx.fillStyle = Math.random() < .15 ? this.dimFillStyle : this.normalFillStyle;
      ctx.shadowOffsetX = canvas.width * 2;
      ctx.shadowColor = "#000000"
      ctx.shadowBlur = Math.round(30);
      for (var specks = 0; specks < 2; specks++)
      {
        ctx.beginPath();
        ctx.arc(Math.round(Math.random()*canvas.width - 2*canvas.width),
          Math.round(Math.random()*canvas.height),
          Math.round(4/450 * canvas.height),0,2*Math.PI);
        ctx.fill();
      }
      ctx.lineWidth = Math.round(1/450 * canvas.height);
      ctx.shadowColor = "rgba(196, 196, 196, .40)";
      ctx.shadowBlur = Math.round(2);
      for(var j = 0; j < this.scratches.length; j++)
      {
        this.scratches[j].age++;
        if(this.scratches[j].age >= this.scratches[j].period)
        {
          this.scratches[j].age = 0;
          this.scratches[j].x_top = Math.random() * canvas.width;
          this.scratches[j].x_stray = Math.random() * canvas.width/8 - canvas.width/16;
        }
        if(this.scratches[j].age < this.scratches[j].active && this.scratches[j].age % 10 != 0)
        {
          ctx.beginPath();
          ctx.moveTo(this.scratches[j].x_top - 2*canvas.width,0);
          ctx.lineTo(this.scratches[j].x_top+this.scratches[j].x_stray - 2*canvas.width ,canvas.height);
          var jitter = 7/450 * canvas.height;
          this.scratches[j].x_top += Math.random() * jitter - jitter/2;
          this.scratches[j].x_stray += Math.random() * jitter - jitter/2;
          ctx.stroke();
        }
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    paintLevel : function ()
    {
      return PAINT_LEVEL.OVERLAY;
    }
  };
};

function createSlideShow()
{
  return {
    slides : [],
    current_slide : 0,
    handleMouseDown : function ()
    {
      ++this.current_slide;
      if (this.current_slide >= this.slides.length)
      {
        this.current_slide = 0;
      }
      if (this.current_slide < this.slides.length)
      {
        this.slides[this.current_slide].reset();
      }
    },
    reset : function ()
    {
      for (slide in this.slides)
      {
        this.slides[slide].reset();
      }
    },
    handleTimeStep : function (gamestate)
    {
      if (this.current_slide < this.slides.length)
      {
        this.slides[this.current_slide].handleTimeStep();
      }
    },
    paint : function(gamestate, canvas, ctx)
    {
      if (this.current_slide < this.slides.length)
      {
        this.slides[this.current_slide].paint(canvas, ctx);
      }
    },
    paintLevel : function()
    {
      return PAINT_LEVEL.FG;
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

