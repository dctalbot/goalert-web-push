import React, { useState, useEffect } from 'react'

import { styles as globalStyles } from '../styles/materialStyles'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import {
  Button,
  Card,
  CardHeader,
  Grid,
  CardContent,
  CardActions,
  Typography,
  Switch,
} from '@material-ui/core'
import * as serviceWorker from '../push-notifications'

import {
  isPushNotificationSupported,
  askUserPermission,
  isServiceWorkerRegistered,
  isSafari,
  registerForSafariRemoteNotifications,
} from '../push-notifications/util'

const useStyles = makeStyles(theme => {
  const { cardHeader } = globalStyles(theme)

  return createStyles({
    actionGrid: {
      display: 'flex',
      alignItems: 'center',
    },
    cardHeader,
    cardContent: {
      paddingTop: 0,
    },
    spaceBetween: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  })
})

const testPushNotification = () => {
  fetch('https://blooming-ocean-51906.herokuapp.com/testPushNotification')
}

export default () => {
  const classes = useStyles()

  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    async function doAsync() {
      const registered = await isServiceWorkerRegistered()
      setEnabled(registered)
    }
    doAsync()
  }, [])

  const registerIfGranted = perm => {
    if (perm === 'granted') {
      serviceWorker.register()
      setEnabled(true)
    }
  }

  const toggleSwitch = async () => {
    if (isSafari()) {
      registerForSafariRemoteNotifications()
      return
    }

    const registered = await isServiceWorkerRegistered()
    if (registered) {
      serviceWorker.unregister()
      setEnabled(false)
    } else {
      askUserPermission(registerIfGranted)
    }
  }

  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader
          className={classes.cardHeader}
          component='h3'
          title='Web Push Notifications'
        />
        <CardContent className={classes.cardContent}>
          <span className={classes.spaceBetween}>
            <Typography component='p'>
              Receive browser push notifications for all alerts
            </Typography>
            <CardActions>
              {enabled && (
                <Button id='doIt' onClick={testPushNotification}>
                  Test
                </Button>
              )}
              <Switch
                id='spec'
                checked={enabled}
                onChange={toggleSwitch}
                disabled={!isPushNotificationSupported()}
              />
            </CardActions>
          </span>
        </CardContent>
      </Card>
    </Grid>
  )
}
