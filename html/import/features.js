
var app = angular.module('myApp', []);

app.filter('withWords', ['$filter', function ($filter) {
  // unlike the native ng filter, 'withWords' filters elements which contains all words separately
  return function(items, searchText) {
    for (var keyword of searchText.split(' ')) {
      items = $filter('filter')(items, keyword);
    }
    return items;
  };
}])
.filter('rawHtml', ['$sce', function($sce){
  return function(val) {
    return $sce.trustAsHtml(val);
  };
}])

.controller("FeatureController", function($scope, $location) {

  $scope.searchText = '';
  $scope.features = source.features;
  $scope.date = source.date;
  $scope.project = source.project;
  $scope.selectedFeature = null;
  $scope.tableOfContents = { 'children': []};

  $scope.metaStyle = function(meta) {
    // should return one of { 'default', 'primary', 'success', 'info', 'warning', 'danger' }
    if (meta === '@bug') return 'danger';
    if (meta === '@ignore') return 'primary';
    return 'default';
  }

  $scope.loadFeatures = function() {
    function hasKnownBug(feature) {
      if (feature.meta.includes('@bug'))
        return true;
      else if (feature.tests) {
        return feature.tests.filter(function (test) {
          return test.meta && test.meta.includes('@bug');
        }).length > 0;
      }
    }
    if (window.location.search.match(/(^|&|\?)running\b/gi)) {
      $scope.features = $scope.features.filter(function onlyRunning(feature) {
        return !feature.meta.includes('@ignore') && !feature.meta.includes('@unstable');
      });
    }
    $scope.features.forEach(function enhance(feature) {
      feature.formattedPath = feature.path.replace(/\s*\/\s*/g, ' / ').replace(/_/g, ' ');
      feature.pathValueForUrl = feature.path.replace(/^(\s*\/)/, "").replace(/(\/)/g, ".");
      if (hasKnownBug(feature))
        feature.status = 'danger';
      else if (feature.meta.includes('@ignore') || feature.meta.includes('@unstable'))
        feature.status = 'info';
      else
        feature.status = 'success';
      feature.description = '<p>' + feature.description.replace(/\n/g, "<p>");
      feature.tests.forEach(function enhance(scenario) {
        scenario.meta = scenario.meta || [];
        scenario.isJustInCase = scenario.meta.indexOf('@justInCase') >= 0;
      });
    });

  };

  $scope.loadFeatureFromUrlPath = function() {
    var parts = $location.path().split('/');
    var featureParam = parts[2];
    if (featureParam) {
      $scope.selectedFeature = $scope.features.find(function(elt) { return elt.pathValueForUrl == featureParam } );
    } else {
      $scope.selectedFeature = null;
    }
  }

  $scope.$watch(function() { return $location.path();}, $scope.loadFeatureFromUrlPath );

  $scope.loadTableOfContents = function() {
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
  $scope.loadFeatures();
  $scope.loadFeatureFromUrlPath();
  $scope.loadTableOfContents();
});
