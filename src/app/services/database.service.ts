import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { COLLECTION_PATHS } from '../constants/collectionPaths';
import { UserService } from './user.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {

  constructor(private firestore: AngularFirestore, private userService: UserService) { }

  async saveUserDoc(text) {
    try {
      const userProfile = this.userService.userProfile$.value;
      if (!userProfile) {
        throw new Error('User does not exist')
      }
      await this.firestore.doc(`${COLLECTION_PATHS.texts}/${userProfile.id}`).set({
        userId: userProfile.id,
        text,
      })
    } catch (error) {
      console.error(error);
    }

  }

  getUserText() {
    return this.userService.userProfile$.pipe(
      switchMap(profile => this.firestore.doc(`${COLLECTION_PATHS.texts}/${profile.id}`).get()),
      map(doc => doc.exists && doc.data().text || null)
    );
  }

}

