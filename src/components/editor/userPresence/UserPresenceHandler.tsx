import {
  get,
  onChildChanged,
  ref,
  getDatabase,
  Unsubscribe,
  onChildRemoved,
} from "firebase/database";

export default class UserPresenceHandler {
  map: Map<String, (userPresence: any) => void>;
  onAddMap: Map<String, (userPresence: any) => void>;
  onRemMap: Map<String, (userPresence: any) => void>;
  docRef: string;
  userPresenceData: any;
  unsub: Unsubscribe[];
  deregistered: boolean;

  constructor(docRef: string) {
    this.map = new Map();
    this.onAddMap = new Map();
    this.onRemMap = new Map();
    this.docRef = docRef;
    this.userPresenceData = {};
    this.deregistered = false;
    this.unsub = [];
    get(ref(getDatabase(), `${docRef}/users`))
      .then((snapshot) => {
        for (let x in snapshot.val()) {
          this.handleUserData({ uid: x || "", ...snapshot.val()[x] });
        }
      })
      .then(() => {
        this.unsub.push(
          onChildChanged(
            ref(getDatabase(), `${docRef}/users`),
            (snapshot) => {
              this.handleUserData({
                uid: snapshot.key || "",
                ...snapshot.val(),
              });
            },
            // TODO: Toast messsage.
            (e) => {
              console.log(
                "Unable to construct user presence handler (onChildChanged): " +
                  e
              );
            }
          )
        );
        this.unsub.push(
          onChildRemoved(
            ref(getDatabase(), `${docRef}/users`),
            (snapshot) => {
              this.handleUserData({ uid: snapshot.key || "" });
            },
            // TODO: Toast messsage.
            (e) => {
              console.log(
                "Unable to construct user presence handler (onChildRemoved): " +
                  e
              );
            }
          )
        );
      });
  }

  handleUserData = (userData: any) => {
    let x = userData.uid;
    if (userData.color === undefined) {
      this.callOnRemListener({ uid: x, ...this.userPresenceData[x] });
      delete this.userPresenceData[x];
    } else if (this.userPresenceData[x] === undefined) {
      this.userPresenceData[x] = {
        name: x,
        color: userData.color,
        from: userData?.cursor?.from,
        to: userData?.cursor?.to,
      };
      this.callOnAddListener({ uid: x, ...this.userPresenceData[x] });
      get(ref(getDatabase(), `users/${x}/fullname`)).then((snap2) => {
        this.callOnRemListener({ uid: x, ...this.userPresenceData[x] });
        this.userPresenceData[x].name = snap2.val();
        this.callOnAddListener({ uid: x, ...this.userPresenceData[x] });
        this.callListener();
      });
    } else {
      // TODO: User Presence Data fullname never re-grabbed, probably not an issue.
      this.callOnRemListener({ uid: x, ...this.userPresenceData[x] });
      this.userPresenceData[x].color = userData.color;
      this.userPresenceData[x].from = userData?.cursor?.from;
      this.userPresenceData[x].to = userData?.cursor?.to;
      this.callOnAddListener({ uid: x, ...this.userPresenceData[x] });
    }
    this.callListener();
  };

  callListener = (listenerKey?: string) => {
    if (listenerKey) {
      if (this.map.get(listenerKey)) {
        this.map.get(listenerKey)?.(this.userPresenceData);
      }
    } else {
      for (const [key, val] of this.map) {
        val(this.userPresenceData);
      }
    }
  };

  callOnAddListener = (userData: any, listenerKey?: string) => {
    for (const [key, val] of this.onAddMap) {
      val(userData);
    }
  };

  callOnRemListener = (userData: any) => {
    for (const [key, val] of this.onRemMap) {
      val(userData);
    }
  };

  registerListener = (key: string, callback: (userPresence: any) => void) => {
    this.map.set(key, callback);
    if (this.userPresenceData) callback(this.userPresenceData);
  };

  registerOnAddListener = (key: string, callback: (userData: any) => void) => {
    this.onAddMap.set(key, callback);
    if (this.userPresenceData) {
      for (let x in this.userPresenceData)
        callback({ uid: x, ...this.userPresenceData[x] });
    }
  };

  registerOnRemListener = (key: string, callback: (userData: any) => void) => {
    this.onRemMap.set(key, callback);
  };

  deregister = () => {
    if (this.deregistered)
      console.log("Deregistered twice... Should not happen");
    this.deregistered = true;
    for (let x of this.unsub) x();
    this.map.clear();
    this.onAddMap.clear();
    this.onRemMap.clear();
  };
}
