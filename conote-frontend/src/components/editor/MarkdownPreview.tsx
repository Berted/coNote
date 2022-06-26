import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkSimpleUML from "@akebifiky/remark-simple-plantuml";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug-custom-id";
import "katex/dist/katex.min.css";

export default function MarkdownPreview({ docContent, ...props }: any) {
  return (
    <>
      <ReactMarkdown
        children={docContent}
        className="markdown-body"
        remarkPlugins={[
          [remarkToc, { tight: true }],
          remarkMath,
          remarkGfm,
          remarkSimpleUML,
        ]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { ignoreMissing: true, subset: false }],
          rehypeRaw,
          rehypeSanitize,
          rehypeSlug,
        ]}
        linkTarget={(href, children, title) => {
          if (/^#/.test(href)) return "_self";
          else return "_blank";
        }}
      />
    </>
  );
}
