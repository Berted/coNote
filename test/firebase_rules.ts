import assert, { doesNotMatch } from "assert";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { initializeApp, setLogLevel } from "@firebase/app";
import { get, set, ref, serverTimestamp } from "@firebase/database";
import fs from "fs";
import path from "path";

// TODO: Use env variables to avoid rewrites between src/config/firebaseConfig.ts and test/firebase_rules.js
const FIREBASE_PROJECT_ID = "conote-59b80";
const myID = "Alice";
const theirID = "Bob";
const myToken = { email: "alice@example.com" };
const theirToken = { email: "bob@example.com" };
const myDoc = "alice_doc";
const theirDoc = "bob_doc";
let testEnv: RulesTestEnvironment;
let unauthContext: RulesTestContext;
let myContext: RulesTestContext;
let theirContext: RulesTestContext;

function getAuth(testEnv: RulesTestEnvironment, uid: string, token: any) {
  return testEnv.authenticatedContext(uid, token);
}

function getUnauth(testEnv: RulesTestEnvironment) {
  return testEnv.unauthenticatedContext();
}

function processEmail(email: string) {
  return email.replace(/\./g, ",");
}

function getUserData(
  fullname?: string,
  img_url?: string,
  owned_documents?: any,
  shared_documents?: any
) {
  return {
    fullname: fullname || "",
    img_url: img_url || "",
    owned_documents: owned_documents || {},
    shared_documents: shared_documents || {},
  };
}

/**
 * tryOthers: Receives a lambda function f that receives a RulesTextContext and returns
 * a Promise. tryOthers will then attempt f with both an unauthenticated context, and
 * an authenticated context representing "another user".
 */
function tryOthers(f: (context: RulesTestContext) => Promise<any>) {
  return Promise.all([f(unauthContext), f(theirContext)]);
}

