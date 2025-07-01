import {auth} from "./firebase"
 import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth"

 export async function signInWithGoogle () {
try{    
    

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', result.user);
    return result.user;
} catch(error:any){
    console.error('google sign-in error:',error);
    if( error.code === 'auth/popup-closed-by-user'){
        throw new Error('Sign-in was cancelled');
    } else if (error.code === 'auth/popup-blocked'){
        throw new Error('Popup was blocked by browser')
    } 
    throw new Error(
        'Failed to sign in with Google'
    )

}}

export async function signOutUser(): Promise<void> {
    try{
        await signOut(auth);
        console.log('User signed out successfully');
    } catch (error){
        console.error('sign out error:', error);
        throw new Error ('failed to sign out');
    }
}

export function getCurrentUser(): User | null {
    return auth.currentUser;
}