
var captureGroup = function(text, regexp, group) {
  var group = group || 1, // extract 1st group by default
    array = text.match(regexp);
  return array && array.length > group ? array[group].trim() : null;
};
var splitWords = function(text) {
  return text ? text.replace(/\s+/g, ' ').trim().split(' ') : [];
};

var zeroOrMoreAnnotationLine = '(?: *@.*\\n)*';
var scenarioHeader = zeroOrMoreAnnotationLine + ' *Scenario\\b.*:.*';
var anyNumberOfChararctersButAsFewAsPossible = '[\\s\\S]+?';
var followedByAScenarioOrEndOfFile = '(?=(?:' + scenarioHeader + ')|$)';

module.exports = {
  logEnabled: true,
  parseContent: function(path, content) {
    this.log(path);
    var regExp, match;
    var feature = {};
    feature.path = path;
    feature.name = '';
    feature.description = '';
    feature.meta = []
    feature.tests = [];
    feature.meta = splitWords(captureGroup(content, /([\s\S]*)feature\s*:/i));
    feature.name = captureGroup(content, /feature\s*:\s*(.*)\s*\n/i);
    feature.description = captureGroup(content, new RegExp( 'feature\\s*:.*\\n' + '(' + anyNumberOfChararctersButAsFewAsPossible + ')' + followedByAScenarioOrEndOfFile, 'i'));

    regExp = new RegExp( scenarioHeader + anyNumberOfChararctersButAsFewAsPossible + followedByAScenarioOrEndOfFile, 'gi');
    while((match = regExp.exec(content)) !== null) {
      feature.tests.push(this.parseScenario(match[0]));
    }
    return feature;
  },
  parseScenario: function(text) {
    var test = {};
    test.name = captureGroup(text, /scenario.*:\s*(.*)/i);
    this.log('  > ' + test.name);
    test.meta = splitWords(captureGroup(text, /([\s\S]*)scenario\s*:/i));
    test.content = captureGroup(text, /scenario.*:.*\s*\n([\s\S]*)/i);
    return test;
  },
  log: function(text) {
    if (this.logEnabled) { console.log(text); }
  }
};
