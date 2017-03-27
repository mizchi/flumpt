import React from 'react'
import ReactDOM from 'react-dom'
import {withFlux, Component} from '../../src/flumpt'

class CounterIncrement extends Component {
  render() {
    return <button onClick={_ev => this.dispatch('increment')}>+1</button>
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
