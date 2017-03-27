import React from 'react'
import ReactDOM from 'react-dom'
import {withFlux, dispatchable, Component} from '../../src/flumpt'

@dispatchable
class CounterIncrement extends React.Component {
  render() {
    return <button onClick={_ev => this.context.dispatch('increment')}>+1</button>
  }
}

@withFlux((update, on) => {
  on('increment', () => {
    update(state => {
      return {count: state.count + 1}
    })
  })
}, {count: 0})
class MyApp extends React.Component {
  render () {
    return <div>
      <span>{this.props.count}</span>
      <CounterIncrement/>
    </div>
  }
}

ReactDOM.render(
  <MyApp/>,
  document.querySelector('#root')
)
