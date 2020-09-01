import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { auth, User } from 'firebase/app';
import { UserProfile } from '../types/types';
import { filter, map, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { COLLECTION_PATHS } from '../constants/collectionPaths';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  firebaseUser$ = new BehaviorSubject<null | User>(null);
  userProfile$ = new BehaviorSubject<null | UserProfile>(null);
  authorizedUserOnly$ = this.userProfile$.pipe(
    map(v => !!v),
  );

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
  ) {
    this.auth.authState.pipe(map(user => user || null)).subscribe(this.firebaseUser$);
    this.firebaseUser$
      .pipe(
        filter(v => !!v),
        switchMap((user: User) =>
          this.firestore
            .doc<UserProfile>(`${COLLECTION_PATHS.userProfiles}/${user.uid}`)
            .valueChanges()
            .pipe(
              map(up => {
                if (!up) {
                  return null;
                }
                up.id = user.uid;
                return up;
              }),
            ),
        ),
      )
      .subscribe(this.userProfile$);
  }

  async signUp(): Promise<void> {
    let wasSignInSuccessful = false;
    try {
      await this.auth.signInWithPopup(new auth.GoogleAuthProvider());
      wasSignInSuccessful = true;
    } catch (error) {
      console.error('Something went wrong during sign up');
    }
    if (!wasSignInSuccessful) {
      return;
    }
    try {
      const user = auth().currentUser;
      const displayName = this.getUserData(user, 'displayName');
      const photoURL = this.getUserData(user, 'photoURL');
      const userProfilePath = `${COLLECTION_PATHS.userProfiles}/${user.uid}`;
      const userProfile: UserProfile = {
        createdAt: Date.now(),
        displayName,
        photoURL,
      };
      await this.firestore.firestore.runTransaction(async transaction => {
        const documentRef = this.firestore.doc(userProfilePath).ref;
        const userProfileDocSnap = await transaction.get(documentRef);
        if (userProfileDocSnap.exists) {
          return;
        }
        await transaction.set(documentRef, userProfile);
      });
    } catch (error) {
      const message = 'Failed to create user in DB';
      console.error(message, error);
    }
  }

  private getUserData(user: User, fieldName: string): null | string {
    let data = user[fieldName];
    if (!data) {
      const pd = user.providerData.find(pd => !!pd && !!pd[fieldName]);
      data = pd ? pd[fieldName] : null;
    }
    return data;
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    location.reload();
  }

}
