import { evaluate } from '../src/shunting-yard';
import 'should';

describe('context & ref objects', () => {
  it('can find nested @context value', () => {
    evaluate({sheet: {factions: { fac: 'abc'}}}, null, '@sheet.factions.fac').should.equal('abc');
  });

  it('can find nested $ref value', () => {
    evaluate(null, {obj: {factions: { fac: 'abc'}}}, '$obj.factions.fac').should.equal('abc');
  });

  it('can operate on @context and @ref', () => {
    evaluate({a: 2}, {b: 3}, '@a + $b').should.equal(5);
  });
});

describe('intersection & difference', () => {
  it('finds an intersection', () => {
    evaluate(
      {sheet: {factions: ['good']}},
      {factions: ['good', 'bad', 'ugly']},
      '@sheet.factions |+ $factions'
    ).should.equal(true);
  });

  it('does not find an intersection', () => {
    evaluate(
      {sheet: {factions: ['god']}},
      {factions: ['good', 'bad', 'ugly']},
      '@sheet.factions |+ $factions'
    ).should.equal(false);
  });

  it('finds a difference', () => {
    evaluate({factions: ['good']}, {faction: ['good']}, '@factions |- $factions')
      .should.equal(true);
  });

  it('does not find a difference', () => {
    evaluate({factions: ['good']}, {faction: ['god']}, '@factions |- $factions')
      .should.equal(true);
  });
});
