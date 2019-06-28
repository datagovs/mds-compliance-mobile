/*
    Copyright 2019 City of Los Angeles.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */
import React from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router'
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/react'

import { getConfigPaths } from 'config'
import { TELEMETRY_MODE } from 'constants.js'
import { pages } from 'pages'
import { withAudit } from 'store/index'

import { getTelemetryModeLabel } from './labels'
import './AppMenu.scss'

const config = getConfigPaths({
  build: 'apps.compliance.app.build',
  env: '_env',
  version: 'apps.compliance.app.version'
})

export function ActionMenuItem(handler, title, icon = null) {
  return (
    <IonMenuToggle key={title} auto-hide='false'>
      <IonItem button onClick={() => handler()}>
        {icon && <IonIcon slot='start' name={icon} />}
        <IonLabel>{title}</IonLabel>
      </IonItem>
    </IonMenuToggle>
  )
}

// Export unwrapped for testing.
class Menu extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    audit: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  // Create menu components once to minimize churn.
  constructor(...args) {
    super(...args)
    const { history, actions } = this.props

    function resetApp() {
      actions.resetAudit()
      actions.resetEventQueue()
    }

    function reloadApp() {
      window.location.reload()
    }

    // Create `pages` menu items
    this.pages = pages.map(page => (
      <IonMenuToggle key={page.title} auto-hide='false'>
        <IonItem button onClick={() => history.push(page.path)}>
          <IonIcon slot='start' name={page.icon} />
          <IonLabel>{page.title}</IonLabel>
        </IonItem>
      </IonMenuToggle>
    ))

    // Create `actions` debug menu items
    this.actions = {
      logout: ActionMenuItem(actions.logout, 'Log Out', 'log-out'),
      resetAppData: ActionMenuItem(resetApp, 'Reset App Data', 'thunderstorm'),
      reloadApp: ActionMenuItem(reloadApp, 'Reload App', 'refresh')
    }

    this.onTelemetryChanged = event => {
      const mode = event.target.value
      if (mode) actions.setTelemetryMode(mode)
    }
  }

  render() {
    const { audit } = this.props
    return (
      <IonMenu id='AppMenu' contentId='main'>
        <IonHeader>
          <IonToolbar>
            <IonTitle>MDS Compliance</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent class='outer-content'>
          <IonList>{this.pages}</IonList>
          <IonList>
            <IonListHeader>Settings</IonListHeader>
            {this.actions.logout}
            <IonItem>
              <IonIcon slot='start' name='locate' />
              <IonSelect interface='action-sheet' value={audit.telemetryMode} onIonChange={this.onTelemetryChanged}>
                <IonSelectOption value={TELEMETRY_MODE.timer}>
                  Telemetry: {getTelemetryModeLabel(TELEMETRY_MODE.timer)}
                </IonSelectOption>
                <IonSelectOption value={TELEMETRY_MODE.location}>
                  Telemetry: {getTelemetryModeLabel(TELEMETRY_MODE.location)}
                </IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonList>
          <IonList>
            <IonListHeader>Debug</IonListHeader>
            {this.actions.reloadApp}
            {this.actions.resetAppData}
            <IonItem>
              <IonIcon slot='start' name='finger-print' />
              <IonLabel>
                {'Build: '}
                {config.version}
                {' - '}
                {config.env}
                {' - '}
                {config.build}
              </IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonMenu>
    )
  }
}

// Export wrapped for app consumption.
export default withAudit(withRouter(Menu))
