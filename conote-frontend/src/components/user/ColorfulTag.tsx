import { Tag, TagCloseButton, TagLabel } from "@chakra-ui/react";

export default function ColorfulTag({ tag, handleTagDelete, ...props }: any) {
  const colors = [
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "cyan",
    "purple",
    "pink",
    "whatsapp",
  ];

  let hash = 0;
  for (var i = 0; i < tag.length; i++) {
    hash = ((hash << 5) + hash + tag.charCodeAt(i)) % 1000000007;
  }

  return (
    <Tag m={0.5} colorScheme={colors[hash % colors.length]} {...props}>
      <TagLabel>{tag}</TagLabel>
      {handleTagDelete !== undefined && (
        <TagCloseButton onClick={() => handleTagDelete(tag)} />
      )}
    </Tag>
  );
}
