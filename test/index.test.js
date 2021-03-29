/* global describe it */

import { assert } from 'chai'
import { proxy, watchFunction, unwatchFunction, after } from '../remodel.js'

global.requestAnimationFrame = setTimeout

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
  it('should notify watching function when array or object changed', function (done) {
    const p = proxy({ a: [], o: {} })
    const values = []
    let waitUntil = 0
    function f () {
      values.push([p.a.length, Object.keys(p.o).length])
    }
    watchFunction(f)
    waitTicks(() => {
      p.a.push(1)
    }, ++waitUntil)
    waitTicks(() => {
      p.a.push(2)
    }, ++waitUntil)
    waitTicks(() => {
      p.o.a = true
    }, ++waitUntil)
    waitTicks(() => {
      p.o.a = false
    }, ++waitUntil)
    waitTicks(() => {
      p.o.b = true
    }, ++waitUntil)
    waitTicks(() => {
      p.a.push(3)
    }, ++waitUntil)
    waitTicks(() => {
      delete p.o.a
    }, ++waitUntil)
    waitTicks(() => {
      assert.deepEqual(values, [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [3, 2], [3, 1]])
      done()
    }, waitUntil + 2)
  })
  it('should notify watching function when value changed', function (done) {
    const p = proxy({ a: 1, b: { a: 1 }, c: 1 })
    const acValues = []
    const cValues = []
    let waitUntil = 0
    function f1 () {
      acValues.push([p.a, p.c])
      void (p.a)
    }
    watchFunction(f1)
    watchFunction(f1)
    function f2 () {
      cValues.push([p.c, p.b.a])
    }
    watchFunction(f2)
    waitTicks(() => {
      p.b.b = { a: 1 }
    }, ++waitUntil)
    waitTicks(() => {
      p.b.a = 2
      p.c = 2
    }, ++waitUntil)
    waitTicks(() => {
      p.a = 1
    }, ++waitUntil)
    waitTicks(() => {
      p.a = 2
    }, ++waitUntil)
    waitTicks(() => {
      p.c = 3
    }, ++waitUntil)
    waitTicks(() => {
      delete p.a
    }, ++waitUntil)
    waitTicks(() => {
      delete p.a
    }, ++waitUntil)
    waitTicks(() => {
      unwatchFunction(f1)
    }, ++waitUntil)
    waitTicks(() => {
      p.a = 4
    }, ++waitUntil)
    waitTicks(() => {
      assert.deepEqual(acValues, [[1, 1], [1, 2], [2, 2], [2, 3], [undefined, 3]])
      assert.deepEqual(cValues, [[1, 1], [2, 2], [3, 2]])
      done()
    }, waitUntil + 2)
  })
  it('should handle after events', function (done) {
    let waitUntil = 0
    const p = proxy()
    const logs = []
    watchFunction(() => {
      logs.push(`x: ${p.x}`)
    })
    watchFunction(() => {
      logs.push(`keys: ${JSON.stringify(Object.keys(p))}`)
    })
    after(() => {
      logs.push(`after ${JSON.stringify(p)}`)
    })
    waitTicks(() => {
      p.x = 1
    }, ++waitUntil)
    waitTicks(() => {
      p.x = 2
    }, ++waitUntil)
    waitTicks(() => {
      assert.deepEqual(logs, [
        'x: undefined',
        'keys: []',
        'keys: ["x"]',
        'x: 1',
        'after {"x":1}',
        'x: 2'
      ])
      done()
    }, waitUntil + 2)
  })
  it('should not fail on null values', function (done) {
    assert.doesNotThrow(() => {
      const p = proxy()
      p.x = null
    })
    done()
  })
})
