import { Box, Button, Flex, Spacer } from '@chakra-ui/react';
import { UseAuth } from '@/contexts/auth_user.context';

const GNB = function () {
  const { loading, authUser, signOut } = UseAuth();

  const loginBtn = (
    <Button fontSize="sm" fontWeight="600" color="white" bg="pink.300" _hover={{ bg: 'pink.400' }}>
      로그인
    </Button>
  );
  const logoutBtn = (
    <Button as="a" variant="link" fontWeight="600" onClick={signOut}>
      로그아웃
    </Button>
  );

  const authInitialized = loading || authUser === null;

  return (
    <Box borderBottom={1} borderStyle="solid" borderColor="gray.200" bg="white">
      <Flex minW="60px" py={{ base: 2 }} px={{ base: 4 }} align="center" maxW="md" mx="auto">
        <Spacer />
        <Box flex="1">
          <img style={{ height: '40px' }} src="/logo.svg" alt="logo" />
        </Box>
        <Box justifyContent="flex-end">{authInitialized ? loginBtn : logoutBtn}</Box>
      </Flex>
    </Box>
  );
};

export default GNB;
