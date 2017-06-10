
const featureParser = require('./featureParser.js');
featureParser.logEnabled = false;

const expect = require('chai').expect;

const featureText = "\n"
 + "@slow\n"
 + "Feature: Bank note\n"
 + "Let's see how bank notes behave :)\n"
 + "Scenario: dispense bank note\n"
 + "	#some notes\n"
 + "	Given Atm has banknotes:\n"
 + "		| value | count |\n"
 + "		| $100  |     1 |\n"
 + "\n"
 + "	When $100 is to be dispensed\n"
 + "  # some coments\n"
 + "	Then a $100 banknote is dispensed\n"
 + "\n"
 + "@ignore\n"
 + "Scenario: withdraws money with valid pin\n"
 + "   A few details to provide context\n"
 + "   Given a card with pin '1234'\n"
 + "   When a user enters pin '1234'\n"
 + "   Then he gets the message:\n"
 + "\n"
 + "\"\"\"\n"
 + "   Pin was ok...\n"
 + "     ... how much do you want to withdrow ?\n"
 + "\"\"\"\n"
 + "   And he can withdraw\n"
 + "\n"
 + "Scenario outline: can't withdraw above 1000€\n"
 + "   When a user wants to withdraw <amount>\n"
 + "   Then he gets a message with <result>\n"
 + "\n"
 + "\n"
 + "   Examples:\n"
 + "      | amount    | result                        |\n"
 + "      | 500 €     | a summary for the transaction |\n"
 + "      | 1200 €    | an error                      |\n"
 + "\n"
 + "   @justInCase\n"
 + "   Examples:\n"
 + "      | amount    | result                        |\n"
 + "      | 999,99 €  | a summary for the transaction |\n"
 + "      | 1000,01 € | an error                      |\n";

describe('featureParser', function() {
  var feature = featureParser.parseContent('Bank note', featureText);
  it('extracts feature name', function() {
    expect( feature.name ).to.eql( 'Bank note' );
  });
  it('extracts feature meta', function() {
    expect( feature.meta ).to.eql( ['@slow'] );
  });
  it('extracts feature description', function() {
    expect( feature.description ).to.eql('Let\'s see how bank notes behave :)');
  });
  it('extracts scenario', function() {
    expect( feature.tests ).to.have.lengthOf(3);
  });
  it('extracts scenario name', function() {
    expect( feature.tests[0].name ).to.eql('dispense bank note');
    expect( feature.tests[1].name ).to.eql('withdraws money with valid pin');
  });
  it('extracts scenario meta', function() {
    expect( feature.tests[0].meta ).to.eql([]);
    expect( feature.tests[1].meta ).to.eql(['@ignore']);
  });
  it('extracts senario documentation', function() {
    expect( feature.tests[0].documentation ).to.eql( '' );
    expect( feature.tests[1].documentation ).to.eql( 'A few details to provide context' );
  });
  it('extracts scenario steps', function() {
    expect( feature.tests[0].steps ).to.eql([
      {text: 'Given Atm has banknotes:', table: [['value', 'count'],['$100', '1']] },
      {text: 'When $100 is to be dispensed', table: [], leaveBlankLine: true },
      {text: 'Then a $100 banknote is dispensed', table: [] }
    ]);
  });
  describe('multilign values', function() {
    it('extracts multilign values', function() {
      expect( feature.tests[1].steps[2] ).to.eql({
        text: 'Then he gets the message:',
        table: [],
        multilignValue: "   Pin was ok...\n     ... how much do you want to withdrow ?"
      });
    });
    it('preserves the step after a multilign value', function() {
      expect( feature.tests[1].steps[3] ).to.eql({text: 'And he can withdraw', table: []});
    });
  });
  it('extracts scenario examples', function() {
    expect( feature.tests[2].exampleBlocks ).to.eql([{
        tags: [],
        headerRow:['amount', 'result'],
        rows:[
          ['500 €', 'a summary for the transaction'],
          ['1200 €', 'an error']
        ]
      }, {
        tags: ['@justInCase'],
        headerRow:['amount', 'result'],
        rows:[
          ['999,99 €', 'a summary for the transaction'],
          ['1000,01 €', 'an error']
        ]
      }]);
  });
});
