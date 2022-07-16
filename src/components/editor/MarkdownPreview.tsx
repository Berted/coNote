import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
import "./anchorLink.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkSimpleUML from "@akebifiky/remark-simple-plantuml";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug-custom-id";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import "katex/dist/katex.min.css";

export default function MarkdownPreview({ docContent, ...props }: any) {
  return (
    <>
      <ReactMarkdown
        children={docContent}
        className="markdown-body"
        remarkPlugins={[
          [remarkToc, { tight: true, prefix: "user-content-" }],
          remarkMath,
          remarkGfm,
          remarkSimpleUML,
        ]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSlug,
          [rehypeHighlight, { ignoreMissing: true, subset: false }],
          [
            rehypeSanitize,
            {
              ...defaultSchema,
              attributes: {
                ...defaultSchema.attributes,
                div: [
                  ...(defaultSchema.attributes?.div || []),
                  ["className", "math", "math-display"],
                ],
                span: [
                  ...(defaultSchema.attributes?.span || []),
                  [
                    "className",
                    "math",
                    "math-inline",
                    "hljs-addition",
                    "hljs-attr",
                    "hljs-attribute",
                    "hljs-built_in",
                    "hljs-bullet",
                    "hljs-char",
                    "hljs-code",
                    "hljs-comment",
                    "hljs-deletion",
                    "hljs-doctag",
                    "hljs-emphasis",
                    "hljs-formula",
                    "hljs-keyword",
                    "hljs-link",
                    "hljs-literal",
                    "hljs-meta",
                    "hljs-name",
                    "hljs-number",
                    "hljs-operator",
                    "hljs-params",
                    "hljs-property",
                    "hljs-punctuation",
                    "hljs-quote",
                    "hljs-regexp",
                    "hljs-section",
                    "hljs-selector-attr",
                    "hljs-selector-class",
                    "hljs-selector-id",
                    "hljs-selector-pseudo",
                    "hljs-selector-tag",
                    "hljs-string",
                    "hljs-strong",
                    "hljs-subst",
                    "hljs-symbol",
                    "hljs-tag",
                    "hljs-template-tag",
                    "hljs-template-variable",
                    "hljs-title",
                    "hljs-type",
                    "hljs-variable",
                  ],
                ],
                code: [
                  ...(defaultSchema.attributes?.code || []),
                  // List of all allowed languages:
                  ["className", "language-js", "language-css", "language-md"],
                ],
              },
            },
          ],
          rehypeKatex,
        ]}
        linkTarget={(href, children, title) => {
          if (/^#/.test(href)) return "_self";
          else return "_blank";
        }}
      />
    </>
  );
}
