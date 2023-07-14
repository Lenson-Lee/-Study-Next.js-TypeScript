// import { Box, Flex, Icon, Text, Textarea } from '@chakra-ui/react';

interface Props {
  defaultName: string | null;
  email: string | null;
  updateName: any;
  // intro: string;
  // photoURL: string;
}
const Editting = function () // { defaultName, updateName, email }: Props
{
  //   return (
  //     <Flex direction="column" justify="center" width="full">
  //       <Textarea
  //         bg="gray.100"
  //         border="none"
  //         placeholder="무엇이 궁금한가요?"
  //         resize="none"
  //         minH="unset"
  //         overflow="hidden"
  //         fontSize="xs"
  //         mr="2"
  //         maxRows={7}
  //         value={message}
  //         onChange={(e) => {
  //           if (e.currentTarget.value) {
  //             const lineCount = e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
  //             if (lineCount + 1 > 7) {
  //               toast({ title: '최대 1줄만 가능합니다.', position: 'top-right' });
  //               return;
  //             }
  //           }
  //           setMessage(e.currentTarget.value);
  //         }}
  //         as={ResizeTextArea}
  //       />
  //       <Text fontSize="lg">{displayName || ''}</Text>
  //       <Text fontSize="xs" color="gray.500">
  //         {email}
  //       </Text>
  //       <Text mt="2" fontSize="md">
  //         자기소개칸은 20자로 제한됩니다요옹.
  //       </Text>
  //     </Flex>
  //   );
};

export default Editting;
