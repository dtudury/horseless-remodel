/* global describe it */
import { assert } from 'chai'
import { proxy, watchFunction, unwatchFunction } from '../index.js'

function waitTicks (f, count) {
  if (!count) return f()
  setTimeout(() => waitTicks(f, count - 1))
}

describe('proxy', function () {
  it('should handle basic property manipulation', function () {
    const p = proxy()
    assert.equal('a' in p, false)
    assert.equal(Object.keys(p).length, 0)
    p.a = 1
    assert.equal('a' in p, true)
    assert.equal(p.a, 1)
    assert.equal(Object.keys(p).length, 1)
    p.a = 2
    assert.equal(p.a, 2)
    delete p.a
    assert.equal('a' in p, false)
    assert.equal(Object.keys(p).length, 0)
  })
  it('should notify watching function when value changed', function (done) {
    const p = proxy({ a: 1 })
    const values = []
    let waitUntil = 0
    function f1 () {
      values.push(p.a)
    }
    watchFunction(f1)
    waitTicks(() => {
      p.a = 2
    }, ++waitUntil)
    waitTicks(() => {
      p.a = 2
    }, ++waitUntil)
    waitTicks(() => {
      delete p.a
    }, ++waitUntil)
    waitTicks(() => {
      delete p.a
    }, ++waitUntil)
    waitTicks(() => {
      assert.deepEqual(values, [1, 2, undefined])
      done()
    }, waitUntil + 2)
  })
})
