import { Avatar, Box, Button, Flex, IconButton, Menu, MenuButton, MenuItem, MenuList, Spacer } from '@chakra-ui/react';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { UseAuth } from '@/contexts/auth_user.context';

const GNB = function () {
  const { loading, authUser, signOut } = UseAuth();

  const { signInWithGoogle } = UseAuth();

  const screenName = authUser?.email?.replace('@gmail.com', '');
  const [photo, setPhoto] = useState('');

  async function userPhoto() {
    if (screenName) {
      fetch(`/api/user.info/${screenName}`, {
        method: 'GET',
      })
        .then(async (res) => res.json())
        .then((data) => {
          setPhoto(data.photoURL);
        })
        .catch((err) => {
          console.log('[GNB]', err);
        });
    }
  }

  useEffect(() => {
    userPhoto();
  }, [authUser, photo]);

  const loginBtn = (
    <Button
      onClick={signInWithGoogle}
      fontSize="sm"
      fontWeight="600"
      color="white"
      bg="pink.300"
      _hover={{ bg: 'pink.400' }}
    >
      로그인
    </Button>
  );

  const logoutBtn = (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<Avatar size="md" src={photo || 'https://bit.ly/broken-link'} />}
        borderRadius="full"
      />
      <MenuList>
        <MenuItem
          onClick={() => {
            window.location.href = `/${screenName}`;
          }}
        >
          사용자 홈으로 이동
        </MenuItem>
        <MenuItem onClick={signOut}>로그아웃</MenuItem>
      </MenuList>
    </Menu>
  );

  const authInitialized = loading || authUser === null;

  return (
    <Box borderBottom={1} borderStyle="solid" borderColor="gray.200" bg="white">
      <Flex minW="60px" py={{ base: 2 }} px={{ base: 4 }} align="center" maxW="md" mx="auto">
        <Spacer />
        <Box flex="1">
          <Link href="/">
            <img style={{ height: '40px' }} src="/logo.svg" alt="logo" />
          </Link>
        </Box>
        <Box justifyContent="flex-end">{authInitialized ? loginBtn : logoutBtn}</Box>
      </Flex>
    </Box>
  );
};

export default GNB;
