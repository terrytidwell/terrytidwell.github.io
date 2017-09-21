var ResourcesCmd= function(run_context)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = true;
  this.resources = null;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleInput = function(string)
  {
    this.last_input = string;
  }
  
  this.handleTimeStep = function()
  {
    if (this.last_input === 'q')
    {
      return false;
    }
    
    string = "";
    this.parent_window.overrideOutput(string);
    return true;
  }
}
