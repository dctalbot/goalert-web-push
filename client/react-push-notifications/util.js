/**
 * checks if browser is Safari
 */
function isSafari() {
  return 'safari' in window && 'pushNotification' in window.safari
}

/**
 * checks if Push notification and service workers are supported by your browser
 */
function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'Notification' in window
}

/**
 * asks user consent to receive push notifications and returns the response of the user, one of granted, default, denied
 */
function askUserPermission(callback) {
  try {
    // Safari doesn't return a promise for requestPermissions and it
    // throws a TypeError. It takes a callback as the first argument
    // instead.
    Notification.requestPermission(perm => {
      callback(perm)
    })
  } catch (error) {
    // Firefox and Chrome are standard
    Notification.requestPermission().then(perm => callback(perm))
  }
}

/**
 * checks if at least one service worker is present
 */
async function isServiceWorkerRegistered() {
  const reg = await navigator.serviceWorker.getRegistration().then(r => r)
  return reg !== undefined
}

/**
 * shows a notification
 */
function sendNotification() {
  const img = '/images/jason-leung-HM6TMmevbZQ-unsplash.jpg'
  const text = 'Take a look at this brand new t-shirt!'
  const title = 'New Product Available'
  const options = {
    body: text,
    icon: '/images/jason-leung-HM6TMmevbZQ-unsplash.jpg',
    vibrate: [200, 100, 200],
    tag: 'new-product',
    image: img,
    badge: 'https://spyna.it/icons/android-icon-192x192.png',
    actions: [
      {
        action: 'Detail',
        title: 'View',
        icon: 'https://via.placeholder.com/128/ff0000',
      },
    ],
  }
  navigator.serviceWorker.ready.then(function(serviceWorker) {
    serviceWorker.showNotification(title, options)
  })
}

/**
 *
 * using the registered service worker creates a push notification subscription and returns it
 *
 */
async function createNotificationSubscription() {
  // wait for service worker installation to be ready
  const serviceWorker = await navigator.serviceWorker.ready

  // fetch VAPID key
  // const response = await fetch('/getVapidPublicKey') // TODO replace fetch route with this
  const response = await fetch(
    'https://blooming-ocean-51906.herokuapp.com/getVapidPublicKey',
  )
  const json = await response.json()
  const vapidPublicKey = json.value

  // subscribe and return the subscription
  return serviceWorker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  })
}

/**
 * returns the subscription if present or nothing
 */
function getUserSubscription() {
  // wait for service worker installation to be ready, and then
  return navigator.serviceWorker.ready
    .then(function(serviceWorker) {
      return serviceWorker.pushManager.getSubscription()
    })
    .then(function(pushSubscription) {
      return pushSubscription
    })
}

function registerForSafariRemoteNotifications() {
  const websitePushID = 'web.com.target.GoAlert'

  const permissionData = window.safari.pushNotification.permission(
    websitePushID,
  )

  const checkRemotePermission = permissionData => {
    console.log(permissionData)
    if (permissionData.permission === 'default') {
      console.log('default, requesting permission...')
      // This is a new web service URL and its validity is unknown.
      window.safari.pushNotification.requestPermission(
        'https://blooming-ocean-51906.herokuapp.com/push', // The web service URL.
        websitePushID, // The Website Push ID.
        {}, // Data that you choose to send to your server to help you identify the user.
        checkRemotePermission, // The callback function.
      )
    } else if (permissionData.permission === 'denied') {
      // The user said no.
    } else if (permissionData.permission === 'granted') {
      // The web service URL is a valid push provider, and the user said yes.
      // permissionData.deviceToken is now available to use.
    }
  }
  checkRemotePermission(permissionData)
}

export {
  isPushNotificationSupported,
  isSafari,
  isServiceWorkerRegistered,
  askUserPermission,
  sendNotification,
  createNotificationSubscription,
  getUserSubscription,
  registerForSafariRemoteNotifications,
}
