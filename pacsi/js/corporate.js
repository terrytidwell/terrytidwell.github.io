var PartStat = function(name, units, current_value, start_value, descriptive_states, decay_rate)
{
	this.name = name;
	this.units = units;
	this.start_value = start_value;
	this.descriptive_states = descriptive_states;
	this.decay_rate = decay_rate;
	this.current_value = current_value;
	
	this.update = function(steps_passed, decay_rate_modifier) 
	{
		this.current_value -= this.decay_rate * decay_rate_modifier * steps_passed;
		if (this.current_value < 0)
		{
			this.current_value = 0;
		}
	};
	this.render = function() 
	{
		if (this.descriptive_states)
		{
			for (state in this.descriptive_states)
			{
				if (this.current_value < state.max && this.current_value >= state.min)
				{
					return this.name + ": " + state.value;
				}
			}
		}
		var string = this.current_value;
		if (this.units)
		{
			string += " " + this.units;
		}
		return string;
	};
};

var Part = function(name, description, stats, steps_to_next_checkup)
{
	this.name = name;
	this.description = description;
	this.stats = stats;
	this.steps_to_next_checkup = steps_to_next_checkup;
	
	this.update = function(steps_passed, decay_rate_modifier)
	{
		for (stat in this.stats)
		{
			stat.update(steps_passed, decay_rate_modifier);
		}
	};
	
	this.render = function()
	{
		return "";
	};
};

var PartInspectionJobQueue = function()
{
	
};

var PartStock = function()
{
	
};

// Print what is on the queue and exit
var ViewPartInspectionJobQueueCmd = function(run_context)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = true;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleInput = function(string)
  {
    this.last_input = string;
  }
  
  this.handleTimeStep = function()
  {
    string = "";
    this.parent_window.overrideOutput(string);
    return true;
  }
};

// Print what is in stock and exit
var ViewPartStockCmd = function(run_context)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = true;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleInput = function(string)
  {
    this.last_input = string;
  }
  
  this.handleTimeStep = function()
  {
    return false;
  }
};

// print the status of the part with <name> and exit
var ViewPartStatusCmd = function(run_context, args)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = true;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleInput = function(string)
  {
    this.last_input = string;
  }
  
  this.handleTimeStep = function()
  {
    return false;
  }
}; 

// replace the part with <name>, delay part in job queue and exit
var ReplacePartCmd = function(run_context, args)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = true;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleInput = function(string)
  {
    this.last_input = string;
  }
  
  this.handleTimeStep = function()
  {
    return false;
  }
}; 

// defer replacing the part with <name>, delay part in job queue and exit
var DeferPartCmd = function(run_context, args)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = true;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleInput = function(string)
  {
    this.last_input = string;
  }
  
  this.handleTimeStep = function()
  {
    return false;
  }
}; 