import { createNotificationSubscription } from './util'

async function register() {
  // clean slate?
  // navigator.serviceWorker.getRegistrations().then(registrations => {
  //   for (let registration of registrations) {
  //     registration.unregister()
  //   }
  // })

  const registration = await navigator.serviceWorker.register('./sw.js')

  // TODO fix race condition here b/w state of installing vs activated

  if (registration.active) {
    const subscription = await createNotificationSubscription()
    const payload = JSON.stringify(subscription)
    console.log(payload)
  } else {
    console.log('sorry, try again later')
  }

  // TODO set up data model to store json payload
  // Send the subscription details to the server using the Fetch API.
  // fetch("./register", {
  //   method: "post",
  //   headers: {
  //     "Content-type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     subscription: payload
  //   })
  // });
}

async function unregister() {
  const registration = await navigator.serviceWorker.ready
  registration.unregister()
}

export { register, unregister }
