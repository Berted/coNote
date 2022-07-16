import {
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  useToast,
} from "@chakra-ui/react";
import {
  IoShare,
  IoLogoMarkdown,
  IoDocumentText,
  IoDocumentTextOutline,
} from "react-icons/io5";
import { AiOutlineFilePdf } from "react-icons/ai";
import { useEffect, useState } from "react";

function handleDownloadMD(docContent: string) {
  return () => {
    const element = document.createElement("a");
    const file = new Blob([docContent], {
      type: "text/markdown",
    });
    element.href = URL.createObjectURL(file);
    element.download = "markdown_export.md";
    element.click();
  };
}

function handleDownloadHTML() {
  let exportDiv = document.createElement("div");

  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css";
  link.integrity =
    "sha384-Xi8rHCmBmhbuyyhbI88391ZKP2dmfnOl4rT9ZfRI7mLTdk1wblIUnrIq35nqwEvC";
  link.crossOrigin = "anonymous";
  exportDiv.appendChild(link);

  link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/github.min.css";
  link.crossOrigin = "anonymous";
  exportDiv.appendChild(link);

  link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.1.0/github-markdown-light.min.css";
  link.crossOrigin = "anonymous";
  exportDiv.appendChild(link);

  const element = document
    .getElementsByClassName("markdown-body")[0]
    .cloneNode(true);
  exportDiv.appendChild(element);
  const dl = document.createElement("a");
  dl.setAttribute("download", "html_export.html");
  dl.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(exportDiv.innerHTML)
  );
  dl.click();
}

function handleDownloadRHTML() {
  const element = document.getElementsByClassName("markdown-body")[0].innerHTML;
  const link = document.createElement("a");

  link.setAttribute("download", "raw_html_export.html");
  link.setAttribute(
    "href",
    "data:text/html;charset=utf-8," + encodeURIComponent(element)
  );
  link.click();
}
// TODO: A bit hacky, but works for now.
function handleDownloadPDF(toast: any) {
  return () =>
    toast({
      title: "Info",
      description:
        "We do not directly support PDF exports as of current. You may set the editor view to 0% and use your browser's print function to save as PDF, we have removed the navbar on print for this purpose.",
      status: "info",
      duration: 8_000,
      isClosable: true,
    });
}
// TODO:
export default function ExportButton({ docContent, ...props }: any) {
  const toast = useToast();

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        variant="ghost"
        colorScheme="blue"
        icon={<IoShare />}
        aria-label="export document"
      />
      <MenuList>
        <MenuGroup title="Export Note" fontSize="md">
          <MenuItem
            icon={<IoLogoMarkdown size="18" />}
            onClick={handleDownloadMD(docContent)}
          >
            Export as Markdown file (.md)
          </MenuItem>
          <MenuItem
            icon={<IoDocumentText size="18" />}
            onClick={handleDownloadHTML}
          >
            Export as HTML file
          </MenuItem>
          <MenuItem
            icon={<IoDocumentTextOutline size="18" />}
            onClick={handleDownloadRHTML}
          >
            Export as Raw-HTML file
          </MenuItem>
          <MenuItem
            icon={<AiOutlineFilePdf size="18" />}
            onClick={handleDownloadPDF(toast)}
          >
            Export as PDF file
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
}
