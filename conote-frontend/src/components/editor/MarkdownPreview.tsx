import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkSimpleUML from "@akebifiky/remark-simple-plantuml";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";

export default function MarkdownPreview({ docContent, ...props }: any) {
  return (
    <>
      <ReactMarkdown
        children={docContent}
        className="markdown-body"
        remarkPlugins={[remarkMath, remarkGfm, remarkSimpleUML]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { ignoreMissing: true, subset: false }],
          rehypeRaw,
        ]}
      />
    </>
  );
}
