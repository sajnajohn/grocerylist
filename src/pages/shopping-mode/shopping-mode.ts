import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';

import { AddShoppingPage } from "../add-shopping/add-shopping";
import { ShoppingItemListPage } from "../shopping-item-list/shopping-item-list";
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { User } from 'firebase/app';
import { Subscription } from 'rxjs/Subscription';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { Store } from '../../models/store/store';

@IonicPage()
@Component({
  selector: 'page-shopping-mode',
  templateUrl: 'shopping-mode.html',
})
export class ShoppingModePage {  
  
    nextTripRef$: FirebaseListObservable<Store[]>;
  
    private authenticatedUser: User;
    private authenticatedUser$: Subscription;
    private loading;
    isNotEmpty:boolean = false;
    
      constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase,
        private actionSheetCntrl: ActionSheetController, private auth: AuthServiceProvider,
        public loadingCtrl: LoadingController) {
    
        this.loading = this.loadingCtrl.create({
          content: 'Please wait...'
        });
        this.loading.present();
    
        try {
          console.log("Came to nexttrip oninnit");
          this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
            this.authenticatedUser = user;
            this.initFirebase();
            console.log(`nexttrip got user1 ${this.authenticatedUser.uid}`);
          })
        } catch (e) {
          // console.error(e);
        }
      }
    
      initFirebase() {
        let self = this;
        this.nextTripRef$ = this.db.list(`/nexttrip/${this.authenticatedUser.uid}`);
        this.nextTripRef$.$ref.once("value", function (snapshot) {
          if(snapshot.numChildren() > 0){
            self.isNotEmpty = true;
          }
          self.loading.dismiss();
        });
      }
    
      navigateToShoppingItemList(store: string) {
        console.log(`came to navigateToShoppingListForStore in MyNextTripPage, store is ${store}`);
        this.navCtrl.push('ShoppingItemListPage', { storeName: store, userid: this.authenticatedUser.uid });
      }
      
      splitStore(storeValue,type){
        let store = storeValue.split(" - ");
        if(type == 0){
          return store[0];
        }else{
          return store[1];
        }
      }
    }
    