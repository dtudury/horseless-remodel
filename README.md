# horseless.remodel

Magical data binding.

## Why?

***horseless*** uses an HTML-like template language to transform a data model into browser elements. It's a neat trick, but updating the rendered page as the model changes seems unnecessarily complex for how similar the process is for every instance. ***horseless.remodel*** allows those elements to be updated continuously as the data changes. Any data that the function accessed. Automatically.

## How does it work?

***horseless.remodel*** exposes four methods: `remodel`, `watchFunction`, `unwatchFunction`, and `after`. 

### `remodel(model)`

`remodel` wraps a simple model (something you could JSON) and returns a proxy. Mutating the model's attributes through the proxy then triggers the watched functions that accessed those attributes.

### `watchFunction(f)`

`watchFunction` runs the function it's passed and collects a list of attributes accessed by that function. It registers that function as a listener for any future change to those attributes.

### `unwatchFunction(f)`

`unwatchFunction` removes the function it's passed from the list of valid listeners

### `after(f)`

`after` adds a one time callback for after the current round of watched functions have executed

## Usage

```
import { remodel, watchFunction } from 'horseless.remodel'

const model = remodel({ name:'Theon' })

function setGreeting () {
  document.querySelector('.greeting').innerText = `Hello ${model.name}`
}

watchFunction (setGreeting)

setTimeout(() => {
  model.name = 'Reek'
}, 5000)
```

Result: "Hello Theon" is displayed for five seconds after which "Hello Reek" is displayed

## everything else
This repo contains about a hundred lines of pretty straight-forward code. Please take a peak in `index.js`. If you have questions or suggestions, I'd love to hear from you!