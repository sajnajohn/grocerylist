import { Component, OnDestroy } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';

import { User } from 'firebase/app';

import { Profile } from '../../models/profile/profile';
import { Notification } from '../../models/notification/notification.interface';

/**
 * Generated class for the AddBuddyPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-buddy',
  templateUrl: 'add-buddy.html',
})
export class AddBuddyPage  {

  private authenticatedUser : User;
  private authenticatedUser$ : Subscription;
  private buddyStatus : string;
  private message : string;

  buddy1 = {} as Profile;
  currentBuddyRef$: FirebaseListObservable<Profile[]>;
  userNotificationRef$: FirebaseListObservable<Notification[]>;
  buddyList = [] as Profile[];
  notificationList = [] as Notification[];
  userNotificationObj: FirebaseObjectObservable<Notification>;
  userProfile: Profile;
  private user: any;
  private buddy: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, 
  	private toastCtrl: ToastController, private data: DataServiceProvider, 
  	private auth: AuthServiceProvider,
  	private db: AngularFireDatabase) {
      this.authenticatedUser$ = this.auth.getAuthenticatedUser().subscribe((user: User) => {
        this.authenticatedUser = user;
        this.data.getProfile(user).subscribe(profile => {
          this.userProfile = <Profile>profile.val();
        });
      });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddBuddyPage');
    this.buddyStatus = this.navParams.get('buddyStatus');
    console.log(this.authenticatedUser);
    this.checkBuddyStatus();
  }

  checkBuddyStatus(){
    if(this.buddyStatus == "userProfile"){
      this.message = 'Buddy added';
    }else{
      this.message = 'Welcome In!';
    }
  }

  sendNotification(){
    
    
        this.userNotificationObj = this.db.object(`/grocerybuddylist/${this.buddy1['$key']}`);
        this.userNotificationObj.$ref.child(this.authenticatedUser.uid).set({
          status: 'pending'
        });

        this.navCtrl.setRoot('TabsHomePage');
        this.presentToast(this.message);
      }
    
      saveBuddyList(){
        
        if(this.authenticatedUser.email == this.buddy1.email){
          this.presentToast("Same as registered email");
        }else{
        //check if the array contains already added buddy or notification so that only new notification is pushed to buddy's grocerybuddyist
        this.currentBuddyRef$ = this.db.list(`/grocerybuddylist/${this.authenticatedUser.uid}`);
        this.currentBuddyRef$.subscribe( buddyList  => this.buddyList = buddyList );
        var usersRef = this.db.list(`/profiles`, {
            query: {
                orderByChild: 'email',
                equalTo: this.buddy1.email , // How to check if participants contain username
            }
        });
        
        usersRef.subscribe(profileList => {
          console.log(profileList);
          if(profileList.length > 0){//check if registered user
            this.buddy1 = profileList[0];
            
            if(this.buddy1.email){
              this.user = this.buddy1
              if(this.buddyList && this.buddyList.length > 0){
                this.buddy = this.buddyList
                
                let currentBuddyList = this.buddy.filter(buddy  => {
                  if (buddy.$key == this.user.$key){
                    return buddy;
                  }
                });
                
                if(currentBuddyList.length > 0){
                  this.presentToast("Buddy already exists");
                  // this.toast.create({
                  //   message: `Buddy already exists`,
                  //   duration: 3000
                  // }).present();
                }
                else{
                  this.sendNotification();
                }
              }
              else{
                this.sendNotification();
              }
            }
            // else{
            //   this.toast.create({
            //     message: `No grocery buddy added!`,
            //     duration: 3000
            //   }).present();
            // }
    
          }
          else{
            //send mail to user 
            this.presentToast("User doesn't exist. Please send invite");
            this.navCtrl.setRoot('TabsHomePage');
          }
          
        });
    
    
        
        // this.toast.create({
        //   message: `Welcome In!`,
        //   duration: 3000
        // }).present();
      }
        
      }
    
      ngOnDestroy(): void {
        this.authenticatedUser$.unsubscribe();
      }

      // Configure Toast
   public presentToast(text) {
    let toast = this.toastCtrl.create({
      message: text,
      duration: 3000
      // position: 'top'
    });
    toast.present();
  }

  

}
