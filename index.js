/* global requestAnimationFrame */

const _proxySet = new Set()
const _keyMaps = new Map()
const _keysMap = new WeakMap()
const _triggered = new Set()
const _watched = new Set()
const _stack = []
let _handlingTriggered = false


function _handleTriggered () {
  function dispatch () {
    _handlingTriggered = false
    for (const callback of _triggered) {
      callback()
    }
  }
  if (!_handlingTriggered) {
    _handlingTriggered = true
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(dispatch)
    } else {
      setTimeout(dispatch)
    }
  }
}

function _mutateKey (target, key) {
  if (_keyMaps.has(key)) {
    const keyMap = _keyMaps.get(key)
    if (keyMap.has(target)) {
      _handleTriggered()
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

function _mutateKeys (target) {
  if (_keysMap.has(target)) {
    _handleTriggered()
    for (const callback of _keysMap.get(target)) {
      _triggered.add(callback)
    }
    _keysMap.delete(target)
  }
}

function _accessKey (target, key) {
  if (_stack.length) {
    if (!_keyMaps.has(key)) {
      _keyMaps.set(key, new Map())
    }
    const keyMap = _keyMaps.get(key)
    if (!keyMap.has(target)) {
      keyMap.set(target, new Set())
    }
    keyMap.get(target).add(_stack[0])
  }
}

function _accessKeys (target) {
  if (_stack.length) {
    if (!_keysMap.has(target)) {
      _keysMap.set(target, new Set())
    }
    _keysMap.get(target).add(_stack[0])
  }
}

export function proxy (target = {}) {
  if (target instanceof Object && !_proxySet.has(target)) {
    const _self = new Proxy(Array.isArray(target) ? new Array(target.length) : {}, {
      has (target, key) {
        _accessKey(target, key)
        return key in target
      },
      get (target, key) {
        _accessKey(target, key)
        return target[key]
      },
      set (target, key, value) {
        value = proxy(value, _self)
        if (target[key] !== value) {
          if (!(key in target)) {
            _mutateKeys(target)
          }
          _mutateKey(target, key)
        }
        target[key] = value
        return true
      },
      deleteProperty (target, key) {
        if (key in target) {
          _mutateKeys(target)
          _mutateKey(target, key)
        }
        return Reflect.deleteProperty(target, key)
      },
      ownKeys (target) {
        _accessKeys(target)
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
    if (_watched.has(f)) {
      _stack.unshift(wrapped)
      f()
      _stack.shift()
    }
  }
  if (!_watched.has(f)) {
    _watched.add(f)
    wrapped()
  }
}

export function unwatchFunction (f) {
  _watched.delete(f)
}
