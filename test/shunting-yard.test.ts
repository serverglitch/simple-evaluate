import { evaluate } from "../src/shunting-yard";
import 'should';

describe("simple evaluate", () => {
  it('basic expression', () => {
    const ret = evaluate(null, null, '1 * (2 + 3 * (4 - 3))');
    ret.should.equal(5);
    const ret1 = evaluate(null, null,
      '1 * (2 + 3 * (4 - 3)) > 10 - 2 || 3 * 2 > 9 - 2 * 3');
    ret1.should.equal(true);
    evaluate(null, null, '(9 - 2) * 3 - 10').should.equal(11);

    [
      '9 / 12 + 12 * 3 - 5',
      '9 / 12 + 12 * (3 - 5)',
      '12 > 13.1',
      '12 < 14',
      '12 <= 14',
      '12 >= 14',
      '12 == 14',
      '12 % 5 > 3',
      '12 != 14',
      '9 - 1 > 10 && 3 * 5 > 10',
      '9 - 1 > 10 || 3 * 5 > 10',
    ].map(expression => {
      // tslint:disable-next-line:no-eval
      evaluate(null, null, expression).should.equal(eval(expression));
    });
  });

  it('read var from context', () => {
    evaluate({ a: 10 }, null, '(9 - 2) * 3 - @a').should.equal(11);
    evaluate({ a: 10, b: 2 }, null, '(9 - @b) * 3 - @a').should.equal(11);
    evaluate({ a: 10, b: 2 }, null, '@a > @b').should.equal(true);
    evaluate({ a: 10, b: 2 }, null, '@a > @b == false').should.equal(false);
    evaluate({ a: 10, b: 2 }, null, '@a > @b == true').should.equal(true);
    evaluate({ a: 'foo' }, null, '@a == \'foo\'').should.equal(true);
    evaluate({ a: 'foo' }, null, '@a == "foo" && 1 > 0').should.equal(true);

    evaluate({ a: 'foo' }, null, '@a').should.equal('foo');
  });

  it('string parse', () => {
    evaluate({ a: '1>2' }, null, '@a == "1>2"').should.equal(true);
    evaluate({ a: '' }, null, '@a == ""').should.equal(true);
    evaluate({ a: '"' }, null, '@a == \'"\'').should.equal(true);
    evaluate({ a: '\'a\'' }, null, '@a == "\'a\'" && @a != "a"').should.equal(true);
  });
});
