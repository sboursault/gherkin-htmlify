
var gherkinHtmlify = require('.');
var featureDirectoryPath = './test/features';
var outputDirectory = './test/out';
var options = {
  mainTitle: "Cashier executable documentation"
};
gherkinHtmlify.process(featureDirectoryPath, outputDirectory, options);
