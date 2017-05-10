
var fs = require("fs");
var file = require("file");
var ncp = require('ncp').ncp;
var featureParser = require('./featureParser.js');


var getFormattedDate = function() {
  var date = new Date();
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
};

var gherkinHtmlify = {
  process: function(featureDirectoryPath, outputDir, options) {
    if (fs.existsSync(outputDir)) {
      throw outputDir + ' already exists. Please remove it manually.';
    }
    fs.mkdirSync(outputDir);
    ncp(__dirname + '/html', outputDir);

    console.log('Processing feature files...');
    var features = [];

    file.walkSync(featureDirectoryPath,
      function callback(directory, dirs, files) {
        files.forEach(function(file) {
          var filePath = directory + '/' + file;
          var fileContent = fs.readFileSync(filePath, 'utf8');
          console.log(filePath);
          var functionalPath = filePath.replace(featureDirectoryPath, '').replace('.feature', '')
          features.push(featureParser.parseContent(functionalPath, fileContent));
        });
      });

      var features = JSON.stringify(features, null, "\t");

      var output = "var source = {};\n"
      output += "source.project = '" + options.mainTitle + "';\n";
      output += "source.features = " + features + ";\n";
      output += "source.date = '" + getFormattedDate() + "';\n";

      fs.writeFileSync(outputDir +'/data.js', output, {encoding: 'utf8'});

      console.log('Process finished.');
  }

};

module.exports = gherkinHtmlify;
