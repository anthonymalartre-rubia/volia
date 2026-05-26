// ─────────────────────────────────────────────────────────────────
// Tests forms.js — F4 (conditional logic AND/OR + 13 operators)
// ─────────────────────────────────────────────────────────────────

const {
  normalizeConditionalLogic,
  evaluateOperator,
  evaluateConditionalLogic,
  evaluateCondition,
  validateFormSchema,
  getOperatorsForFieldType,
  OPERATORS_BY_FIELD_TYPE,
} = require('../forms');

describe('normalizeConditionalLogic', () => {
  test('null → null', () => {
    expect(normalizeConditionalLogic(null)).toBeNull();
  });

  test('legacy single condition → { combinator AND, conditions[1] }', () => {
    const legacy = { field_key: 'type', operator: 'equals', value: 'pro' };
    const out = normalizeConditionalLogic(legacy);
    expect(out).toEqual({
      combinator: 'AND',
      conditions: [{ field_key: 'type', operator: 'equals', value: 'pro' }],
    });
  });

  test('new form OR with 2 conditions', () => {
    const input = {
      combinator: 'OR',
      conditions: [
        { field_key: 'a', operator: 'equals', value: '1' },
        { field_key: 'b', operator: 'is_not_empty' },
      ],
    };
    const out = normalizeConditionalLogic(input);
    expect(out.combinator).toBe('OR');
    expect(out.conditions).toHaveLength(2);
  });

  test('invalid combinator → fallback AND', () => {
    const out = normalizeConditionalLogic({
      combinator: 'XOR',
      conditions: [{ field_key: 'x', operator: 'equals', value: '1' }],
    });
    expect(out.combinator).toBe('AND');
  });

  test('invalid operator → fallback equals', () => {
    const out = normalizeConditionalLogic({
      combinator: 'AND',
      conditions: [{ field_key: 'x', operator: 'wat', value: '1' }],
    });
    expect(out.conditions[0].operator).toBe('equals');
  });
});

describe('evaluateOperator — 13 operators', () => {
  test('equals / not_equals', () => {
    expect(evaluateOperator('equals', 'foo', 'foo')).toBe(true);
    expect(evaluateOperator('equals', 'foo', 'bar')).toBe(false);
    expect(evaluateOperator('not_equals', 'foo', 'bar')).toBe(true);
  });

  test('contains (string + array)', () => {
    expect(evaluateOperator('contains', 'Bar', 'foobar')).toBe(true);
    expect(evaluateOperator('contains', 'zz', 'foobar')).toBe(false);
    expect(evaluateOperator('contains', 'b', ['a', 'B', 'c'])).toBe(true);
  });

  test('is_empty / is_not_empty', () => {
    expect(evaluateOperator('is_empty', null, '')).toBe(true);
    expect(evaluateOperator('is_empty', null, [])).toBe(true);
    expect(evaluateOperator('is_empty', null, null)).toBe(true);
    expect(evaluateOperator('is_not_empty', null, 'x')).toBe(true);
  });

  test('starts_with / ends_with', () => {
    expect(evaluateOperator('starts_with', 'foo', 'foobar')).toBe(true);
    expect(evaluateOperator('ends_with', 'BAR', 'fooBar')).toBe(true);
    expect(evaluateOperator('starts_with', 'xx', 'foobar')).toBe(false);
  });

  test('greater_than / less_than / >= / <=', () => {
    expect(evaluateOperator('greater_than', 10, 20)).toBe(true);
    expect(evaluateOperator('greater_than', 10, 5)).toBe(false);
    expect(evaluateOperator('less_than', 10, 5)).toBe(true);
    expect(evaluateOperator('greater_or_equal', 10, 10)).toBe(true);
    expect(evaluateOperator('less_or_equal', 10, 10)).toBe(true);
    expect(evaluateOperator('greater_than', 'abc', 1)).toBe(false); // NaN guard
  });

  test('in / not_in (CSV string + array)', () => {
    expect(evaluateOperator('in', 'a,b,c', 'b')).toBe(true);
    expect(evaluateOperator('in', 'a,b,c', 'z')).toBe(false);
    expect(evaluateOperator('not_in', 'a,b,c', 'z')).toBe(true);
    expect(evaluateOperator('in', ['x', 'y'], 'y')).toBe(true);
  });

  test('unknown operator → true (tolérant)', () => {
    expect(evaluateOperator('wtf', '', '')).toBe(true);
  });
});

describe('evaluateConditionalLogic — AND/OR engine', () => {
  test('legacy single condition', () => {
    const cl = { show_if: { field_key: 'a', operator: 'equals', value: '1' } };
    expect(evaluateConditionalLogic(cl, { a: '1' })).toBe(true);
    expect(evaluateConditionalLogic(cl, { a: '2' })).toBe(false);
  });

  test('AND : toutes vraies → true', () => {
    const cl = {
      show_if: {
        combinator: 'AND',
        conditions: [
          { field_key: 'a', operator: 'equals', value: '1' },
          { field_key: 'b', operator: 'is_not_empty' },
        ],
      },
    };
    expect(evaluateConditionalLogic(cl, { a: '1', b: 'x' })).toBe(true);
    expect(evaluateConditionalLogic(cl, { a: '1', b: '' })).toBe(false);
  });

  test('OR : au moins une vraie → true', () => {
    const cl = {
      show_if: {
        combinator: 'OR',
        conditions: [
          { field_key: 'a', operator: 'equals', value: '1' },
          { field_key: 'b', operator: 'greater_than', value: 10 },
        ],
      },
    };
    expect(evaluateConditionalLogic(cl, { a: '2', b: 20 })).toBe(true);
    expect(evaluateConditionalLogic(cl, { a: '2', b: 5 })).toBe(false);
  });

  test('null / pas de show_if → visible (true)', () => {
    expect(evaluateConditionalLogic(null, {})).toBe(true);
    expect(evaluateConditionalLogic({}, {})).toBe(true);
  });
});

