import {
  Heading,
  VStack,
  Link,
  Text,
  Box,
  SimpleGrid,
  FormControl,
  Input,
  FormHelperText,
  FormErrorMessage,
  Container,
  Select,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";

import { Link as RouteLink } from "react-router-dom";

import { useProvideAuth } from "hooks/useAuth";

import DashboardNavbar from "./DashboardNavbar";
import DocCard from "./DocCard";
import { useEffect, useState } from "react";
import { child, get, getDatabase, ref } from "firebase/database";
import { Helmet } from "react-helmet";

import "../styles/noselect.css";

export default function Dashboard() {
  const { userData, ...auth } = useProvideAuth();
  const [docType, setDocType] = useState<"owned" | "shared">("owned");
  const [tagsFilter, setTagsFilter] = useState<string[]>([]);
  const [tagsFilterOption, setTagsFilterOption] = useState("and");
  const [sorter, setSorter] = useState("time-dec");
  const [searchInput, setSearchInput] = useState("");
  const [documents, setDocuments] = useState<string[] | undefined>(undefined);

  useEffect(() => {
    if (userData === undefined) return;
    Promise.all(
      Object.keys(
        (docType === "owned"
          ? userData.owned_documents
          : userData.shared_documents) || {}
      ).map((docID) => {
        const docRef = ref(getDatabase(), `docs/${docID}`);

        let title = get(child(docRef, `title`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              return snapshot.val();
            }
            return undefined;
          })
          .catch((e) => console.log("Doc error: " + e));

        let timestamp = get(child(docRef, `timestamp`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              return snapshot.val();
            }
            return undefined;
          })
          .catch((e) => console.log("Doc error: " + e));

        let tags = get(child(docRef, `tags`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              return Object.values(snapshot.val());
            }
            return undefined;
          })
          .catch((e) => console.log("Doc error: " + e));

        return Promise.all([docID, tags, title, timestamp]);
      })
    )
      .then((docs) => {
        // Filter by search input
        if (searchInput.length === 0) {
          return docs;
        }
        return docs.filter((x) => {
          return x[2].toLowerCase().includes(searchInput.toLowerCase());
        });
      })
      .then((docs) => {
        // Filter by tags (option: AND or OR)
        if (tagsFilter.length === 0) {
          // If tagsFilter is empty, then filter is disabled
          return docs;
        }
        return docs.filter((x) => {
          switch (tagsFilterOption) {
            case "and":
              return tagsFilter.every(
                (t) => x[1] !== undefined && x[1].includes(t)
              );
            case "or":
              return !tagsFilter.every(
                (t) => x[1] === undefined || !x[1].includes(t)
              );
            default:
              return false;
          }
        });
      })
      .then((docs) => {
        // Sort by sorter
        const comparator = (a: any, b: any) => {
          return a < b ? -1 : a > b ? 1 : 0;
        };
        switch (sorter) {
          case "title-asc":
          case "title-dec":
            docs.sort((a, b) => {
              if (comparator(a[2].toLowerCase(), b[2].toLowerCase()) !== 0) {
                return comparator(a[2].toLowerCase(), b[2].toLowerCase());
              }
              if (comparator(a[2], b[2]) !== 0) {
                return comparator(a[2], b[2]);
              }
              return comparator(a[0], b[0]);
            });
            if (sorter === "title-dec") {
              docs.reverse();
            }
            break;
          case "time-asc":
          case "time-dec":
            docs.sort((a, b) => {
              if (comparator(a[3], b[3]) !== 0) {
                return comparator(a[3], b[3]);
              }
              return comparator(a[0], b[0]);
            });
            if (sorter === "time-dec") {
              docs.reverse();
            }
            break;
          default:
            break;
        }
        return docs;
      })
      .then((docs) => {
        setDocuments(docs.map((x) => x[0]));
      })
      .catch((e) => console.log("Document display error: " + e));
  }, [userData, tagsFilter, tagsFilterOption, sorter, docType, searchInput]);

  if (!auth.user) return <></>;
  else {
    return (
      <>
        <Helmet>
          <title>Dashboard - coNote</title>
        </Helmet>
        <Box>
          <DashboardNavbar
            tags={tagsFilter}
            setTags={setTagsFilter}
            filterOption={tagsFilterOption}
            setFilterOption={setTagsFilterOption}
            sorter={sorter}
            setSorter={setSorter}
            setDocType={setDocType}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />

          <SimpleGrid
            minChildWidth="300px"
            maxWidth={`${documents !== undefined
                ? Object.values(documents).length * 500 + 20
                : 0
              }px`}
            paddingX="7"
            marginTop="12vh"
            gap="5"
          >
            {documents !== undefined &&
              Object.values(documents).map((item) => {
                return (
                  <DocCard
                    key={"doc-card-" + item}
                    docID={item}
                    docType={docType}
                    searchInput={searchInput}
                  />
                );
              })}
          </SimpleGrid>

          {documents !== undefined && Object.values(documents).length === 0 && (
            <NoDocumentComponent docType={docType} searchInput={searchInput} />
          )}
        </Box>
      </>
    );
  }
}

function NoDocumentComponent({ docType, ...props }: any) {
  return (
    <VStack
      textColor="gray.300"
      mt="30vh"
      spacing="1"
      className="noselect"
      fontSize="lg"
    >
      <Heading fontSize="5xl">No notes here.</Heading>
      {props.searchInput.length > 0 && <Text>No matches found!</Text>}
      {props.searchInput.length === 0 && docType === "owned" && <Text>Start writing notes!</Text>}
      {props.searchInput.length === 0 && docType === "shared" && <Text>Get others to share notes!</Text>}
    </VStack>
  );
}

/*
  Deprecated.
*/
function PlaceholderText({ auth, ...props }: any) {
  return (
    <VStack spacing="6">
      <Heading size="3xl" fontFamily="League Spartan">
        Hi, {auth.user.email}!
      </Heading>
      <Text maxW="50%">
        Sadly, we have not implemented an interface for file management and
        storage. However, you can try out a basic version of{" "}
        <Link
          textDecor="underline"
          _hover={{
            textColor: "blue.500",
          }}
          as={RouteLink}
          to="/editor"
        >
          the editor!
        </Link>
      </Text>
    </VStack>
  );
}