describe("Firebase Rules", function () {
  before("Initializing test environment", async () => {
    testEnv = await initializeTestEnvironment({
      projectId: FIREBASE_PROJECT_ID,
      database: {
        host: "localhost",
        port: 9000,
        rules: fs.readFileSync(
          path.resolve(__dirname, "../firebase/database.rules.json"),
          "utf8"
        ),
      },
    });
    // To avoid Firebase warning showing up during failed sets.
    setLogLevel("error");
  });

  beforeEach("Preparing for next test", async () => {
    await testEnv.clearDatabase();
    unauthContext = getUnauth(testEnv);
    myContext = getAuth(testEnv, myID, myToken);
    theirContext = getAuth(testEnv, theirID, theirToken);

    await testEnv.withSecurityRulesDisabled((ctxt) => {
      let db = ctxt.database();
      let setMyUser = set(ref(db, `users/${myID}`), {
        fullname: myID,
        img_url: "",
        owned_documents: {},
        shared_documents: {},
      });
      let setTheirUser = set(ref(db, `users/${theirID}`), {
        fullname: theirID,
        img_url: "",
        owned_documents: {},
        shared_documents: {},
      });

      // If e-mail specifications ever changes, this would be pretty bad. PLZ FIX if needed.
      let setMyUserEmail = set(
        ref(db, `email_to_uid/${processEmail(myToken.email)}`),
        myID
      );
      let setTheirUserEmail = set(
        ref(db, `email_to_uid/${processEmail(theirToken.email)}`),
        theirID
      );

      let setMyDoc = set(ref(db, `docs/${myDoc}`), {
        title: `${myID}'s Document`,
        timestamp: 0,
        roles: {
          [myID]: "owner",
        },
        public: false,
      });

      let setTheirDoc = set(ref(db, `docs/${theirDoc}`), {
        title: `${theirID}'s Document`,
        timestamp: 0,
        roles: {
          [myID]: "owner",
        },
        public: false,
      });

      return Promise.all([
        setMyUser,
        setTheirUser,
        setMyUserEmail,
        setTheirUserEmail,
        setMyDoc,
        setTheirDoc,
      ]).then(() => {}); // Done to turn Promise<[void, void...]> to Promise<void>
    });
  });

  after("Cleaning up test environment", async () => {
    testEnv.cleanup();
  });

  describe("/users", function () {
    it("Unable to access /users", async () => {
      await assertFails(
        tryOthers((ctxt) => get(ref(ctxt.database(), `users/`)))
      );
    });
    describe("/users/<userID>", async () => {
      it("Able to read oneself's user data", async () => {
        await assertSucceeds(get(ref(myContext.database(), `users/${myID}`)));
      });
      // TODO: Should we tighten this rule?
      it("Able to set oneself's user data", async () => {
        await assertSucceeds(
          set(ref(myContext.database(), `users/${myID}`), getUserData(myID))
        );
      });
      it("Unable to read other's user data", async () => {
        await assertFails(
          tryOthers((ctxt) => get(ref(ctxt.database(), `users/${myID}`)))
        );
      });
      describe("/users/<userID>/fullname", async () => {
        it("Able to read other's full name", async () => {
          await assertSucceeds(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/fullname`))
            )
          );
        });
        it("Unable to set other's username", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              set(ref(ctxt.database(), `users/${myID}/fullname`), myID)
            )
          );
        });
      });
      describe("/users/<userID>/img_url", async () => {
        it("Able to read other's image URL", async () => {
          await assertSucceeds(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/img_url`))
            )
          );
        });
        it("Unable to set other's image URL", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              set(ref(ctxt.database(), `users/${myID}/img_url`), "")
            )
          );
        });
      });
      describe("/users/<userID>/owned_documents", async () => {
        it("Unable to read other's owned documents", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/owned_documents`))
            )
          );
        });
      });
      describe("/users/<userID>/shared_documents", async () => {
        it("Unable to read other's shared documents", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/shared_documents`))
            )
          );
        });
        it("Unable to set other's shared documents", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              set(ref(ctxt.database(), `users/${myID}/shared_documents`), {})
            )
          );
        });
        describe("/users/<userID>/shared_documents/<docID>", async () => {
          // TODO: This might be an avenue for abuse. Perhaps a better solution should be implemented.
          it("Able to share document with others if belongs to the correct user", async () => {
            await assertSucceeds(
              set(
                ref(
                  myContext.database(),
                  `users/${theirID}/shared_documents/${myDoc}`
                ),
                true
              )
            );
          });

          it("Unable to share document with others if doesn't belong to the correct user", async () => {
            await assertFails(
              tryOthers((ctxt) =>
                set(
                  ref(
                    ctxt.database(),
                    `users/${myID}/shared_documents/${myDoc}`
                  ),
                  true
                )
              )
            );
          });

          it("Unable to share non-existent document", async () => {
            await assertFails(
              tryOthers((ctxt) =>
                set(
                  ref(
                    ctxt.database(),
                    `users/${myID}/shared_documents/dQw4w9WgXcQ`
                  ),
                  true
                )
              )
            );
          });
        });
      });
    });
  });

  describe("/email_to_uid", async () => {
    it("Unable to get /email_to_uid", async () => {
      await assertFails(
        tryOthers((ctxt) => get(ref(ctxt.database(), `email_to_uid`)))
      );
    });
    describe("/email_to_uid/<email>", async () => {
      it("Able to get other's ID by e-mail", async () => {
        await assertSucceeds(
          tryOthers((ctxt) =>
            get(
              ref(
                ctxt.database(),
                `email_to_uid/${processEmail(myToken.email)}`
              )
            )
          )
        );
      });
      it("Able to set one's own e-mail with their own UID", async () => {
        await assertSucceeds(
          set(
            ref(
              myContext.database(),
              `email_to_uid/${processEmail(myToken.email)}`
            ),
            myID
          )
        );
      });
      it("Unable to set one's own e-mail with another's UID", async () => {
        await assertFails(
          set(
            ref(
              theirContext.database(),
              `email_to_uid/${processEmail(theirToken.email)}`
            ),
            myID
          )
        );
      });
      it("Unable to set another's e-mail", async () => {
        await assertFails(
          set(
            ref(
              theirContext.database(),
              `email_to_uid/${processEmail(myToken.email)}`
            ),
            theirID
          )
        );
      });
    });
  });
});
