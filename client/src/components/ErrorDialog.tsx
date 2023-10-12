import { Alert, AlertDescription, AlertIcon, Box, CloseButton } from "@chakra-ui/react";

interface ErrorDialogProps {
  errorMessage: string;
  onClose: () => void;
}

function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function ErrorDialog({ errorMessage, onClose }: ErrorDialogProps) {
  return (
    <Alert status="error" width="fit-content" rounded="base" mt="3">
      <AlertIcon />
      <Box>
        <AlertDescription>{capitalizeFirstLetter(errorMessage)}</AlertDescription>
      </Box>

      <CloseButton alignSelf="flex-end" position="relative" onClick={onClose} />
    </Alert>
  );
}
