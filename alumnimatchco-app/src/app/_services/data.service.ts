import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { ApiService } from './api.service';

export interface UserInfo {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  messages_count?: number;
  freq_count?: number;
  friends_count?: number;
  events_count?: number;
  visits_count?: number;
  new_visits_count?: number;
  rank?: number;
  coordinate?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private userInfo: UserInfo;

  userStatus: Subject<any> = new Subject();
  nearsChange: Subject<any> = new Subject();
  freqsChange: Subject<any> = new Subject();
  msgRead: Subject<any> = new Subject();

  alumni: any;

  constructor(
    private api: ApiService
  ) { }


  initUserData(u: any) {
    this.userInfo = {
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      avatar: u.avatar,
      messages_count: u.messages_count || 0,
      friends_count: u.friends_count || 0,
      freq_count: u.freq_count || 0,
      events_count: u.events_count || 0,
      visits_count: u.visits_count || 0,
      new_visits_count: u.new_visits_count || 0,
      rank: u.rank,
      coordinate: u.coordinate
    };
    this.userStatus.next(this.userInfo);
  }

  updateMessagesCount(isNew: boolean) {
    if (isNew) {
      this.userInfo.messages_count = (this.userInfo.messages_count || 0) + 1;
    } else if (this.userInfo.messages_count) {
      this.userInfo.messages_count--;
    } else {
      this.userInfo.messages_count = 0;
    }
    this.userStatus.next(this.userInfo);
  }

  markAsReadMessage(msgId) {
    return new Promise((resolve) => {
      this.api.get(`message/read/${msgId}`).subscribe((res) => {
        if (this.userInfo.messages_count) {
          this.userInfo.messages_count--;
        } else {
          this.userInfo.messages_count = 0;
        }
        this.userStatus.next(this.userInfo);
        this.msgRead.next(msgId);
        resolve(true);
      });
    });
  }

  updateMessageNum(count: number) {
    this.userInfo.messages_count = count;
    this.userStatus.next(this.userInfo);
  }

  updateFreqCount(isNew: boolean) {
    if (isNew) {
      this.userInfo.freq_count = (this.userInfo.freq_count || 0) + 1;
    } else if (this.userInfo.freq_count) {
      this.userInfo.freq_count--;
    } else {
      this.userInfo.freq_count = 0;
    }
    this.userStatus.next(this.userInfo);
  }

  updateFriendsCount(isNew: boolean) {
    if (isNew) {
      this.userInfo.friends_count = (this.userInfo.friends_count || 0) + 1;
    } else if (this.userInfo.friends_count) {
      this.userInfo.friends_count--;
    } else {
      this.userInfo.friends_count = 0;
    }
    this.userStatus.next(this.userInfo);
  }

  updateEventsCount(isNew: boolean) {
    if (isNew) {
      this.userInfo.events_count = (this.userInfo.events_count || 0) + 1;
    } else if (this.userInfo.events_count) {
      this.userInfo.events_count--;
    } else {
      this.userInfo.events_count = 0;
    }
    this.userStatus.next(this.userInfo);
  }

  updateUserAvatar(avatar) {
    this.userInfo.avatar = avatar;
    this.userStatus.next(avatar);
  }

  updateUserCoordinate(coordiante) {
    this.userInfo.coordinate = coordiante;
  }

  updateNears(nears) {
    this.nearsChange.next(nears);
  }

  updateFriendRequest(reqs) {
    this.freqsChange.next(reqs);
  }

  getUserCoords() {
    return this.userInfo.coordinate;
  }

  updateUserCoords(coordinate) {
    return this.userInfo.coordinate = coordinate;
  }
}
