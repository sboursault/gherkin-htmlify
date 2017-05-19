
var expect = chai.expect;
describe('myApp', function () {
  describe('#withWordsFilter', function () {
    var scope, $filter, $location, createFeatureController;
    beforeEach(function() {
      module('myApp');
      inject(function ($rootScope, $controller, _$location_, _$filter_) {
        $filter = _$filter_;
        $location = _$location_;
        scope = $rootScope.$new();
        createFeatureController = function() {
            return $controller('FeatureController',
              {'$scope': scope, '$location': $location});
        };
      });
    });
    it('filters items which contains words separately', function () {
      var items = ['hello john, nice to meet you', 'hey roman, nice to meet you']
      expect($filter('withWords')(items, 'meet roman')).to.eql(['hey roman, nice to meet you']);
    });
    it('enhances the features with html and styles', function () {
      var featureController = createFeatureController();
      scope.loadFeatures([{
        path: '/bank_note',
        name: 'Bank note',
        tests: [{
          name: 'withdraw money with valid pin',
          content: 'step details'}]
        }]);
      expect(scope.features[0].status).to.eql('success');
    });
  });
});

