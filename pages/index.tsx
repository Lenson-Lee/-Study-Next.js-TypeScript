import { useState } from 'react';
import { NextPage } from 'next';
import { Box, Flex, Heading, Center, Text, Button, Input } from '@chakra-ui/react';
import { ServiceLayout } from '@/components/service_layout';
import { GoogleLoginButton } from '@/components/google_login_button';
import { UseAuth } from '@/contexts/auth_user.context';

const IndexPage: NextPage = function () {
  const { signInWithGoogle, authUser, signInTestAdmin } = UseAuth();

  const [pw, setPw] = useState<string>('');
  return (
    <ServiceLayout title="Chat Any Thing" minH="100vh" backgroundColor="gray.50">
      <Box maxW="sm" mx="auto" pt="10">
        <img src="/main_logo.svg" alt="메인 로고" />

        <Flex justify="center">
          <Heading>👀 Chat Any Thing!</Heading>
        </Flex>
        <Text mt="5" textAlign="center">
          지금 Chat Any Thing에서 질문하세요!
        </Text>
      </Box>
      <Center mt="20">
        {authUser === null && (
          <div>
            <Box mb="8">
              <form>
                {/* <Input
                  display="block"
                  variant="flushed"
                  width="full"
                  size="sm"
                  onChange={(e) => {
                    setId(e.target.value);
                  }}
                  placeholder="체험용 아이디를 입력해 주세요"
                /> */}
                <Input
                  mt="2"
                  variant="flushed"
                  size="sm"
                  width="full"
                  type="password"
                  onChange={(e) => {
                    setPw(e.target.value);
                  }}
                  placeholder="체험용 패스워드를 입력해 주세요"
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    signInTestAdmin('sample@gmail.com', pw);
                  }}
                  type="submit"
                  size="lg"
                  width="full"
                  mt="8"
                  maxW="md"
                  borderRadius="full"
                  bg="pink.300"
                  color="white"
                  _hover={{ bg: 'pink.400' }}
                >
                  체험용 계정으로 입장
                </Button>
              </form>
            </Box>
            <GoogleLoginButton onClick={signInWithGoogle} />
          </div>
        )}

        {authUser && (
          <Box>
            <Button
              size="lg"
              width="full"
              maxW="md"
              borderRadius="full"
              bgColor="#4285f4"
              color="white"
              colorScheme="blue"
              onClick={() => {
                window.location.href = `/${authUser.email?.replace('@gmail.com', '')}`;
              }}
            >
              사용자 홈으로 이동
            </Button>
          </Box>
        )}
      </Center>
    </ServiceLayout>
  );
};

export default IndexPage;
