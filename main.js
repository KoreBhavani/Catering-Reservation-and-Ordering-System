// Import necessary Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDX2HqfKlRUNNH7dtz4TGKZrXR3qRPVUf8",
    authDomain: "project-2-cb3a5.firebaseapp.com",
    databaseURL: "https://project-2-cb3a5-default-rtdb.firebaseio.com",
    projectId: "project-2-cb3a5",
    storageBucket: "project-2-cb3a5.appspot.com",
    messagingSenderId: "451782906210",
    appId: "1:451782906210:web:3fb0802311fbf227e81c3b"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const users = {}; // Cache for users

// Function to display orders in the table
const displayOrders = (orderId, userName, userEmail, address, phoneNumber, foodName, quantity, status) => {
    const tableBody = document.getElementById('adminOrders');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${orderId}</td>
        <td>${userName}</td>
        <td>${userEmail}</td>
        <td>${address}</td>
        <td>${phoneNumber}</td>
        <td>${foodName}</td>
        <td>${quantity}</td>
        <td>${status}</td>
    `;
    tableBody.appendChild(newRow);
};

// Function to fetch users from the database
const fetchUsers = () => {
    return new Promise((resolve, reject) => {
        const usersRef = ref(db, 'users');
        onValue(usersRef, (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
                Object.entries(userData).forEach(([id, userInfo]) => {
                    users[id] = userInfo; // Cache users
                });
                resolve();
            } else {
                reject("No users found.");
            }
        }, (error) => reject(error));
    });
};

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        const adminId = user.uid; // Get the ID of the currently logged-in admin
        const ordersRef = ref(db, 'orders'); // Reference to your 'orders' node in the database
        const loadingIndicator = document.getElementById('loading');
        loadingIndicator.style.display = 'block'; // Show loading indicator

        fetchUsers()
            .then(() => {
                // Fetch orders from the database
                onValue(ordersRef, (snapshot) => {
                    const orders = snapshot.val();
                    loadingIndicator.style.display = 'none'; // Hide loading indicator
                    if (orders) {
                        for (const orderId in orders) {
                            const order = orders[orderId];
                            for (const itemId in order.items) {
                                const item = order.items[itemId];
                                if (item.adminId === adminId) {
                                    const userInfo = users[item.userId];
                                    if (userInfo) {
                                        // Display order information
                                        displayOrders(orderId, userInfo.fullname, userInfo.email, userInfo.address, userInfo.phonenumber, item.foodName, item.quantity, order.status);
                                    }
                                }
                            }
                        }
                    } else {
                        console.log("No orders found.");
                    }
                });
            })
            .catch(error => {
                loadingIndicator.style.display = 'none'; // Hide loading indicator
                console.error("Error fetching users:", error);
            });
    } else {
        // No user is signed in
        console.log("No admin is currently logged in.");
    }
});
