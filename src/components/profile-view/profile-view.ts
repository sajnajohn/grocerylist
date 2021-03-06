import { Component, OnInit } from '@angular/core';
import { AuthServiceProvider } from '../../providers/auth-service/auth-service';
import { DataServiceProvider } from '../../providers/data-service/data-service';
import { User } from 'firebase/app';
import { Profile } from '../../models/profile/profile';
import { Subscription } from 'rxjs/Subscription';
import { FirebaseListObservable, AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
/**
 * Generated class for the ProfileViewComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'app-profile-view',
  templateUrl: 'profile-view.html'
})
export class ProfileViewComponent implements OnInit{
  userProfile: Profile;
  private authenticatedUser : User;
  private inviteListRef$ : FirebaseListObservable<Notification[]>
  private userBuddyListObj: FirebaseObjectObservable<Profile>;
  private buddyBuddyListObj: FirebaseObjectObservable<Profile>;

  buddyListPending: Array<any>;
  buddyListCompleted: Array<any>;

  constructor(private data: DataServiceProvider, private auth: AuthServiceProvider,
    private db : AngularFireDatabase) {
    console.log('Hello ProfileViewComponent Component');

  }

  ngOnInit(): void {
    this.auth.getAuthenticatedUser().subscribe((user: User) => {
      this.authenticatedUser = user;
      //this.buddyList = [];
      this.inviteListRef$ = this.db.list(`/grocerybuddylist/${user.uid}`);
      this.inviteListRef$.subscribe( inviteList  => {
        console.log(inviteList);
        inviteList.forEach((invite) => {
          let profileData = this.db.object(`/profiles/${invite['$key']}`);
          //this.buddyList = [];
          this.buddyListPending  = [];
          this.buddyListCompleted  = [];
          profileData.subscribe((buddyProfile) => {
            if(invite['status'] == 'pending') {
              console.log(this.buddyListPending)
              this.buddyListPending.push({
                buddy: buddyProfile,
                status: invite['status']
              });
            }
            else if(invite['status'] == 'completed') {
              console.log(this.buddyListCompleted)
              this.buddyListCompleted.push({
                buddy: buddyProfile,
                status: invite['status']
              });
            }
          });

        });
        //console.log(this.buddyList);
      });
      this.data.getProfile(user).subscribe(profile => {
        this.userProfile = <Profile>profile.val();
      });
    })
  }

 

  // signout(){
  //   this.auth.signOut();
  // }

}
