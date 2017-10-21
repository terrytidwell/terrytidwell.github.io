var createJutInstance = function (new_div, testing_instance_function)
{
  var testing_instance = {};
  
  var testing_function = testing_instance_function;
  var total_tests = 0;
  var total_failing_tests = 0;
  var failing_tests = '';

  //create testing info div
  var testing_info_div = document.createElement("div");
  testing_info_div.style.margin = "2px 2px";
  
  var test_button_onclick = function()
  {
    var total_passing_tests = 0;
    testing_info_div.innerHTML = "";
    total_tests = 0;
    total_failing_tests = 0;
    failing_tests = '';
    testing_function(testing_instance);
    total_passing_tests = total_tests - total_failing_tests;
    testing_info_div.innerHTML += "<br>" + total_passing_tests + 
      "/" + total_tests + " tests passed<br>";
    if(total_failing_tests > 0)
    {
      testing_info_div.innerHTML += "<br>" + total_failing_tests 
        + " failed tests:<br>";
      testing_info_div.innerHTML += failing_tests;
    }
  };
  
  var expect_throw = function (func)
  {
    try {
      func.call();
      return false;
    }
    catch (e) {
      testing_info_div.innerHTML += "Test caught: " + e.message + "<br>";
      return true;
    }
  };

  var expect_near = function (value, expected_value, tolerance)
  {
    return expected_value - tolerance <= value && expected_value + tolerance >= value;
  };

  var display = function (text)
  {
    testing_info_div.innerHTML += text;
  };

  var test = function (name, test_value)
  {
    var result = '<font color="#00C000">PASSED</font>';
    total_tests++;
    if (!test_value)
    {
      result = '<font color="#C00000">FAILED</font>';
      failing_tests += name + "<br>";
      total_failing_tests++;
    }
    testing_info_div.innerHTML += name + " [" + result + "]<br>";
  };
  
  // button set up
  var testing_button = document.createElement("button");
  testing_button.onclick = test_button_onclick;
  testing_button.style.backgroundColor = "SteelBlue";
  testing_button.style.border = "none";
  testing_button.style.color = "white";
  testing_button.style.padding = "9px 15px";
  testing_button.style.textAlign = "center";
  testing_button.style.textDecoration = "none";
  testing_button.style.display = "inline-block";
  testing_button.style.fontSize = "16px";
  testing_button.style.margin = "2px 2px";
  testing_button.style.cursor = "pointer";
  // end button set up
  testing_button.appendChild(document.createTextNode("Run tests"));
  new_div.appendChild(testing_info_div);
  new_div.appendChild(testing_button);
  
  testing_instance.test = test;
  testing_instance.display = display;
  testing_instance.expect_near = expect_near;
  testing_instance.expect_throw = expect_throw;
  return testing_instance;
};