describe('evaluateCondition (jump logic)', () => {
  test('AND/OR sur condition standalone', () => {
    const c = {
      combinator: 'OR',
      conditions: [
        { field_key: 'plan', operator: 'equals', value: 'pro' },
        { field_key: 'plan', operator: 'equals', value: 'enterprise' },
      ],
    };
    expect(evaluateCondition(c, { plan: 'pro' })).toBe(true);
    expect(evaluateCondition(c, { plan: 'free' })).toBe(false);
  });
});

describe('getOperatorsForFieldType', () => {
  test('text field → contient starts_with', () => {
    const ops = getOperatorsForFieldType('text');
    expect(ops).toContain('starts_with');
    expect(ops).toContain('equals');
  });

  test('checkbox field → ne contient PAS greater_than', () => {
    const ops = getOperatorsForFieldType('checkbox');
    expect(ops).not.toContain('greater_than');
  });

  test('number field → contient greater_than mais pas starts_with', () => {
    const ops = getOperatorsForFieldType('number');
    expect(ops).toContain('greater_than');
    expect(ops).not.toContain('starts_with');
  });

  test('OPERATORS_BY_FIELD_TYPE export', () => {
    expect(OPERATORS_BY_FIELD_TYPE.text).toBeDefined();
    expect(OPERATORS_BY_FIELD_TYPE.number).toBeDefined();
  });
});

describe('validateFormSchema — nouvelles formes F4', () => {
  test('field avec conditional_logic nouvelle forme → valide', () => {
    const schema = {
      version: 1,
      pages: [{ id: 'page-1', title: 'P', position: 0 }],
      fields: [
        {
          id: 'fld-1',
          key: 'a',
          type: 'text',
          label: 'Field A',
          page_id: 'page-1',
        },
        {
          id: 'fld-2',
          key: 'b',
          type: 'text',
          label: 'Field B',
          page_id: 'page-1',
          conditional_logic: {
            show_if: {
              combinator: 'AND',
              conditions: [{ field_key: 'a', operator: 'starts_with', value: 'x' }],
            },
          },
        },
      ],
    };
    const r = validateFormSchema(schema);
    expect(r.valid).toBe(true);
  });

  test('field avec conditional_logic legacy → toujours valide (backward compat)', () => {
    const schema = {
      version: 1,
      pages: [{ id: 'page-1', title: 'P', position: 0 }],
      fields: [
        { id: 'fld-1', key: 'a', type: 'text', label: 'Field A', page_id: 'page-1' },
        {
          id: 'fld-2',
          key: 'b',
          type: 'text',
          label: 'Field B',
          page_id: 'page-1',
          conditional_logic: {
            show_if: { field_key: 'a', operator: 'equals', value: 'x' },
          },
        },
      ],
    };
    expect(validateFormSchema(schema).valid).toBe(true);
  });

  test('page avec jump_logic valide', () => {
    const schema = {
      version: 1,
      pages: [
        {
          id: 'page-1',
          title: 'P1',
          position: 0,
          jump_logic: {
            rules: [
              {
                id: 'rule-1',
                condition: {
                  combinator: 'AND',
                  conditions: [{ field_key: 'a', operator: 'equals', value: 'pro' }],
                },
                action: 'skip_to_page',
                target_page_id: 'page-3',
              },
            ],
          },
        },
        { id: 'page-2', title: 'P2', position: 1 },
        { id: 'page-3', title: 'P3', position: 2 },
      ],
      fields: [{ id: 'fld-1', key: 'a', type: 'text', label: 'A', page_id: 'page-1' }],
    };
    expect(validateFormSchema(schema).valid).toBe(true);
  });

  test('jump_logic avec action invalide → erreur', () => {
    const schema = {
      version: 1,
      pages: [
        {
          id: 'page-1',
          title: 'P1',
          position: 0,
          jump_logic: {
            rules: [
              { action: 'redirect_to_url', target_page_id: 'page-2' },
            ],
          },
        },
        { id: 'page-2', title: 'P2', position: 1 },
      ],
      fields: [],
    };
    const r = validateFormSchema(schema);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => /action/.test(e))).toBe(true);
  });

  test('operator invalide → erreur', () => {
    const schema = {
      version: 1,
      pages: [{ id: 'page-1', title: 'P', position: 0 }],
      fields: [
        { id: 'fld-1', key: 'a', type: 'text', label: 'A', page_id: 'page-1' },
        {
          id: 'fld-2',
          key: 'b',
          type: 'text',
          label: 'B',
          page_id: 'page-1',
          conditional_logic: {
            show_if: {
              combinator: 'AND',
              conditions: [{ field_key: 'a', operator: 'banana', value: 'x' }],
            },
          },
        },
      ],
    };
    const r = validateFormSchema(schema);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => /operator/.test(e))).toBe(true);
  });
});
