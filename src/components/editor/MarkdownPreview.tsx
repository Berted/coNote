import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
//import "./anchorLink.css";
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
import React, { useEffect } from "react";

function hashchange() {
  /** @type {string|undefined} */
  let hash;

  try {
    hash = decodeURIComponent(window.location.hash.slice(1)).toLowerCase();
  } catch {
    return;
  }

  const name = "user-content-" + hash;
  const target =
    document.getElementById(name) || document.getElementsByName(name)[0];
  const container = document.getElementById("markdown-content-container");

  if (target) {
    const targetTop =
      target.getBoundingClientRect().top + (container?.scrollTop || 0);
    const containerTop = container?.getBoundingClientRect().top || 0;
    setTimeout(() => {
      container?.scroll({
        behavior: "smooth",
        top: Math.max(0, targetTop - containerTop - 10),
      });
    }, 0);
  }
}

function MarkdownPreview({ docContent, ...props }: any) {
  const handleSameHashClicked = (event: Event) => {
    if (
      event.target &&
      event.target instanceof HTMLAnchorElement &&
      event.target.href === window.location.href &&
      window.location.hash.length > 1
    ) {
      setTimeout(() => {
        if (!event.defaultPrevented) {
          hashchange();
        }
      });
    }
  };

  useEffect(() => {
    // Page load (you could wrap this in a DOM ready if the script is loaded early).
    window.addEventListener("load", hashchange);

    // When URL changes.
    window.addEventListener("hashchange", hashchange);

    // When on the URL already, perhaps after scrolling, and clicking again, which
    // doesn’t emit `hashchange`.
    document.addEventListener("click", handleSameHashClicked, false);

    return () => {
      window.removeEventListener("load", hashchange);
      window.removeEventListener("hashchange", hashchange);
      document.removeEventListener("click", handleSameHashClicked, false);
    };
  }, []);

  return (
    <>
      <ReactMarkdown
        children={docContent}
        className="markdown-body"
        remarkPlugins={[
          remarkMath,
          remarkGfm,
          remarkSimpleUML,
          [remarkToc, { tight: true }],
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
        remarkRehypeOptions={{ clobberPrefix: "" }}
        linkTarget={(href, children, title) => {
          if (/^#/.test(href)) return "_self";
          else return "_blank";
        }}
      />
    </>
  );
}

export default React.memo(MarkdownPreview);
