
var app = angular.module('myApp', []);

app.filter('withWords', ['$filter', function ($filter) {
  // unlike the native ng filter, 'withWords' filters elements which contains all words separately
  return function(items, searchText) {
    var keywords = searchText.split(' ');
    for (var i = 0; i < keywords.length; i++) {
      items = $filter('filter')(items, keywords[i]);
    }
    return items;
  };
}])
.filter('rawHtml', ['$sce', function($sce){
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}])

.service('FeatureEnhancer', function () {
  this.process = function (features) {
    function hasKnownBug(feature) {
      if (feature.meta.indexOf('@bug') > -1)
        return true;
      else if (feature.tests) {
        return feature.tests.filter(function (test) {
          return test.meta && test.meta.indexOf('@bug') > -1;
        }).length > 0;
      }
    }
    function wrapInTag(tag, input) {
      var result = '';
      if (!Array.isArray(input)) {
        input = [input];
      }
      input.forEach(function(elt) { result += '<' + tag + '>' + elt + '</' + tag + '>' });
      return result;
    }
    function buildHtmlTable(rows, headers) {
      var htmlTable = '';
      if (headers) {
        htmlTable += wrapInTag('tr', wrapInTag('th', headers));
      }
      rows.forEach(function(row) {
        htmlTable += wrapInTag('tr', wrapInTag('td', row));
      });
      htmlTable = '<table class="table">' + htmlTable + '</table>';
      return htmlTable;
    }
    function toHtmlPreserveFormat(text) {
      return (text || '').replace(/\n/g, '<br>').replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;');
    }
    features.forEach(function enhance(feature) {
      feature.formattedPath = feature.path.replace(/\s*\/\s*/g, ' / ').replace(/_/g, ' ');
      feature.pathValueForUrl = feature.path.replace(/^(\s*\/)/, "").replace(/(\/)/g, ".");
      feature.meta = feature.meta || [];
      if (hasKnownBug(feature))
        feature.status = 'danger';
      else if (feature.meta.indexOf('@ignore') > -1 || feature.meta.indexOf('@unstable') > -1)
        feature.status = 'info';
      else
        feature.status = 'success';
      feature.description = '<p>' + (feature.description || '').replace(/\n/g, "<p>");
      feature.tests.forEach(function enhance(scenario) {
        scenario.meta = scenario.meta || [];
        scenario.isJustInCase = scenario.meta.indexOf('@justInCase') >= 0;
        (scenario.steps || []).forEach(function(step) {
          step.htmlText = step.text
            .replace(/<(.*?)>/g, '<span class="step-value">&lt;$1></span>')
            .replace(/^\s*([\S]*)/i, '<span class="step-first-word">$1</span>');
          if (step.multilignValue) {
            step.htmlMultilignValue = toHtmlPreserveFormat(step.multilignValue);
          }
          if(step.table) { step.htmlTable = buildHtmlTable(step.table) }
        });
        scenario.exampleBlocks = scenario.exampleBlocks || [];
        scenario.exampleBlocks.forEach(function(exampleBlock) {
          exampleBlock.htmlTable = buildHtmlTable(exampleBlock.rows, exampleBlock.headerRow);
        });
      });
    });
  };
})

.controller("FeatureController", ['$scope', '$location', 'FeatureEnhancer', function($scope, $location, FeatureEnhancer) {

  $scope.metaStyle = function(meta) {
    // should return one of { 'default', 'primary', 'success', 'info', 'warning', 'danger' }
    if (meta === '@bug') return 'danger';
    if (meta === '@ignore') return 'primary';
    return 'default';
  }
  $scope.loadFeatures = function(features) {
    if (window.location.search.match(/(^|&|\?)running\b/gi)) {
      features = features.filter(function onlyRunning(feature) {
        return !feature.meta.indexOf('@ignore') > -1 && !feature.meta.indexOf('@unstable') > -1;
      });
    }
    FeatureEnhancer.process(features);
    $scope.features = features;
  };

  $scope.loadFeatureFromUri = function() {
    var parts = $location.path().split('/');
    var featureParam = parts[2];
    if (featureParam) {
      $scope.selectFeature($scope.features.find(function(elt) { return elt.pathValueForUrl == featureParam } ));
    } else {
      $scope.selectFeature(null);
    }
  }

  $scope.selectFeature = function(feature) {
    if ($scope.selectedFeature != feature) {
      $scope.selectedFeature = feature;
      document.dispatchEvent(new Event('main-content-changed'));
    }
  }

  $scope.loadTableOfContents = function() {
    $scope.tableOfContents = { 'children': []};
    $scope.features.forEach(function createNode(feature) {
      var parentNode = $scope.tableOfContents;
      feature.path.replace(/^(\s*\/)/, "").split("/").forEach(function findOrCreateNode(name) {
        var node = null, name = name.replace(/_/g, ' ');
        parentNode.children.forEach(function find(existingNode) {
          if (existingNode.name == name) {
            node = existingNode;
          }
        });
        if (node == null) {
          node = { 'name': name, 'children': []};
          parentNode.children.push(node);
        }
        parentNode = node;
      });
      parentNode.feature = feature; // put the feature on the last node
      feature.tests.forEach(function(test) {
        parentNode.children.push( { 'name': test.name } );
      })
    });
  };

  $scope.searchText = '';
  $scope.date = source.date;
  $scope.project = source.project;
  $scope.selectedFeature = null;

  $scope.loadFeatures(source.features);
  $scope.loadFeatureFromUri();
  $scope.loadTableOfContents();

  $scope.$watch(function() { return $location.path(); }, $scope.loadFeatureFromUri );
}]);
