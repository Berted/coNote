import { get, onValue, ref, getDatabase } from "firebase/database";

export default class UserPresenceHandler {
  map: Map<String, (userPresence: any) => void>;
  docRef: string;
  userPresenceData: any;
  unsub: any;

  constructor(docRef: string) {
    this.map = new Map();
    this.docRef = docRef;
    this.userPresenceData = {};
    this.unsub = onValue(
      ref(getDatabase(), `${docRef}/users`),
      (snapshot) => {
        for (let x in snapshot.val()) {
          if (this.userPresenceData[x] === undefined) {
            this.userPresenceData[x] = {
              name: x,
              color: snapshot.val()[x].color,
              from: snapshot.val()[x]?.cursor?.from,
              to: snapshot.val()[x]?.cursor?.to,
            };
            get(ref(getDatabase(), `users/${x}/fullname`)).then((snap2) => {
              this.userPresenceData[x].name = snap2.val();
              this.callListener();
            });
          } else {
            this.userPresenceData[x].color = snapshot.val()[x].color;
            this.userPresenceData[x].from = snapshot.val()[x]?.cursor?.from;
            this.userPresenceData[x].to = snapshot.val()[x]?.cursor?.to;
          }
        }
        for (let x in this.userPresenceData) {
          if (snapshot.val()[x] === undefined)
            this.userPresenceData[x] = undefined;
        }
        this.callListener();
      },
      // TODO: Toast messsage.
      (e) => {
        console.log("Unable to construct user presence handler: " + e);
      }
    );
  }

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

  registerListener = (key: string, callback: (userPresence: any) => void) => {
    this.map.set(key, callback);
    if (this.userPresenceData) callback(this.userPresenceData);
  };

  deregister = () => {
    this.unsub();
    this.map.clear();
  };
}
