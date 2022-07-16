import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestContext,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setLogLevel } from "@firebase/app";
import { get, set, push, ref, serverTimestamp } from "@firebase/database";
import fs from "fs";
import path from "path";

// TODO: Use env variables to avoid rewrites between src/config/firebaseConfig.ts and test/firebase_rules.js
const FIREBASE_PROJECT_ID = "conote-59b80";
const myID = "alice";
const theirID = "bob";
const editorID = "alice_editor";
const viewerID = "alice_viewer";
const myToken = { email: "alice@example.com" };
const theirToken = { email: "bob@example.com" };
const editorToken = { email: "alice_editor@example.com" };
const viewerToken = { email: "alice_viewer@example.com" };
const myDoc = "alice_doc";
const theirDoc = "bob_doc";
let testEnv: RulesTestEnvironment;
let unauthContext: RulesTestContext;
let myContext: RulesTestContext;
let theirContext: RulesTestContext;
let editorContext: RulesTestContext;
let viewerContext: RulesTestContext;

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
 * allRejected: A function that takes in an array of Promise-s and returns
 * a fulfilled Promise if at least one of the promises is fulfilled. Otherwise,
 * returns rejected.
 */
function allRejected(promises: Promise<any>[]) {
  return Promise.allSettled(promises).then((arr) => {
    return arr.filter((x) => x.status === "fulfilled").length > 0
      ? Promise.resolve()
      : Promise.reject(arr[0].status === "rejected" && arr[0].reason);
  });
}

/**
 * addUserToDoc: Receives a document id, uid, and role. and sets the uid's role in that
 * document. Returns a Promise that resolves once the data is set.
 * addUserToDoc runs with security rules disabled context.
 */
function addUserToDoc(doc: string, uid: string, role: string) {
  return testEnv.withSecurityRulesDisabled((ctxt) => {
    let db = ctxt.database();
    let setDocRole = set(ref(db, `docs/${doc}/roles/${uid}`), role);
    let setSharedDoc = set(
      ref(db, `users/${uid}/shared_documents/${doc}`),
      true
    );
    return Promise.all([setDocRole, setSharedDoc]).then(() => {});
  });
}

/**
 * tryOthers: Receives a lambda function f that receives a RulesTextContext and returns
 * a Promise. tryOthers will then attempt f with both an unauthenticated context, and
 * an authenticated context representing "another user".
 */
function tryOthers(f: (context: RulesTestContext) => Promise<any>) {
  return Promise.all([f(unauthContext), f(theirContext)]);
}

/**
 * tryOthersRejected: Similar to tryOthers. However, returns a rejected promise if and only if
 * both f(unauthenticatedContext) and f(theirContext) fails.
 */
