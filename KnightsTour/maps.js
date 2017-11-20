var Dungeon = {
  rooms : [],
  starting_x : 5,
  starting_y : 5,
  starting_room_x : 0, //0,
  starting_room_y : 0, //0,
  addRoom : function(x,y, string_array, gameEntities) 
  {
    var new_room = this.loadBoard(string_array);
    for(let i = 0; i < gameEntities.length; i++)
    {
      new_room.gameEntities.push(gameEntities[i]);
    }
    
    if(!this.rooms[x])
    {
      this.rooms[x] = [];
    }
    this.rooms[x][y] = new_room;
  },
  
  loadBoard: function(string_array)
  {
    var board = [];
    var gameEntities = [];
    var dim_y = string_array.length;
    var dim_x = 0;
    for(let i = 0; i < dim_y; i++)
    {
      if(i == 0)
      {
        dim_x = string_array[i].length;
      }
      else
      {
        dim_x = Math.max(dim_x, string_array[i].length);
      }
    }
    for(let x = 0; x < dim_x; x++)
    {
      var row = [];
      for(let y = 0; y < dim_y; y++)
      {
        if (x < string_array[y].length && string_array[y][x] != '-')
        {
          var tile = new FloorTile(x,y,true)
          row.push(tile);
          gameEntities.push(tile);
        }
        else
        {
          var tile = new FloorTile(x,y,false)
          row.push(tile);
          gameEntities.push(tile);
        }
      }
      board.push(row);
    }
    return {board: board, gameEntities: gameEntities, visited: false};
  },
  
  loadRoom: function(x, y, gamestate)
  {
    gamestate.board = this.rooms[x][y].board;
    gamestate.gameEntities = this.rooms[x][y].gameEntities;
    if(!this.rooms[x][y].visited)
    {
      gamestate.gameEntities.push(gamestate.player);
      this.rooms[x][y].visited = true;
    }
  },
  
  resetDungeon: function()
  {
    var game_entities = [];
    
    game_entities.push(new RoomEnter(
      function(g)
      {
        GlobalResources.audio_components.m_bg.loop().stop();
        GlobalResources.audio_components.m_bg.setVolume(10);
        GlobalResources.audio_components.m_bg.loop().play();
        g.board[0][5].solid = false;
        g.board[0][5].visible = false;
        g.board[0][6].solid = false;
        g.board[0][6].visible = false;
        g.board[1][5].solid = false;
        g.board[1][5].visible = false;
        g.board[1][6].solid = false;
        g.board[1][6].visible = false;
        
        var current_wave = new EnemyWave();
        g.gameEntities.push(current_wave);
      
        for(var i = 0; i < 2; i++)
        {
          x = Math.floor(Math.random()*8)+2;
          y = Math.floor(Math.random()*8)+2;
          var next_minion = new MinionSpawn(x,y,new Bishop(x,y));
          current_wave.addElement(next_minion);
          current_wave.addOnTimeout(25);
        }
        
        current_wave.addOnIdle(1);
        
        for(var i = 0; i < 4; i++)
        {
          x = Math.floor(Math.random()*8)+2;
          y = Math.floor(Math.random()*8)+2;
          var next_minion = new MinionSpawn(x,y,new Pawn(x,y));
          current_wave.addElement(next_minion);
        }
        
        current_wave.addOnTimeout(250);
        
        {
          x = Math.floor(Math.random()*8)+2;
          y = Math.floor(Math.random()*8)+2;
          var next_minion = new MinionSpawn(x,y,new Bishop(x,y));
          current_wave.addElement(next_minion);
        }
        
        current_wave.addOnTimeout(150);
        
        for(var i = 0; i < 4; i++)
        {
          x = Math.floor(Math.random()*8)+2;
          y = Math.floor(Math.random()*8)+2;
          var next_minion = new MinionSpawn(x,y,new Pawn(x,y));
          current_wave.addElement(next_minion);
        }
        
        current_wave.addOnTimeout(75);
        var dw = new DeathWatch
        (
          function(g)
          {
            g.board[0][5].solid = true;
            g.board[0][5].visible = true;
            g.board[0][6].solid = true;
            g.board[0][6].visible = true;
            g.board[1][5].solid = true;
            g.board[1][5].visible = true;
            g.board[1][6].solid = true;
            g.board[1][6].visible = true;
            GlobalResources.audio_components.m_bg.loop().stop();
          }
        );
        dw.addChild(current_wave);
        g.gameEntities.push(dw);
      }
    ));
    
    var current_wave = new EnemyWave();
    game_entities.push(current_wave);
    
    Dungeon.addRoom(1,2,
      [
        "------------",
        "------------",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "0000000000--",
        "0000000000--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "------------",
        "------------"
      ],
      game_entities
    );   
    
    var game_entities = [];
    game_entities.push(new RoomEnter(
      function(g)
      {
        GlobalResources.audio_components.m_bg.loop().stop();
        GlobalResources.audio_components.m_bg.setVolume(10);
        GlobalResources.audio_components.m_bg.loop().play();
        g.board[0][5].solid = false;
        g.board[0][5].visible = false;
        g.board[0][6].solid = false;
        g.board[0][6].visible = false;
        g.board[1][5].solid = false;
        g.board[1][5].visible = false;
        g.board[1][6].solid = false;
        g.board[1][6].visible = false;
        
        var current_wave = new EnemyWave();
        g.gameEntities.push(current_wave);
      
        var x = Math.floor(Math.random()*8)+2;
        var y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new Bishop(x,y))).addOnTimeout(25).addOnIdle(1);
        
        //pawn rush
        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new Pawn(x,y)))
        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new Pawn(x,y)))
        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new Pawn(x,y)))
        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new Pawn(x,y))).addOnIdle(1)
        
        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new Pawn(x,y))).addOnIdle(1);
        
        for(var i = 0; i < 7; i++)
        {
          x = Math.floor(Math.random()*8)+2;
          y = Math.floor(Math.random()*8)+2;
          current_wave.addOnIdle(2).addElement(new MinionSpawn(x,y,new Pawn(x,y)));
        }

        for(var i = 0; i < 2; i++)
        {
          x = Math.floor(Math.random()*8)+2;
          y = Math.floor(Math.random()*8)+2;
          current_wave.addOnIdle(1).addElement(new MinionSpawn(x,y,new Pawn(x,y)));
        }
        
        /*
        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new SlowBishop(x,y)));

        x = Math.floor(Math.random()*8)+2;
        y = Math.floor(Math.random()*8)+2;
        current_wave.addElement(new MinionSpawn(x,y,new SlowPawn(x,y)));
        */
        
        current_wave.addOnTimeout(75);
        var dw = new DeathWatch
        (
          function(g)
          {
            g.board[0][5].solid = true;
            g.board[0][5].visible = true;
            g.board[0][6].solid = true;
            g.board[0][6].visible = true;
            g.board[1][5].solid = true;
            g.board[1][5].visible = true;
            g.board[1][6].solid = true;
            g.board[1][6].visible = true;
            GlobalResources.audio_components.m_bg.loop().stop();
          }
        );
        dw.addChild(current_wave);
        g.gameEntities.push(dw);
      }
    ));

    Dungeon.addRoom(1,1,
      [
        "------------",
        "------------",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "0000000000--",
        "0000000000--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "------------",
        "------------"
      ],
      game_entities
    );
    
    var game_entities = [];
    Dungeon.addRoom(0,0,
      [
        "------------",
        "------------",
        "------------",
        "------------",
        "----0000----",
        "----00000000",
        "----00000000",
        "----0000----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----"
      ],
      game_entities
    );
    
    var game_entities = [];
    Dungeon.addRoom(0,1,
      [
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "----0000----",
        "----00000000",
        "----00000000",
        "----0000----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----"
      ],
      game_entities
    );
    
    var game_entities = [];
    Dungeon.addRoom(0,2,
      [
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "----0000----",
        "----00000000",
        "----00000000",
        "----0000----",
        "------------",
        "------------",
        "------------",
        "------------"
      ],
      game_entities
    );
  
    var game_entities = [];
    game_entities.push(
      new Button(2,2,200,
        function(g){
          g.board[6][9].solid = true;
          g.board[6][9].visible = true;
        },
        function(g){
          if (this.ttl % 2 == 0)
          {
            g.board[6][9].visible = false;
          }
          else
          {
            g.board[6][9].visible = true;
          }
        },
        function(g){
          g.board[6][9].solid = false;
          g.board[6][9].visible = false;
        }
      )
    );
    Dungeon.addRoom(1,0,
      [
        "-----00-----",
        "-----00-----",
        "--0---0000--",
        "--00--0000--",
        "--00--0000--",
        "0000---00000",
        "00000--00000",
        "--000--000--",
        "--000---00--",
        "--000---00--",
        "------------",
        "------------"
      ],
      game_entities
    );
    
    game_entities = [];
    var button_array = new ButtonArray(function(g){ g.gameEntities.push(new Key(9,9)); });
    button_array.buttons.push(new ButtonArrayButton(5,8));
    button_array.buttons.push(new ButtonArrayButton(6,8));
    button_array.buttons.push(new ButtonArrayButton(4,7));
    button_array.buttons.push(new ButtonArrayButton(7,7));
    button_array.buttons.push(new ButtonArrayButton(5,6));
    button_array.buttons.push(new ButtonArrayButton(6,6));
    button_array.buttons.push(new ButtonArrayButton(5,5));
    button_array.buttons.push(new ButtonArrayButton(6,5));
    button_array.buttons.push(new ButtonArrayButton(4,4));
    button_array.buttons.push(new ButtonArrayButton(7,4));
    button_array.buttons.push(new ButtonArrayButton(5,3));
    button_array.buttons.push(new ButtonArrayButton(6,3));
    
    game_entities.push(button_array);
    for (let b = 0; b < button_array.buttons.length; b++)
    {
      game_entities.push(button_array.buttons[b]);
    }
    Dungeon.addRoom(2,0,
      [
        "------------",
        "------------",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "0000000000--",
        "0000000000--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "------------",
        "------------"
      ],
      game_entities
    );
    
    game_entities = [];
    var lock = new Lock(
      function(g) { 
        g.board[10][5].solid = true;
        g.board[10][5].visible = true;
        g.board[10][6].solid = true;
        g.board[10][6].visible = true;
        g.board[11][5].solid = true;
        g.board[11][5].visible = true;
        g.board[11][6].solid = true;
        g.board[11][6].visible = true;
      }
    );
    lock.locks.push(new LockPaint(9,5));
    lock.locks.push(new LockPaint(9,6));
    for (let l = 0; l < lock.locks.length; l++)
    {
      game_entities.push(lock.locks[l]);
    }
    game_entities.push(lock);
    Dungeon.addRoom(1,-2,
      [
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00000--",
        "-----00000--",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----",
        "-----00-----"
      ],
      game_entities
    );
    
    game_entities = [];
    game_entities.push(new RoomEnter(
      function(g)
      {
        g.board[0][5].solid = false;
        g.board[0][5].visible = false;
        g.board[0][6].solid = false;
        g.board[0][6].visible = false;
        g.board[1][5].solid = false;
        g.board[1][5].visible = false;
        g.board[1][6].solid = false;
        g.board[1][6].visible = false;
        var ff = new FlameFountain(8,3);
        var pawn1 = new MinionSpawn(3,7, new Pawn(3,7));
        var pawn2 = new MinionSpawn(5,9, new Pawn(5,9));
        g.gameEntities.push(ff);
        g.gameEntities.push(pawn1);
        g.gameEntities.push(pawn2);
        var dw = new DeathWatch
        (
          function(g)
          {
            ff.m_active = false;
            g.board[0][5].solid = true;
            g.board[0][5].visible = true;
            g.board[0][6].solid = true;
            g.board[0][6].visible = true;
            g.board[1][5].solid = true;
            g.board[1][5].visible = true;
            g.board[1][6].solid = true;
            g.board[1][6].visible = true;
            g.board[10][5].solid = true;
            g.board[10][5].visible = true;
            g.board[10][6].solid = true;
            g.board[10][6].visible = true;
            g.board[11][5].solid = true;
            g.board[11][5].visible = true;
            g.board[11][6].solid = true;
            g.board[11][6].visible = true;
          }
        );
        dw.addChild(pawn1.minion);
        dw.addChild(pawn2.minion);
        g.gameEntities.push(dw);
      }
    ));
    Dungeon.addRoom(2,-2,
      [
        "------------",
        "------------",
        "--00000000--",
        "--000000-0--",
        "--00000000--",
        "0000000000--",
        "0000000000--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "------------",
        "------------"
      ],
      game_entities
    );
    
    game_entities = [];
    Dungeon.addRoom(3,-2,
      [
        "------------",
        "------------",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "0000000000--",
        "0000000000--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "------------",
        "------------"
      ],
      game_entities
    );

    game_entities = [];
    var death_watch = new DeathWatch(function(g){ g.gameEntities.push(new Key(9,9)); });
    game_entities.push(
      death_watch
    );
    death_watch.addChild(new Pawn(8,6));
    death_watch.addChild(new Pawn(3,8));
    
    game_entities.push(
      death_watch.children[0]
    );
    game_entities.push(
      death_watch.children[1]
    );
    Dungeon.addRoom(1,-3,
      [
        "------------",
        "------------",
        "--00000000--",
        "--00000000--",
        "--0--00--0--",
        "--0--00--0--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "--00000000--",
        "-----00-----",
        "-----00-----"
      ],
      game_entities
    );
    
    game_entities = [];
    var timer = new TimerLoop(25);
    timer.addState(50,
      function(g){
          g.board[5][7].solid = true;
          g.board[5][7].visible = true;
          g.board[6][7].solid = true;
          g.board[6][7].visible = true;
      },
      function(g){
        if (timer.ttl % 2 == 0)
        {
          g.board[5][7].visible = false;
          g.board[6][7].visible = false;
        }
        else
        {
          g.board[5][7].visible = true;
          g.board[6][7].visible = true;
        }
      },
      function(g){
          g.board[5][7].solid = false;
          g.board[5][7].visible = false;
          g.board[6][7].solid = false;
          g.board[6][7].visible = false;
      }
    );
    timer.addState(100,
      null,
      null,
      null
    );
    game_entities.push(timer);
    
    var timer = new TimerLoop(50);
    timer.addState(50,
      function(g){
          g.board[3][6].solid = true;
          g.board[3][6].visible = true;
          g.board[8][6].solid = true;
          g.board[8][6].visible = true;
      },
      function(g){
        if (timer.ttl % 2 == 0)
        {
          g.board[3][6].visible = false;
          g.board[8][6].visible = false;
        }
        else
        {
          g.board[3][6].visible = true;
          g.board[8][6].visible = true;
        }
      },
      function(g){
          g.board[3][6].solid = false;
          g.board[3][6].visible = false;
          g.board[8][6].solid = false;
          g.board[8][6].visible = false;
      }
    );
    timer.addState(100,
      null,
      null,
      null
    );
    game_entities.push(timer);
    
    var timer = new TimerLoop(75);
    timer.addState(50,
      function(g){
          g.board[2][4].solid = true;
          g.board[2][4].visible = true;
          g.board[9][4].solid = true;
          g.board[9][4].visible = true;
      },
      function(g){
        if (timer.ttl % 2 == 0)
        {
          g.board[2][4].visible = false;
          g.board[9][4].visible = false;
        }
        else
        {
          g.board[2][4].visible = true;
          g.board[9][4].visible = true;
        }
      },
      function(g){
          g.board[2][4].solid = false;
          g.board[2][4].visible = false;
          g.board[9][4].solid = false;
          g.board[9][4].visible = false;
      }
    );
    timer.addState(100,
      null,
      null,
      null
    );
    game_entities.push(timer);
    
    var timer = new TimerLoop(100);
    timer.addState(50,
      function(g){
          g.board[4][5].solid = true;
          g.board[4][5].visible = true;
          g.board[7][5].solid = true;
          g.board[7][5].visible = true;
      },
      function(g){
        if (timer.ttl % 2 == 0)
        {
          g.board[4][5].visible = false;
          g.board[7][5].visible = false;
        }
        else
        {
          g.board[4][5].visible = true;
          g.board[7][5].visible = true;
        }
      },
      function(g){
          g.board[4][5].solid = false;
          g.board[4][5].visible = false;
          g.board[7][5].solid = false;
          g.board[7][5].visible = false;
      }
    );
    timer.addState(100,
      null,
      null,
      null
    );
    game_entities.push(timer);
    
    var timer = new TimerLoop(125);
    timer.addState(50,
      function(g){
          g.board[5][4].solid = true;
          g.board[5][4].visible = true;
          g.board[6][4].solid = true;
          g.board[6][4].visible = true;
      },
      function(g){
        if (timer.ttl % 2 == 0)
        {
          g.board[5][4].visible = false;
          g.board[6][4].visible = false;
        }
        else
        {
          g.board[5][4].visible = true;
          g.board[6][4].visible = true;
        }
      },
      function(g){
          g.board[5][4].solid = false;
          g.board[5][4].visible = false;
          g.board[6][4].solid = false;
          g.board[6][4].visible = false;
      }
    );
    timer.addState(100,
      null,
      null,
      null
    );
    game_entities.push(timer);
    
    var timer = new TimerLoop(150);
    timer.addState(50,
      function(g){
          g.board[4][6].solid = true;
          g.board[4][6].visible = true;
          g.board[7][6].solid = true;
          g.board[7][6].visible = true;
      },
      function(g){
        if (timer.ttl % 2 == 0)
        {
          g.board[4][6].visible = false;
          g.board[7][6].visible = false;
        }
        else
        {
          g.board[4][6].visible = true;
          g.board[7][6].visible = true;
        }
      },
      function(g){
          g.board[4][6].solid = false;
          g.board[4][6].visible = false;
          g.board[7][6].solid = false;
          g.board[7][6].visible = false;
      }
    );
    timer.addState(100,
      null,
      null,
      null
    );
    game_entities.push(timer);
    Dungeon.addRoom(1,-1,
      [
        "-----00-----",
        "-----00-----",
        "----0--0----",
        "------------",
        "------------",
        "------------",
        "------------",
        "------------",
        "------------",
        "----0--0----",
        "-----00-----",
        "-----00-----"
      ],
      game_entities
    );
  }
};
