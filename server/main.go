package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/gorilla/mux"
	"github.com/sideshow/apns2"
	"github.com/sideshow/apns2/certificate"
)

////////////
//  UTIL  //
////////////

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

///////////////
// ENDPOINTS //
///////////////

func getVapidPublicKey(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if (*r).Method == "OPTIONS" {
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"value": os.Getenv("VAPID_PUBLIC_KEY")})
}

func generateVapidKeys(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if (*r).Method == "OPTIONS" {
		return
	}
	privateKey, publicKey, err := webpush.GenerateVAPIDKeys()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"err": err.Error()})
	}
	json.NewEncoder(w).Encode(map[string]string{"publicKey": publicKey, "privateKey": privateKey})
}

func testPushNotification(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if (*r).Method == "OPTIONS" {
		return
	}
	s := &webpush.Subscription{}
	// TODO get browser subscription for user; this is an example subscription obj given by google or mozilla
	destination := `{"endpoint":"https://fcm.googleapis.com/fcm/send/cyRa7jFka8M:APA91bFIWWm9yN-sqNxncqp_yQgv8QQbXDPpiJYwquFp5hE1Jk3rDRI0ieulpxB-trTpGtG4GTgFpENQyTqfFXE0FbRalK5Or9CivXdrxS4-KSzN01CAkjZaXRyLyxAvR2fLfqHxn7oi","expirationTime":null,"keys":{"p256dh":"BLDaDnFXuNYkIvZad-0nQ_oEHIPM2VWiOB7d4fEMlOZJPlDAZ_nM2ynhHgLM7rhKekKXnngGxCoeT4KrjLv3F9Q","auth":"w5w3EJkYdoHY50y7ni_sSg"}}`
	json.Unmarshal([]byte(destination), s)
	webpush.SendNotification([]byte(`{"url":"https://t.glrt.me/DV4GR", "message":"Your super service has 42 new alerts", "ackCode":"100aa", "closeCode":"100cc"}`), s, &webpush.Options{
		VAPIDPublicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
		VAPIDPrivateKey: os.Getenv("VAPID_PRIVATE_KEY"),
		TTL:             3600,
	})
}

func downloadPushPackage(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if (*r).Method == "OPTIONS" {
		return
	}
	fmt.Println(r)
	w.Header().Set("Content-Disposition", "attachment; filename=pushPackage.zip")
	w.Header().Set("Content-Type", "application/zip")
	fmt.Println("serving file")
	http.ServeFile(w, r, "./static/pushPackage.zip")
	fmt.Println("file hopefully served")
}

func writelogs(w http.ResponseWriter, r *http.Request) {
	type LogResp struct {
		Logs []string `json:"logs"`
	}
	jsonObj := new(LogResp)
	logs := json.NewDecoder(r.Body).Decode(jsonObj)
	fmt.Println(logs)
}

func resgisterDevice(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	if (*r).Method == "OPTIONS" {
		return
	}

	// When users first grant permission, or later change their permission levels for your website,
	// a POST request is sent here

	// If a user removes permission of a website in Safari preferences, a DELETE request is sent

	// In the HTTP header is the Authorization header.
	// Its value is the word ApplePushNotifications and the authentication token, separated by a single space.
	// The authentication token is the same token that’s specified in your package’s website.json file.
	// Your web service can use this token to determine which user is registering or updating their permission policy.

	vars := mux.Vars(r)
	deviceToken := vars["deviceToken"]

	fmt.Println(deviceToken)

	// TODO store deviceToken in database
}

func testAPNs(w http.ResponseWriter, r *http.Request) {
	cert, err := certificate.FromP12File("./static/cert.p12", os.Getenv("CERTPW"))
	if err != nil {
		log.Fatal("Cert Error:", err)
	}

	notification := &apns2.Notification{}
	// TODO get Device Token
	notification.DeviceToken = "FC1051A2EF349782B378AAD7B0EBC2ABD4C031D4EA69139E17A965B15FD74A8B" //example device token
	notification.Topic = "web.com.target.GoAlert"
	notification.Payload = []byte(`{"aps":{"alert":{"title":"GoAlert","body":"Your super service has 42 new alerts.","action":"View"},"url-args":[]}}`)

	// If you want to test push notifications for builds running directly from XCode (Development), use
	// client := apns2.NewClient(cert).Development()
	// For apps published to the app store or installed as an ad-hoc distribution use Production()

	client := apns2.NewClient(cert).Production()
	res, err := client.Push(notification)

	if err != nil {
		log.Println("There was an error", err)
		return
	}

	if res.Sent() {
		log.Println("Sent:", res.ApnsID)
	} else {
		fmt.Printf("Not Sent: %v %v %v\n", res.StatusCode, res.ApnsID, res.Reason)
	}

}

////////////
// DRIVER //
////////////

func main() {

	r := mux.NewRouter()

	http.HandleFunc("/getVapidPublicKey", getVapidPublicKey)
	http.HandleFunc("/generateVapidKeys", generateVapidKeys)
	http.HandleFunc("/testPushNotification", testPushNotification)

	const (
		webServiceURL = "push"
		version       = "v2"
		websitePushID = "web.com.target.GoAlert"
	)

	http.HandleFunc(fmt.Sprintf("/%s/v1/pushPackages/%s", webServiceURL, websitePushID), downloadPushPackage)
	http.HandleFunc(fmt.Sprintf("/%s/v2/pushPackages/%s", webServiceURL, websitePushID), downloadPushPackage)

	http.HandleFunc(fmt.Sprintf("/%s/v1/log", webServiceURL), writelogs)

	r.HandleFunc(fmt.Sprintf("/%s/v1/devices/{deviceToken}/registrations/%s", webServiceURL, websitePushID), resgisterDevice)

	http.HandleFunc("/testAPNs", testAPNs)
	http.Handle("/", r)

	port := os.Getenv(("PORT"))
	http.ListenAndServe(":"+port, nil)
}
