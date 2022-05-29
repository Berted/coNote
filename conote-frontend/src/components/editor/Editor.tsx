import {
  Remirror,
  useRemirror,
  useHelpers,
  EditorComponent,
  ThemeProvider,
} from "@remirror/react";
import { languages } from "@codemirror/language-data";
import { CodeMirrorExtension } from "@remirror/extension-codemirror6";
import {
  HStack,
  Box,
  Divider,
  VStack,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

const extensions = () => [new CodeMirrorExtension({ languages })];

function MarkdownPreview() {
  const { getText } = useHelpers(true);
  return (
    <>
      <ReactMarkdown
        children={getText()}
        className="markdown-body"
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      />
    </>
  );
}

const sampleText = `# 📝 Welcome to coNote! 
**WARNING:** This is a very early prototype of the editor, 
there are many kinks to work out, currently looks best at 
a desktop sized resolution. It should be noted that any edits 
to this file is currently not saved. **DO NOT WRITE ANYTHING 
IMPORTANT HERE!**

coNote is designed to be a simple collaborative tool 
to allow your group to start writing and collaborate 
together easily. 

Using Markdown, you can quickly write formatted text
that looks simple and clean. It's also [**easy** to pick 
up](https://www.markdowntutorial.com/)!

## 👀 Simple Demo 

You can _easily_ format your **text** like **__this__**!

You can also add subheadings of different levels!

### Subheading 

#### Another _one_.

You can also write quotes:

> "Making 🍳 the mother 👩 of all omelettes 🥘 here Jack 🤺!
   Can't fret over every egg 🥚" 
   ~ Steven Armstrong

Also writing lists:
- Milk
- Eggs
- Salmon
- Butter

## 🧩 Extensions

As of current, we have decided to use GitHub-Flavoured 
Markdown as our preferred variant, we will have more
options available down the line.

We have also added math support, rendered with KaTeX:

The following is an excerpt from a paper of MA2001:

> Let $\\boldsymbol{A}$ be a square matrix of order $n$. 
> For $\\lambda \\in \\mathbb{R}$, define:
>  - $T_\\lambda : \\mathbb{R}^n \\rightarrow \\mathbb{R}^n$ 
>     by $T_\\lambda(\\boldsymbol{u}) = \\boldsymbol{Au} - 
>      \\lambda\\boldsymbol{u}$
>
> Suppose that $\\boldsymbol{A}$ has eigenvalues 
> $\\lambda_1, \\dots, \\lambda_k$
> 
> If $\\boldsymbol{v}$ is an eigenvector of 
> $\\boldsymbol{A}$, show that:
> $$ 
> (\\boldsymbol{A}-\\lambda_1{\\boldsymbol{I}})\\cdots
> (\\boldsymbol{A}-\\lambda_k{\\boldsymbol{I}})\\boldsymbol{v}
> = \\boldsymbol{0}
> $$

## ⌚ Future Plans

We're planning to add:
- Code highlighting when writing code blocks, i.e.
  \`\`\`cpp
  cout << "Hello, world! << endl;
  \`\`\`
  Should be highlighted with proper C++ syntaxing.
- Custom styling (/w imported CSS?), or at least, more styles. Currently using GitHub's styling.
- Text wrapping on editor.
- Optimizing interface for smaller viewports.
- Get keyboard shortcuts working.
- Many more to come :D
`;

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions,
    content: sampleText,
    stringHandler: "text",
    selection: "end",
  });

  return (
    <VStack padding="1">
      <Link
        color="gray.400"
        _hover={{
          textColor: "gray.600",
          textDecoration: "underline",
        }}
        as={RouteLink}
        to="/"
      >
        &#60; Return home.
      </Link>
      <Remirror onChange={onChange} manager={manager} initialContent={state}>
        <HStack
          w="100vw"
          padding="2"
          verticalAlign="top"
          textAlign="left"
          h="90vh"
        >
          <VStack w="50%" h="100%">
            <Text>Editor:</Text>
            <Box
              w="100%"
              borderWidth="1px"
              borderRadius="md"
              verticalAlign="top"
            >
              <EditorComponent />
            </Box>
          </VStack>
          <VStack w="50%" h="100%">
            <Text>Preview:</Text>
            <Box
              w="100%"
              borderWidth="1px"
              borderRadius="md"
              verticalAlign="top"
            >
              <MarkdownPreview />
            </Box>
          </VStack>
        </HStack>
      </Remirror>
    </VStack>
  );
};

export default Editor;
