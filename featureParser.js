
var captureGroup = function(text, regexp, group) {
  if (group == undefined)
    group = 1;
  var array = text.match(regexp);
  return array && array.length > group ? array[group].trim() : null;
},
capture = function(text, regexp) {
  return captureGroup(text, regexp, 0);
},
splitWords = function(text) {
  return text ? text.replace(/\s+/g, ' ').trim().split(' ') : [];
},
textRowToArray = function(text) {
  text = (text || '').trim();
  if (!text.startsWith('|') || !text.endsWith('|'))
    throw "can't parse text row " + text;
  var array = text.substr(1 , text.length - 2).split('|');
  var trimmedArray = []
  array.forEach(function(elt) {trimmedArray.push(elt.trim())});
  return trimmedArray;
},
zeroOrMoreAnnotationLine = '(?: *@.*\\n)*',
scenarioHeader = zeroOrMoreAnnotationLine + ' *Scenario\\b.*:.*',
anyNumberOfChararcters = '[\\s\\S]*',
anyNumberOfChararctersButAsFewAsPossible = '[\\s\\S]+?',
followedByAScenarioOrEndOfFile = '(?=(?:' + scenarioHeader + ')|$)',
allScenaroBlocksRegex = new RegExp( scenarioHeader + anyNumberOfChararctersButAsFewAsPossible + followedByAScenarioOrEndOfFile, 'gi'),
exampleHeader = '\\s*examples\\s*:.*\\n',
exampleHeaderWithTags = zeroOrMoreAnnotationLine + exampleHeader,
tableRow = '\\s*\\|[^\\n]*\\|\\s*\\n',
followedByAnExampleBlocOrEndOfText = '(?=(?:' + exampleHeaderWithTags + ')|$)',
allExampleBlocksRegex = new RegExp( exampleHeaderWithTags + anyNumberOfChararctersButAsFewAsPossible + followedByAnExampleBlocOrEndOfText, 'gi');

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
    while((match = allScenaroBlocksRegex.exec(content)) !== null) {
      feature.tests.push(this.parseScenario(match[0]));
    }
    return feature;
  },
  parseScenario: function(text) {
    var scenario = {};
    scenario.exampleBlocks = [];
    if (text.match(/scenario\s*outline\s*:/i)) {
      while((match = allExampleBlocksRegex.exec(text)) !== null) {
        scenario.exampleBlocks.push(this.parseExampleBlock(match[0]));
      }
      var firstExampleHeader = capture(text, new RegExp(exampleHeaderWithTags, 'i'))
      text = text.substr(0, text.indexOf(firstExampleHeader));
    }
    scenario.name = captureGroup(text, /scenario.*:\s*(.*)/i);
    this.log('  > ' + scenario.name);
    scenario.meta = splitWords(captureGroup(text, /([\s\S]*)scenario\s*:/i));
    scenario.content = captureGroup(text, /scenario.*:.*\s*\n([\s\S]*)/i);
    return scenario;
  },
  parseExampleBlock: function(text) {
    var exampleBlock = {};
    exampleBlock.tags = splitWords(captureGroup(text, new RegExp('(' + anyNumberOfChararcters + ')' + exampleHeader, 'i')));
    exampleBlock.headerRow = textRowToArray(captureGroup(text, new RegExp(exampleHeaderWithTags + '(' + tableRow + ')', 'i')));
    var tableRowsText = captureGroup(text, new RegExp(exampleHeaderWithTags + tableRow + '((?:' + tableRow + ')*)', 'i'));
    exampleBlock.rows = [];
    tableRowsText.split('\n').forEach(function(elt) { elt = elt.trim(); if (elt) { exampleBlock.rows.push(textRowToArray(elt)) }});
    return exampleBlock;
  },
  log: function(text) {
    if (this.logEnabled) { console.log(text); }
  }
};
