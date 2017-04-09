

var app = angular.module('myApp', []);

app.filter('customFilter',[ function () {
  return function(items, searchText) {

  function recursiveSearch(obj, keyword) {
      if (Array.isArray(obj)) {
        for (var item of obj) {
          if (recursiveSearch(item, keyword)) return true;
        }
      } else {
        for (var property in obj) {
          if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                if (recursiveSearch(obj[property], keyword)) return true;
            } else if (typeof obj[property] == "string") {
                if (obj[property].toLowerCase().indexOf(keyword) >= 0) return true;
            }
          }
        }
      }
      return false;
    }

    var filtered = [];
    searchText = searchText.toLowerCase();
    angular.forEach(items, function(item) {
      //console.log(items);
      for (var keyword of searchText.split(' ')) {
        if(!recursiveSearch(item, keyword)) return;
      }
      filtered.push(item);
    });
    return filtered;
  };
}]);

app.controller("FeatureController", function($scope, $location) {

  $scope.searchText = '';
  $scope.features = source.features;
  $scope.date = source.date;
  $scope.project = source.project;
  $scope.selectedFeature = null;

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
      feature.tests.forEach(function enhance(scenario) {
        scenario.meta = scenario.meta || [];
        scenario.isJustInCase = scenario.meta.indexOf('@justInCase') >= 0;
      });
    });

  };
  $scope.loadFeatures();

  $scope.loadFeatureFromUrlPath = function() {
    var parts = $location.path().split('/');
    var featureParam = parts[2];
    if (featureParam) {
      $scope.features.forEach(function(feature) {
        if (feature.pathValueForUrl == featureParam) {
          $scope.selectedFeature = feature;
        }
      });
    } else {
      $scope.selectedFeature = null;
    }
  }

  $scope.$watch(function() { return $location.path();}, $scope.loadFeatureFromUrlPath );

  $scope.tableOfContents = { 'children': []};

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
  $scope.loadTableOfContents();
});
