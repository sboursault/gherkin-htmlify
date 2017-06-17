
var gherkinHtmlify = require('../index.js');
var featureDirectoryPath = './features';
var outputDirectory = './out';
var options = {
  mainTitle: "Cashier executable documentation"
};
gherkinHtmlify.process(featureDirectoryPath, outputDirectory, options);
