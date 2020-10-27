$(document).ready(function () {
  $("#btnGenerateClass").bind("click", function (e) {
       GenerateMainClass();
  });
});

function GenerateMainClass() {
  var dart = "import 'dart:convert';\n\n";

  var className = "";
  var property = {};

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

    var code = lines[k].trim();
     code = code.replace(className + " : ", className + " extends ");
    code = code.replace(className + "();", "");
    code = code.replace("public class", "class");
    code = code.replace("string", "String");
    code = code.replace("public ", "");
    code = code.replace(" { get; set; }", ";");
    code = code.replace("decimal", "double");
    var res = code.split(" ");
    var name = res[1];
    try {
      if (name != className) {
        name = name.replace(";", "");
        property[name] = name;
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
    console.log(value);
    dart += "this." + value + ",\n";
  });
  dart += "});\n\n";

  return dart;
}

function BuildMap(dart, property, className) {
  dart += "Map<String, dynamic> toMap() {\n";
  dart += "return {\n";

  $.each(property, function (index, value) {
    console.log(value);
    dart += "'" + value + "' : " + value + ",\n";
  });

  dart += "};\n}\n\n";

  return dart;
}

function BuildFactory(dart, property, className) {
  dart += "factory " + className + ".fromMap(Map<String, dynamic> map) {\n";
  dart += "if (map == null) return null;\n\n";
  dart += "return " + className + "(\n";

  $.each(property, function (index, value) {
    dart += value + ":map['" + value + "'],\n";
  });

  dart += ");\n}\n\n";

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

// Map<String, dynamic> toMap() {
//     return {
//       'key_id': key_id,
//       'database_object_number': database_object_number,
//     };
//   }

// ForeignKey({
//     this.key_id,
//     this.database_object_number,
//   });
