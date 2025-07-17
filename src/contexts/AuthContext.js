import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { app, db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, deleteDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const auth = getAuth(app);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribeAuth;
    }, [auth]);

    useEffect(() => {
        let unsubscribeFriends = () => {};
        let unsubscribeRequests = () => {};

        if (currentUser) {
            // フレンドリストのリアルタイム監視
            const friendsRef = collection(db, "users", currentUser.uid, "friends");
            unsubscribeFriends = onSnapshot(friendsRef, (snapshot) => {
                const friendsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setFriends(friendsList);
            });

            // 受信したフレンド申請のリアルタイム監視
            const requestsRef = collection(db, "users", currentUser.uid, "friendRequests");
            unsubscribeRequests = onSnapshot(requestsRef, (snapshot) => {
                const requestsList = snapshot.docs
                    .filter(doc => doc.data().status === 'received')
                    .map(doc => ({ id: doc.id, ...doc.data() }));
                setFriendRequests(requestsList);
            });
        } else {
            setFriends([]);
            setFriendRequests([]);
        }

        return () => {
            unsubscribeFriends();
            unsubscribeRequests();
        };
    }, [currentUser]);

    async function signup(email, password) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: userCredential.user.email,
            uid: userCredential.user.uid,
        });
        return userCredential;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }
    
    const acceptFriendRequest = async (targetUserId, fromEmail) => {
        if (!currentUser) return;
        await setDoc(doc(db, "users", currentUser.uid, "friends", targetUserId), { email: fromEmail });
        await setDoc(doc(db, "users", targetUserId, "friends", currentUser.uid), { email: currentUser.email });
        
        await deleteDoc(doc(db, "users", currentUser.uid, "friendRequests", targetUserId));
        await deleteDoc(doc(db, "users", targetUserId, "friendRequests", currentUser.uid));
    };
    
    const declineFriendRequest = async (targetUserId) => {
         if (!currentUser) return;
        await deleteDoc(doc(db, "users", currentUser.uid, "friendRequests", targetUserId));
        await deleteDoc(doc(db, "users", targetUserId, "friendRequests", currentUser.uid));
    };

    const value = {
        currentUser,
        friends,
        friendRequests,
        signup,
        login,
        logout,
        acceptFriendRequest,
        declineFriendRequest,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};