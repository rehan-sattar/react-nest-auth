import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
} from "@chakra-ui/react";

interface ErrorDialogProps {
  errorMessage: string;
  onClose: () => void;
}

export default function ErrorDialog({ errorMessage, onClose }: ErrorDialogProps) {
  return (
    <Modal isOpen={true} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Oops..</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{errorMessage}</Text>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
