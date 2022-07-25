import { IconButton, ButtonGroup } from "@chakra-ui/react";
import { IoEye, IoPencil } from "react-icons/io5";
import { BsLayoutSplit } from "react-icons/bs";
import PanelValue from "./userPresence/PanelValue";

export default function EditorSplitButtons({
  panelType,
  setPanelType,
  ...props
}: any) {
  return (
    <ButtonGroup isAttached variant="outline" colorScheme="blue">
      <IconButton
        icon={<IoEye />}
        isActive={panelType === PanelValue.View}
        onClick={(e) => {
          setPanelType(PanelValue.View);
        }}
        borderColor="blue.400"
        color="blue.500"
        aria-label="Read note"
      ></IconButton>
      <IconButton
        icon={<BsLayoutSplit />}
        isActive={panelType === PanelValue.Split}
        onClick={(e) => {
          setPanelType(PanelValue.Split);
        }}
        borderColor="blue.400"
        color="blue.500"
        aria-label="Read & Write note"
      ></IconButton>
      <IconButton
        icon={<IoPencil />}
        isActive={panelType === PanelValue.Edit}
        onClick={(e) => {
          setPanelType(PanelValue.Edit);
        }}
        borderColor="blue.400"
        color="blue.500"
        aria-label="Write note"
      ></IconButton>
    </ButtonGroup>
  );
}
