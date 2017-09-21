var ResourcesCmd = function(run_context)
{
  this.run_context = run_context;
  this.parent_window = run_context.parent_window;
  this.last_input = null;
  this.parent_window.accept_input = false;
  this.resources = null;
  //reserve space to write stuff
  this.parent_window.handleOutput(" ");
  
  this.handleTimeStep = function()
  {
    var string = this.formatResourcesForReplicant(this.run_context.os);
    this.parent_window.overrideOutput(string);
    return false;
  }
  
  this.formatResourcesForReplicant = function(os)
  {
	  var number_of_running_programs = os.programs.length;
	  // FIXME
	  return "Resources:\n" +
		"-Running Programs:\t" + number_of_running_programs + " / " + os.resources.max_programs + "\n" +
	    "-Storage:\t" + os.resources.storage_space_used + " / " + os.resources.storage_space_total + "\n" +
	    "-Memory:\t" + os.resources.memory_used + " / " + os.resources.memory_total + "\n"  +
	    "-Peripheral Devices:\t" + os.resources.peripheral_devices.length + "\n";
  }
}
