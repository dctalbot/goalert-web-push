# Web-push noticiations in Go

## Google and Mozilla

Chrome and Firefox offer push notification services with a very similar APIs. A user creates a subscription packet which the backend saves and effectively uses as an address to send notifications to.

This is the address:

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/cyRa7jFka8M:APA91bFIWWm9yN-sqNxncqp_yQgv8QQbXDPpiJYwquFp5hE1Jk3rDRI0ieulpxB-trTpGtG4GTgFpENQyTqfFXE0FbRalK5Or9CivXdrxS4-KSzN01CAkjZaXRyLyxAvR2fLfqHxn7oi",
  "expirationTime": null,
  "keys": {
    "p256dh": "BLDaDnFXuNYkIvZad-0nQ_oEHIPM2VWiOB7d3fEMlOZJPlDAZ_nM2ynhHgLM7rhKekKXnngGxCoeT4KrjLv3F9Q",
    "auth": "w5w3EJkYdoHY40y7ni_sSg"
  }
}
```

This is the message:

```json
{
  "url": "https://t.glrt.me/DV4GR",
  "message": "Your super service has 42 new alerts"
}
```

## Safari

Safari has its own service that also facilitates push notifications for other Apple products like iOS, iPadOS, tvOS, whatever else, so if you already have an iPhone push service set up, it's just a matter of generating device tokens from the browser. It also has the advantage of being native so if Safari is not running, a macbook can still receive notifications.

This is the address:

```
FC1051A2EF349782B378AAD7B0EBC2ABD4C031D4EA69139E17A965B15FD74A8B
```

This is the message:

```json
{
  "aps": {
    "alert": {
      "title": "GoAlert",
      "body": "Your super service has 42 new alerts.",
      "action": "View"
    },
    "url-args": []
  }
}
```

# Getting started

1. Generate an APNS certificate (cert.p12) & password
2. Replace `<INSERT PASSWORD HERE>` in `createPushPackage.php` with said password
3. Move `cert.p12` into `server/static`
4. `cd` to `util/` and run `php createPushPackage.php`
5. Rename generated zip as simply `pushPackage.zip`
6. Move `pushPackage.zip` into `server/static`
7. Genereate VAPID private/public key pair
8. Add these to you ENV: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CERTPW

# Credit

Thanks to @sideshow for https://github.com/sideshow/apns2

# Demo

At one point in time, I had APNS hooked up with a client at https://frightening-zoo.surge.sh and a server at https://blooming-ocean-51906.herokuapp.com. You may see references to these in the code
