import { get, onChildChanged, ref, getDatabase } from "firebase/database";

export default class UserPresenceHandler {
  map: Map<String, (userPresence: any) => void>;
  docRef: string;
  userPresenceData: any;
  unsub: any;

  constructor(docRef: string) {
    this.map = new Map();
    this.docRef = docRef;
    this.userPresenceData = {};
    this.unsub = onChildChanged(
      ref(getDatabase(), `${docRef}/users`),
      (snapshot) => {
        let x = snapshot.key || ""; // "" case shouldn't occur.
        if (snapshot.val() === undefined) this.userPresenceData[x] = undefined;
        else if (this.userPresenceData[x] === undefined) {
          this.userPresenceData[x] = {
            name: x,
            color: snapshot.val().color,
            from: snapshot.val()?.cursor?.from,
            to: snapshot.val()?.cursor?.to,
          };
          get(ref(getDatabase(), `users/${x}/fullname`)).then((snap2) => {
            this.userPresenceData[x].name = snap2.val();
            this.callListener();
          });
        } else {
          // TODO: User Presence Data fullname never re-grabbed, probably not an issue.
          this.userPresenceData[x].color = snapshot.val().color;
          this.userPresenceData[x].from = snapshot.val()?.cursor?.from;
          this.userPresenceData[x].to = snapshot.val()?.cursor?.to;
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
