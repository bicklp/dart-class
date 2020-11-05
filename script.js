var baseFields = {};
var baseDart;

$(document).ready(function () {
  GenerateBaseJson();
  $("#btnGenerateClass").bind("click", function (e) {
    GenerateMainClass();
  });

  $("#btnCopyToClipboard").bind("click", function (e) {
    CopyCodeToClipboard();
  });
});

function CopyCodeToClipboard() {
  var txt = document.getElementById("txtClassOutput");
  txt.select();
  txt.setSelectionRange(0, 99999); /*For mobile devices*/
  document.execCommand("copy");

  $(".alert").show();
}

function HideAlert() {
  $(".alert").hide();
}

function GenerateMainClass() {
  HideAlert();
  var className = "";
  var property = {};

  //Dart Import
  var dart = "import 'dart:convert';\n";
  dart += "import 'based_object.dart';\n\n";

  //read the lines one at a time and loop through
  var lines = $("#txtClassInput").val().split("\n");
  $.each(lines, function (k) {
    //Generate Class Name
    if (lines[k].includes("public class")) {
      var str = lines[k].trim();
      str = str.replace("public class", "class");
      var res = str.split(" ");
      className = res[1];
      console.log(className);
    }

    //Replace c# code with dart syntax
    var code = lines[k].trim();
    code = code.replace(className + " : ", className + " extends ");
    code = code.replace("basedbObject", "BaseDBObject");
    code = code.replace(className + "();", "");
    code = code.replace("public class", "class");
    code = code.replace("string", "String");
    code = code.replace("public ", "");
    code = code.replace(" { get; set; }", ";");
    code = code.replace("decimal", "double");

    //Add all properties to property array
    try {
      var res = code.split(" ");
      var name = res[1];
      if (name != className) {
        name = name.replace(";", "");
        property[name] = res[0];
      }
    } catch (e) {}

    dart += code + "\r\n";
  });

  dart = BuildConstructor(dart, property, className);
  dart = BuildMap(dart, property, className);
  dart = BuildFactory(dart, property, className);
  dart = BuildJsonExport(dart, property, className);

  dart += "\n}";
  $("#txtClassOutput").val(dart);
}

function BuildConstructor(dart, property, className) {
  dart = dart.replace("}", "\n" + className + "({\n");

  $.each(property, function (index, value) {
    dart += "this." + index + ",\n";
  });
  dart += "});\n\n";

  return dart;
}

function BuildMap(dart, property, className) {
  dart += "Map<String, dynamic> toMap() {\n";
  dart += "return {\n";

  $.each(property, function (index, value) {
    dart += "'" + index + "' : " + index + ",\n";
  });

  $.each(baseFields, function (index, value) {
    dart += "'" + index + "' : " + index + ",\n";
  });

  dart += "};\n}\n\n";

  return dart;
}

function BuildFactory(dart, property, className) {
  dart += "factory " + className + ".fromMap(Map<String, dynamic> map) {\n";
  dart += "if (map == null) return null;\n\n";
  dart += "return " + className + "(\n";

  $.each(property, function (index, value) {
    if (value == "double") {
      dart += index + ":double.parse(map['" + index + "'].toString()),\n";
    } else {
      dart += index + ":map['" + index + "'],\n";
    }
  });

  dart += ")";
  
  $.each(baseFields, function (index, value) {
    if (value == "double") {
      dart += ".." + index + "= double.parse(map['" + index + "'].toString())\n";
    } else {
      dart += ".." + index + " = map['" + index + "']\n";
    }
    
  });

  dart += ";\n}\n\n";

  return dart;
}

function BuildJsonExport(dart, property, className) {
  dart += "String toJson() => json.encode(toMap());\n\n";

  dart +=
    "factory " +
    className +
    ".fromJson(String source) => " +
    className +
    ".fromMap(json.decode(source));\n\n";

  return dart;
}

function GenerateBaseJson() {
  fetch("base.txt")
    .then((response) => response.text())
    .then((text) => {
      //read the lines one at a time and loop through
      var lines = text.split("\n");
      $.each(lines, function (k) {
        var code = lines[k].trim();
        code = code.replace("string", "String");
        code = code.replace("decimal", "double");

        //Add all properties to property array
        try {
          var res = code.split(" ");
          var name = res[1];
          name = name.replace(";", "");
          baseFields[name] = res[0];
        } catch (e) {}

        baseDart += code + "\r\n";
      });
    });
  // outputs the content of the text file
}
