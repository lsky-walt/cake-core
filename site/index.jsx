import React from "react"
import ReactDOM from "react-dom"
import { HashRouter as Router, Route, Switch, Link } from "react-router-dom"
import Base from "./page/base"

import styles from "./style.less"

class Nav extends React.PureComponent {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Router>
        <div className={styles["main-container"]} id="container">
          <div className={styles.nav}>
            <div className={styles.link}>
              <div>
                <Link to="/base">base</Link>
              </div>
            </div>
          </div>
          <div className={styles.content}>
            <Switch>
              <Route exact path="/">
                <Base />
              </Route>
              <Route path="/base">
                <Base />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    )
  }
}

ReactDOM.render(<Nav />, document.getElementById("app"))
