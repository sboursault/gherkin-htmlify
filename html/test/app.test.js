
var expect = chai.expect;
describe('myApp', function () {
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
  describe('#withWordsFilter', function () {
    it('filters items which contains words separately', function () {
      var items = ['hello john, nice to meet you', 'hey roman, nice to meet you']
      expect($filter('withWords')(items, 'meet roman'))
        .to.eql(['hey roman, nice to meet you']);
    });
  });
  describe('#FeatureController', function () {
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
      it('sets the feature status', function () {
        scope.loadFeatures([ newSimpleFeature() ]);
        expect(scope.features[0].status).to.eql('success');
      });
      it('strongifies each step\'s first word in an html text', function () {
        var feature = newSimpleFeature();
        feature.tests = [{
          name: 'test 1',
          steps: [
            {text: 'Given my apple was poisened'},
            {text: 'When I taste it'},
            {text: 'Then I need to sleep for a while'}]}];
        scope.loadFeatures([ feature ]);
        expect(scope.features[0].tests[0].steps[0].htmlText)
          .to.eql('<span class="step-first-word">Given</span> my apple was poisened');
      });
      it('wraps template key words', function () {
        var feature = newSimpleFeature();
        feature.tests = [{
          name: 'test 1',
          steps: [
            {text: '* Hey Darth, you know what ?'},
            {text: '* WHAT ?'},
            {text: '* Oh <Nothing>...'}]}];
        scope.loadFeatures([ feature ]);
        expect(scope.features[0].tests[0].steps[2].htmlText)
          .to.match(/Oh <span class="step-value">&lt;Nothing><\/span>\.\.\.$/);
      });
      it('generates html from multilign value', function(){
        var feature = newSimpleFeature();
        feature.tests = [{
          name: 'test 1',
          steps: [{
            text: 'Given the product:',
            multilignValue: '{\n\t"_id": "1234567",\n\t"name":"pen"\n}'}]}];
        scope.loadFeatures([ feature ]);
        expect(scope.features[0].tests[0].steps[0].htmlMultilignValue)
          .to.eql('{<br>&nbsp;&nbsp;"_id":&nbsp;"1234567",<br>&nbsp;&nbsp;"name":"pen"<br>}');
      });
      it('builds an html table from examples', function () {
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
        expect(scope.features[0].tests[0].exampleBlocks[0].htmlTable)
          .to.eql(
            '<table class="table">' +
              '<tr><th>amount</th><th>result</th></tr>' +
              '<tr><td>500 €</td><td>a summary for the transaction</td></tr>' +
              '<tr><td>1200 €</td><td>an error</td></tr>' +
            '</table>');
      });
    });
  });
});