function tryOthersRejected(f: (context: RulesTestContext) => Promise<any>) {
  return allRejected([f(unauthContext), f(theirContext)]);
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
    editorContext = getAuth(testEnv, editorID, editorToken);
    viewerContext = getAuth(testEnv, viewerID, viewerToken);

    await testEnv.withSecurityRulesDisabled((ctxt) => {
      let db = ctxt.database();
      let setMyUser = set(ref(db, `users/${myID}`), {
        fullname: myID,
        img_url: "",
        owned_documents: {
          [myDoc]: true,
        },
        shared_documents: {},
      });
      let setTheirUser = set(ref(db, `users/${theirID}`), {
        fullname: theirID,
        img_url: "",
        owned_documents: {
          [theirDoc]: true,
        },
        shared_documents: {},
      });
      let setEditorUser = set(ref(db, `users/${editorID}`), {
        fullname: editorID,
        img_url: "",
        owned_documents: {},
        shared_documents: {
          [myDoc]: true,
        },
      });
      let setViewerUser = set(ref(db, `users/${viewerID}`), {
        fullname: viewerID,
        img_url: "",
        owned_documents: {},
        shared_documents: {
          [myDoc]: true,
        },
      });

      // If e-mail specifications ever changes, this would be pretty bad. PLZ FIX if needed.
      let setMyEmail = set(
        ref(db, `email_to_uid/${processEmail(myToken.email)}`),
        myID
      );
      let setTheirEmail = set(
        ref(db, `email_to_uid/${processEmail(theirToken.email)}`),
        theirID
      );
      let setEditorEmail = set(
        ref(db, `email_to_uid/${processEmail(editorToken.email)}`),
        theirID
      );
      let setViewerEmail = set(
        ref(db, `email_to_uid/${processEmail(viewerToken.email)}`),
        theirID
      );

      let setMyDoc = set(ref(db, `docs/${myDoc}`), {
        title: `${myID}'s Document`,
        timestamp: 0,
        roles: {
          [myID]: "owner",
          [editorID]: "editor",
          [viewerID]: "viewer",
        },
        public: false,
      });

      let setTheirDoc = set(ref(db, `docs/${theirDoc}`), {
        title: `${theirID}'s Document`,
        timestamp: 0,
        roles: {
          [theirID]: "owner",
        },
        public: false,
      });

      return Promise.all([
        setMyUser,
        setTheirUser,
        setEditorUser,
        setViewerUser,
        setMyEmail,
        setTheirEmail,
        setEditorEmail,
        setViewerEmail,
        setMyDoc,
        setTheirDoc,
      ]).then(() => {}); // Done to turn Promise<[void, void...]> to Promise<void>
    });
  });

  after("Cleaning up test environment", async () => {
    testEnv.cleanup();
  });

  describe("/users", function () {
    it("Can't access /users", async () => {
      await assertFails(
        tryOthers((ctxt) => get(ref(ctxt.database(), `users/`)))
      );
    });
    describe("/users/<userID>", async () => {
      it("Can read oneself's user data", async () => {
        await assertSucceeds(get(ref(myContext.database(), `users/${myID}`)));
      });
      // TODO: Should we tighten this rule?
      it("Can set oneself's user data", async () => {
        await assertSucceeds(
          set(ref(myContext.database(), `users/${myID}`), getUserData(myID))
        );
      });
      it("Can't read other's user data", async () => {
        await assertFails(
          tryOthers((ctxt) => get(ref(ctxt.database(), `users/${myID}`)))
        );
      });
      describe("/users/<userID>/fullname", async () => {
        it("Can read other's full name", async () => {
          await assertSucceeds(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/fullname`))
            )
          );
        });
        it("Can't set other's username", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              set(ref(ctxt.database(), `users/${myID}/fullname`), myID)
            )
          );
        });
      });
      describe("/users/<userID>/img_url", async () => {
        it("Can read other's image URL", async () => {
          await assertSucceeds(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/img_url`))
            )
          );
        });
        it("Can't set other's image URL", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              set(ref(ctxt.database(), `users/${myID}/img_url`), "")
            )
          );
        });
      });
      describe("/users/<userID>/owned_documents", async () => {
        it("Can't read other's owned documents", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/owned_documents`))
            )
          );
        });
      });
      describe("/users/<userID>/shared_documents", async () => {
        it("Can't read other's shared documents", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              get(ref(ctxt.database(), `users/${myID}/shared_documents`))
            )
          );
        });
        it("Can't set other's shared documents", async () => {
          await assertFails(
            tryOthers((ctxt) =>
              set(ref(ctxt.database(), `users/${myID}/shared_documents`), {})
            )
          );
        });
        describe("/users/<userID>/shared_documents/<docID>", async () => {
          // TODO: This might be an avenue for abuse. Perhaps a better solution should be implemented.
          it("Can share document with others if owned by the correct user", async () => {
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

          it("Can't share document with others if doesn't belong to the correct user", async () => {
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

          it("Can't share document with others as a viewer", async () => {
            await assertFails(
              set(
                ref(
                  viewerContext.database(),
                  `users/${myID}/shared_documents/${myDoc}`
                ),
                true
              )
            );
          });

          it("Can't share document with others as an editor", async () => {
            await assertFails(
              set(
                ref(
                  editorContext.database(),
                  `users/${myID}/shared_documents/${myDoc}`
                ),
                true
              )
            );
          });

          it("Can't share non-existent document", async () => {
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
    it("Can't access /email_to_uid", async () => {
      await assertFails(
        tryOthers((ctxt) => get(ref(ctxt.database(), `email_to_uid`)))
      );
    });
    describe("/email_to_uid/<email>", async () => {
      it("Can get other's ID by e-mail", async () => {
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
      it("Can set one's own e-mail with their own UID", async () => {
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
      it("Can't set one's own e-mail with another's UID", async () => {
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
      it("Can't set another's e-mail", async () => {
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

  describe("/docs", async () => {
    it("Can't access /email_to_uid", async () => {
      await assertFails(tryOthers((ctxt) => get(ref(ctxt.database(), `docs`))));
    });

    describe("/docs/<docID>", async () => {
      it("Can read document as an owner / editor / viewer", async () => {
        await assertSucceeds(
          Promise.all([
            get(ref(myContext.database(), `docs/${myDoc}`)),
            get(ref(editorContext.database(), `docs/${myDoc}`)),
            get(ref(viewerContext.database(), `docs/${myDoc}`)),
          ])
        );
      });
      it("Can't read document as a random user", async () => {
        await assertFails(
          tryOthers((ctxt) => get(ref(ctxt.database(), `docs/${myDoc}`)))
        );
      });
      it("Can read a public document as a random user", async () => {
        await testEnv.withSecurityRulesDisabled((ctxt) =>
          set(ref(ctxt.database(), `docs/${myDoc}/public`), true)
        );
        await assertSucceeds(
          tryOthers((ctxt) => get(ref(ctxt.database(), `docs/${myDoc}`)))
        );
      });
      it("Can create a new document", async () => {
        await assertSucceeds(
          set(ref(myContext.database(), `docs/non_existent_doc`), {
            title: "Previously non exixtent doc",
            //timestamp: serverTimestamp(), // We'll ignore timestamp parameter to isolate tests.
            roles: {
              [myID]: "owner",
            },
            public: false,
          })
        );
      });
      it("Can't modify document parameters arbitrarily", async () => {
        await assertFails(
          tryOthers((ctxt) => set(ref(ctxt.database(), `docs/${theirDoc}`), {}))
        );
      });
      it("Can delete document as an owner", async () => {
        await assertSucceeds(
          set(ref(myContext.database(), `docs/${myDoc}`), null)
        );
      });
      it("Can't delete document as a editor / viewer / random", async () => {
        await assertFails(
          allRejected([
            set(ref(editorContext.database(), `docs/${myDoc}`), null),
            set(ref(viewerContext.database(), `docs/${myDoc}`), null),
            tryOthersRejected((ctxt) =>
              set(ref(ctxt.database(), `docs/${myDoc}`), null)
            ),
          ])
        );
      });
      describe("/docs/<docID>/title", async () => {
        it("Can set document title as an owner / editor", async () => {
          await assertSucceeds(
            Promise.all([
              set(
                ref(myContext.database(), `docs/${myDoc}/title`),
                "Arbitrary Title Change"
              ),
              set(
                ref(editorContext.database(), `docs/${myDoc}/title`),
                "Another Arbitrary Title Change"
              ),
            ])
          );
        });
        it("Can't set document title as viewer / random", async () => {
          await assertFails(
            allRejected([
              set(
                ref(viewerContext.database(), `docs/${myDoc}/title`),
                "Arbitrary Title Change"
              ),
              tryOthersRejected((ctxt) =>
                set(
                  ref(ctxt.database(), `docs/${myDoc}/title`),
                  "Another Arbitrary Title Change"
                )
              ),
            ])
          );
        });
        it("Can't set non-string document title", async () => {
          await assertFails(
            allRejected([
              set(ref(myContext.database(), `docs/${myDoc}/title`), true),
              set(ref(theirContext.database(), `docs/${theirDoc}/title`), 123),
              set(ref(editorContext.database(), `docs/${myDoc}/title`), {
                title: "wut",
              }),
            ])
          );
        });
      });
      describe("/docs/<docID>/timestamp", async () => {
        it("Can set document timestamp as an owner / editor", async () => {
          await assertSucceeds(
            Promise.all([
              set(
                ref(myContext.database(), `docs/${myDoc}/timestamp`),
                serverTimestamp()
              ),
              set(
                ref(editorContext.database(), `docs/${myDoc}/timestamp`),
                serverTimestamp()
              ),
            ])
          );
        });
        it("Can't set document title as viewer / random", async () => {
          await assertFails(
            allRejected([
              set(
                ref(viewerContext.database(), `docs/${myDoc}/timestamp`),
                serverTimestamp()
              ),
              tryOthersRejected((ctxt) =>
                set(
                  ref(ctxt.database(), `docs/${myDoc}/title`),
                  serverTimestamp()
                )
              ),
            ])
          );
        });
        it("Can't set timestamp not equal to serverTimestamp()", async () => {
          await assertFails(
            allRejected([
              set(
                ref(myContext.database(), `docs/${myDoc}/timestamp`),
                1426093200
              ),
              set(
                ref(theirContext.database(), `docs/${theirDoc}/timestamp`),
                Date.now().toString()
              ),
              set(ref(editorContext.database(), `docs/${myDoc}/timestamp`), {
                timestamp: serverTimestamp(),
              }),
            ])
          );
        });
      });
      describe("/docs/<docID>/roles", async () => {
        it("Can modify user roles as owner", async () => {
          await assertSucceeds(
            set(ref(myContext.database(), `docs/${myDoc}/roles`), {
              [myID]: "owner",
            })
          );
        });
        it("Can't modify user roles as editor / viewer / random", async () => {
          await assertFails(
            allRejected([
              set(ref(editorContext.database(), `docs/${myDoc}/roles`), {
                [editorID]: "owner",
              }),
              set(ref(viewerContext.database(), `docs/${myDoc}/roles`), {
                [viewerID]: "owner",
              }),
              tryOthersRejected((ctxt) =>
                set(ref(ctxt.database(), `docs/${myDoc}/roles`), {
                  [theirID]: "owner",
                })
              ),
            ])
          );
        });
        it("Can't insert roles other than {'owner', 'editor', 'viewer'}", async () => {
          await assertFails(
            allRejected([
              set(
                ref(myContext.database(), `docs/${myDoc}/roles/${myID}`),
                "Owner"
              ),
              set(
                ref(
                  getAuth(testEnv, theirID, theirToken).database(),
                  `docs/${theirDoc}/roles/${editorID}`
                ),
                "Editor"
              ),
              set(
                ref(
                  getAuth(testEnv, theirID, theirToken).database(),
                  `docs/${theirDoc}/roles/${viewerID}`
                ),
                "Viewer"
              ),
              set(
                ref(
                  getAuth(testEnv, theirID, theirToken).database(),
                  `docs/${theirDoc}/roles/${viewerID}`
                ),
                false
              ),
              set(
                ref(
                  getAuth(testEnv, theirID, theirToken).database(),
                  `docs/${theirDoc}/roles/${viewerID}`
                ),
                { role: "owner" }
              ),
              set(
                ref(
                  theirContext.database(),
                  `docs/${theirDoc}/roles/${viewerID}`
                ),
                123
              ),
            ])
          );
        });
        it("Can't insert non-existent users", async () => {
          await assertFails(
            set(
              ref(
                theirContext.database(),
                `docs/${theirDoc}/roles/non_existent_uid`
              ),
              "editor"
            )
          );
        });
      });
      describe("/docs/<docID>/public", async () => {
        it("Can modify public state as owner", async () => {
          await assertSucceeds(
            set(ref(myContext.database(), `docs/${myDoc}/public`), true)
          );
        });
        it("Can't modify public state as editor / viewer / random", async () => {
          await assertFails(
            allRejected([
              set(ref(editorContext.database(), `docs/${myDoc}/public`), true),
              set(ref(viewerContext.database(), `docs/${myDoc}/public`), true),
              tryOthersRejected((ctxt) =>
                set(ref(ctxt.database(), `docs/${myDoc}/public`), true)
              ),
            ])
          );
        });
        it("Can't modify public state to non-boolean", async () => {
          await assertFails(
            allRejected([
              set(ref(myContext.database(), `docs/${myDoc}/public`), "true"),
              set(ref(theirContext.database(), `docs/${theirDoc}/public`), 1),
            ])
          );
        });
      });
      describe("/docs/<docID>/tags", async () => {
        it("Can modify tags as owner / editor", async () => {
          await assertSucceeds(
            Promise.all([
              set(ref(myContext.database(), `docs/${myDoc}/tags`), {
                tagID1: "special",
                tagID2: "nus",
              }),
              set(ref(editorContext.database(), `docs/${myDoc}/tags`), {
                tagID1: "spdd",
                tagID2: "nudsas",
              }),
            ])
          );
        });
        it("Can't modify tags as viewer / random", async () => {
          await assertFails(
            allRejected([
              set(ref(viewerContext.database(), `docs/${myDoc}/tags`), {
                tagID1: "special",
                tagID2: "nus",
              }),
              tryOthersRejected((ctxt) =>
                set(ref(ctxt.database(), `docs/${myDoc}/tags`), {
                  tagID1: "spdd",
                  tagID2: "nudsas",
                })
              ),
            ])
          );
        });
        it("Can't place non-string tag content", async () => {
          await assertFails(
            allRejected([
              push(ref(myContext.database(), `docs/${myDoc}/tags`), 123).then(
                (val) => Promise.resolve(val),
                (e) => Promise.reject(e)
              ),
              push(
                ref(editorContext.database(), `docs/${myDoc}/tags`),
                true
              ).then(
                (val) => Promise.resolve(val),
                (e) => Promise.reject(e)
              ),
              push(ref(theirContext.database(), `docs/${myDoc}/tags`), {
                tag: "hi",
              }).then(
                (val) => Promise.resolve(val),
                (e) => Promise.reject(e)
              ),
            ])
          );
        });
      });
    });
  });
});
