/* global describe it */
import { assert } from 'chai'
import { proxy, watchFunction, unwatchFunction } from '../index.js'

describe('proxy', function () {
  it('should reflect set values', function () {
    const p = proxy({ a: 1 })
    p.a = 2
    assert.equal(p.a, 2, 'setting properties should work')
  })
})
