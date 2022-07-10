import { get, onValue, ref, getDatabase } from "firebase/database";

export default class userPresenceHandler {
  map: Map<String, (userPresence: any) => {}>;
  docID: string;
  userPresenceData: any;
  unsub: any;

  constructor(docID: string) {
    this.map = new Map();
    this.docID = docID;
    this.unsub = onValue(
      ref(getDatabase(), `docs/${docID}/users`),
      (snapshot) => {
        for (let x in snapshot.val()) {
          if (this.userPresenceData[x] === undefined) {
            this.userPresenceData[x] = {
              name: x,
              color: snapshot.val()[x].color,
              from: snapshot.val()[x].from,
              to: snapshot.val()[x].to,
            };
            get(ref(getDatabase(), `users/${x}/fullname`)).then((snap2) => {
              this.userPresenceData[x].name = snap2.val();
              this.callListener();
            });
          } else {
            this.userPresenceData[x].color = snapshot.val()[x].color;
            this.userPresenceData[x].from = snapshot.val()[x].from;
            this.userPresenceData[x].to = snapshot.val()[x].to;
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

  callListener(listenerKey?: string) {
    if (listenerKey) {
      if (this.map.get(listenerKey)) {
        this.map.get(listenerKey)?.(this.userPresenceData);
      }
    } else {
      for (const key in this.map) {
        this.map.get(key)?.(this.userPresenceData);
      }
    }
  }

  registerListener(key: string, callback: (userPresence: any) => {}) {
    this.map.set(key, callback);
    callback(this.userPresenceData);
  }

  deregister() {
    this.unsub();
    this.map.clear();
  }
}
