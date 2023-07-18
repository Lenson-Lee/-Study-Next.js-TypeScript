import { Box, Flex, Text } from '@chakra-ui/react';

interface Props {
  isOwner: boolean;
  displayName: string | null;
  email: string | null;
  intro: string | null;
  // photoURL: string;
}
const Default = function ({ isOwner, displayName, email, intro }: Props) {
  return (
    <Flex direction="column" justify="center" width="full">
      <Text fontSize="lg">{displayName || ''}</Text>
      {isOwner && (
        <Box>
          <Text fontSize="xs" color="gray.500">
            {email}
          </Text>
          <Text mt="2" fontSize="md">
            {intro}
          </Text>
        </Box>
      )}
    </Flex>
  );
};

export default Default;
