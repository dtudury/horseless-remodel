/* global requestAnimationFrame */

const _proxySet = new Set()
const _keyMaps = new Map()
const _triggerable = new Set()
const _triggered = new Set()
const _stack = []
const _OWN_KEYS = new Symbol('treat ownKeys like an attribute')
let _handlingTriggered = false

function _reportKeyMutation (target, key) {
  if (_keyMaps.has(key)) {
    const keyMap = _keyMaps.get(key)
    if (keyMap.has(target)) {
      if (!_handlingTriggered) {
        _handlingTriggered = true
        requestAnimationFrame(() => {
          _handlingTriggered = false
          for (const callback of _triggered) {
            callback()
          }
        })
      }
      for (const callback of keyMap.get(target)) {
        _triggered.add(callback)
      }
      keyMap.delete(target)
      if (!keyMap.size) {
        _keyMaps.delete(key)
      }
    }
  }
}

function _reportKeyAccess (target, key) {
  if (_stack.length) {
    if (!_keyMaps.has(key)) {
      _keyMaps.set(key, new WeakMap())
    }
    const keyMap = _keyMaps.get(key)
    if (!keyMap.has(target)) {
      keyMap.set(target, new Set())
    }
    keyMap.get(target).add(_stack[0])
  }
}

export function proxy (target = {}) {
  if (target instanceof Object && !_proxySet.has(target)) {
    const _self = new Proxy(Array.isArray(target) ? new Array(target.length) : {}, {
      has (target, key) {
        _reportKeyAccess(target, key)
        return key in target
      },
      get (target, key) {
        _reportKeyAccess(target, key)
        return target[key]
      },
      set (target, key, value) {
        value = proxy(value, _self)
        if (target[key] !== value) {
          if (!(key in target)) {
            _reportKeyMutation(target, _OWN_KEYS)
          }
          _reportKeyMutation(target, key)
        }
        target[key] = value
        return true
      },
      deleteProperty (target, key) {
        if (key in target) {
          _reportKeyMutation(target, _OWN_KEYS)
          _reportKeyMutation(target, key)
        }
        return Reflect.deleteProperty(target, key)
      },
      ownKeys (target) {
        _reportKeyAccess(target, _OWN_KEYS)
        return Reflect.ownKeys(target)
      }
    })
    Object.assign(_self, target)
    _proxySet.add(_self)
    target = _self
  }
  return target
}

export function watchFunction (f) {
  function wrapped () {
    if (_triggerable.has(f)) {
      _stack.unshift(wrapped)
      f()
      _stack.shift()
    }
  }
  if (!_triggerable.has(f)) {
    _triggerable.add(f)
    wrapped()
  }
}

export function unwatchFunction (f) {
  _triggerable.delete(f)
}
