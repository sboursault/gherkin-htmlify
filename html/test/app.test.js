
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
      createFeatureController();
    });
    it('filters items which contains words separately', function () {
      var items = ['hello john, nice to meet you', 'hey roman, nice to meet you']
      expect($filter('withWords')(items, 'meet roman')).to.eql(['hey roman, nice to meet you']);
    });
    describe('enhances the features with html and styles', function () {
      function newSimpleFeature() {
        return {
          path: '/bank_note',
          name: 'Bank note',
          tests: [{
            name: 'withdraw money with valid pin',
            content: 'step details'}]
        };
      }
      it('feature status', function () {
        scope.loadFeatures([ newSimpleFeature() ]);
        expect(scope.features[0].status).to.eql('success');
      });
      it('html tables from examples', function () {
        var feature = newSimpleFeature();
        feature.tests = [{
            name: 'withdraw money with valid pin',
            content: 'step details',
            exampleBlocks: [{
              "tags": [],
              "headerRow":['amount', 'result'],
              "rows":[
                ['500 €', 'a summary for the transaction'],
                ['1200 €', 'an error']
              ]
            }]}];
        scope.loadFeatures([ feature ]);
        expect(scope.features[0].tests[0].exampleBlocks[0].htmlTable).to.eql(
          '<table class="table table-striped">' +
            '<tr><th>amount</th><th>result</th></tr>' +
            '<tr><td>500 €</td><td>a summary for the transaction</td></tr>' +
            '<tr><td>1200 €</td><td>an error</td></tr>' +
          '</table>');
      });
    });
  });
});

