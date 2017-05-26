var jut = {

  testing_function : null,
  testing_info_div : null,
  total_tests : 0,
  total_failing_tests : 0,
  failing_tests : '',

  test_instance: function (div, testing_function)
  {
    jut.testing_function = testing_function;
    jut.testing_info_div = document.createElement("div");
    jut.testing_info_div.style.margin = "2px 2px";
    // button set up
    var testing_button = document.createElement("button");
    testing_button.onclick = jut.test_button_onclick;
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
    div.appendChild(jut.testing_info_div);
    div.appendChild(testing_button);
  },

  expect_throw: function (func)
  {
    try {
      func.call();
      return false;
    }
    catch (e) {
      jut.testing_info_div.innerHTML += "Test caught: " + e.message + "<br>";
      return true;
    }
  },

  expect_near: function (value, expected_value, tolerance)
  {
    return expected_value - tolerance <= value && expected_value + tolerance >= value;
  },

  display: function (text)
  {
    jut.testing_info_div.innerHTML += text;
  },

  test: function (name, test_value)
  {
    var result = '<font color="#00C000">PASSED</font>';
    jut.total_tests++;
    if (!test_value)
    {
      result = '<font color="#C00000">FAILED</font>';
      jut.failing_tests += name + "<br>";
      jut.total_failing_tests++;
    }
    jut.testing_info_div.innerHTML += name + " [" + result + "]<br>";
  },
  
  test_button_onclick: function ()
  {
    var total_passing_tests = 0;
    jut.testing_info_div.innerHTML = "";
    jut.total_tests = 0;
    jut.total_failing_tests = 0;
    jut.failing_tests = '';
    jut.testing_function.call();
    total_passing_tests = jut.total_tests - jut.total_failing_tests;
    jut.testing_info_div.innerHTML += "<br>" + total_passing_tests + 
      "/" + jut.total_tests + " tests passed<br>";
    if(jut.total_failing_tests > 0)
    {
      jut.testing_info_div.innerHTML += "<br>" + jut.total_failing_tests 
        + " failed tests:<br>";
      jut.testing_info_div.innerHTML += jut.failing_tests;
    }
  }
}