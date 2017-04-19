var gherkinHtmlify = require('./gherkin-htmlify');
var featureDirectoryPath = '../tdd-trainings/Atm/src/specs';
var outputDirectory = './atm-doc';
var options = {
   mainTitle: "atm executable specification"
};                                                                     
gherkinHtmlify.process(featureDirectoryPath, outputDirectory, options);
