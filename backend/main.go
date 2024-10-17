package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/checkout/session"
	"golang.org/x/crypto/bcrypt"
)

var jwtKey = []byte("supersecretkey")

type Claims struct {
	Email string `json:"email"`
	jwt.StandardClaims
}

// User and CartItem structs
type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Bio      string `json:"bio"`
}

type CartItem struct {
	ID       int     `json:"id"`
	Title    string  `json:"title"`
	Price    float64 `json:"price"`
	ImageURL string  `json:"image_url"`
	Story    string  `json:"story"`
}

var users []User
var artworks []CartItem

// Register a new user with password hashing
func registerUser(w http.ResponseWriter, r *http.Request) {
	var user User
	json.NewDecoder(r.Body).Decode(&user)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	user.Password = string(hashedPassword)
	users = append(users, user)

	w.WriteHeader(http.StatusCreated)
}

// Login user and return a JWT token
func loginUser(w http.ResponseWriter, r *http.Request) {
	var creds User
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check user credentials
	var user User
	for _, u := range users {
		if u.Email == creds.Email {
			user = u
			break
		}
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Create JWT claims
	expirationTime := time.Now().Add(5 * time.Minute)
	claims := &Claims{
		Email: user.Email,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: expirationTime.Unix(),
		},
	}

	// Create JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	// Send token as response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

// Fetch all artworks (for the gallery)
func getArtworks(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(artworks)
}

// Fetch a specific artwork by its ID
func getArtworkByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])
	for _, item := range artworks {
		if item.ID == id {
			json.NewEncoder(w).Encode(item)
			return
		}
	}
	http.Error(w, "Artwork not found", http.StatusNotFound)
}

// Artist bio management: Fetch and update bio
func getArtistBio(w http.ResponseWriter, r *http.Request) {
	// Assuming the first user is the artist
	if len(users) > 0 {
		json.NewEncoder(w).Encode(map[string]string{"bio": users[0].Bio})
	} else {
		http.Error(w, "No artist found", http.StatusNotFound)
	}
}

func updateArtistBio(w http.ResponseWriter, r *http.Request) {
	var data struct {
		Bio string `json:"bio"`
	}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Assuming the first user is the artist
	if len(users) > 0 {
		users[0].Bio = data.Bio
		w.WriteHeader(http.StatusOK)
	} else {
		http.Error(w, "No artist found", http.StatusNotFound)
	}
}

// Artist upload
func uploadArtwork(w http.ResponseWriter, r *http.Request) {
	var artwork CartItem
	if err := json.NewDecoder(r.Body).Decode(&artwork); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	artwork.ID = len(artworks) + 1
	artworks = append(artworks, artwork)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(artwork)
}

// Artist can delete an artwork by its ID
func deleteArtwork(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, _ := strconv.Atoi(params["id"])

	for index, item := range artworks {
		if item.ID == id {
			artworks = append(artworks[:index], artworks[index+1:]...)
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}
	http.Error(w, "Artwork not found", http.StatusNotFound)
}

// Create a Stripe checkout session for selected artworks
func createCheckoutSession(w http.ResponseWriter, r *http.Request) {
	var cart []CartItem
	if err := json.NewDecoder(r.Body).Decode(&cart); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	lineItems := []*stripe.CheckoutSessionLineItemParams{}
	for _, item := range cart {
		lineItems = append(lineItems, &stripe.CheckoutSessionLineItemParams{
			PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
				Currency: stripe.String("usd"),
				ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
					Name:   stripe.String(item.Title),
					Images: []*string{stripe.String(item.ImageURL)},
				},
				UnitAmount: stripe.Int64(int64(item.Price * 100)),
			},
			Quantity: stripe.Int64(1),
		})
	}

	params := &stripe.CheckoutSessionParams{
		PaymentMethodTypes: stripe.StringSlice([]string{"card"}),
		LineItems:          lineItems,
		Mode:               stripe.String("payment"),
		SuccessURL:         stripe.String(os.Getenv("SUCCESS_URL")),
		CancelURL:          stripe.String(os.Getenv("CANCEL_URL")),
	}

	s, err := session.New(params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"sessionId": s.ID})
}

func main() {
	r := mux.NewRouter()

	// User and Authentication Routes
	r.HandleFunc("/register", registerUser).Methods("POST")
	r.HandleFunc("/login", loginUser).Methods("POST")

	// Artwork Routes
	r.HandleFunc("/artworks", getArtworks).Methods("GET")
	r.HandleFunc("/artworks/{id}", getArtworkByID).Methods("GET")
	r.HandleFunc("/artist/artworks", uploadArtwork).Methods("POST")
	r.HandleFunc("/artist/artworks/{id}", deleteArtwork).Methods("DELETE")

	// Artist Bio Management Routes
	r.HandleFunc("/artist/bio", getArtistBio).Methods("GET")
	r.HandleFunc("/artist/bio", updateArtistBio).Methods("PUT")

	// Stripe Checkout Session
	r.HandleFunc("/create-checkout-session", createCheckoutSession).Methods("POST")

	// Enable CORS middleware
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}).Handler(r)

	log.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}
