/* eslint-disable react/destructuring-assignment */
import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
  Box,
  Flex,
  Heading,
  Center,
  Text,
  Button,
  Input,
  WrapItem,
  Avatar,
  Wrap,
  Link,
  Divider,
} from '@chakra-ui/react';
import axios from 'axios';
import { ServiceLayout } from '@/components/service_layout';
import { GoogleLoginButton } from '@/components/google_login_button';
import { UseAuth } from '@/contexts/auth_user.context';

interface Props {
  userList: any;
  baseUrl: string;
}
const IndexPage: NextPage<Props> = function (props) {
  const { signInWithGoogle, authUser, signInTestAdmin } = UseAuth();

  const [pw, setPw] = useState<string>('');

  return (
    <ServiceLayout title="Chat Any Thing" minH="100vh" backgroundColor="gray.50" pb="20">
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
      <Divider mt="10" mb="10" />
      {/* ______________________________________________________________ */}
      {props?.userList.length > 0 && (
        <Box>
          <Text fontSize="xl" mt="10" mb="10" textAlign="center">
            둘러보기
          </Text>

          <Center>
            <Wrap spacing="30px" justify="center">
              {props?.userList.map((item: any) => (
                <WrapItem>
                  <Link href={`/${item.screen_name}`}>
                    <Avatar size="lg" name={item.name} src={item.photoURL} />
                    <Text align="center">{item.name}</Text>
                  </Link>
                </WrapItem>
              ))}
            </Wrap>
          </Center>
        </Box>
      )}
    </ServiceLayout>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  console.log(query);

  const protocol = process.env.PROTOCOL || 'http';
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3000';
  const baseUrl = `${protocol}://${host}:${port}`;

  //any같은게 들어와서 뭘 받을지 특정한다.
  const userList = await axios(`${baseUrl}/api/user.list`);

  return { props: { userList: userList.data, baseUrl } };
};

export default IndexPage;
