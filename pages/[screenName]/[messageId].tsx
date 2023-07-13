import Head from 'next/head';
import Link from 'next/link';
import { Avatar, Box, Button, Flex, Text } from '@chakra-ui/react';

import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { InAuthUser } from '@/models/in_auth_user';
import { UseAuth } from '@/contexts/auth_user.context';
import { ServiceLayout } from '@/components/service_layout';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  messageData: InMessage | null;
  screenName: string;
  baseUrl: string;
}

const MessagePage: NextPage<Props> = function ({ userInfo, messageData: initMsgData, screenName, baseUrl }) {
  const [messageData, setMessageData] = useState<null | InMessage>(initMsgData);

  const { authUser } = UseAuth();

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
      if (resp.status === 200) {
        const data: InMessage = await resp.json();
        setMessageData(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (userInfo === null) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }
  if (messageData === null) {
    return <p>메시지 정보가 없습니다.</p>;
  }

  const isOwner = authUser !== null && authUser.uid === userInfo.uid;
  const metaImgUrl = `${baseUrl}/open-graph-img?text=${encodeURIComponent(messageData.message)}`;
  const thumbnailImgUrl = `${baseUrl}/api/thumbnail?url=${encodeURIComponent(metaImgUrl)}`;

  return (
    <>
      <Head>
        <meta property="og:image" content={thumbnailImgUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@blahx2" />
        <meta name="twitter:title" content={messageData.message} />
        <meta name="twitter:image" content={thumbnailImgUrl} />
      </Head>
      <ServiceLayout title={`${userInfo.displayName}의 홈`} minH="100vh" backgroundColor="gray.50">
        <Box maxW="md" mx="auto" pt="6">
          <Link href={`/${screenName}`}>
            <a>
              <Button mb="2" fontSize="sm">
                {screenName}의 홈으로
              </Button>
            </a>
          </Link>
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
            <Flex p="6">
              <Avatar size="lg" src={userInfo.photoURL ?? 'https://bit.ly/broken-link'} mr="2" />
              <Flex direction="column" justify="center">
                <Text fontSize="md">{userInfo.displayName}</Text>
                <Text fontSize="xs">{userInfo.email}</Text>
              </Flex>
            </Flex>
          </Box>
          <MessageItem
            item={messageData}
            uid={userInfo.uid}
            screenName={screenName}
            displayName={userInfo.displayName ?? ''}
            photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
            isOwner={isOwner}
            onSendComplete={() => {
              // setMessageListFetchTrigger((prev) => !prev);
              fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
            }}
            onSendDelete={() => console.log('세부내용에서 삭제는 안돼요')}
          />
        </Box>
      </ServiceLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName, messageId } = query;
  if (screenName === undefined || messageId === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
        baseUrl: '',
      },
    };
  }
  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const screenNameToStr = Array.isArray(screenName) ? screenName[0] : screenName;

    //any같은게 들어와서 뭘 받을지 특정한다.
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    if (userInfoResp.status !== 200 || userInfoResp.data === undefined || userInfoResp.data.uid === undefined) {
      return {
        props: {
          userInfo: null,
          messageData: null,
          screenName: screenNameToStr,
          baseUrl,
        },
      };
    }
    const messageInfoResp: AxiosResponse<InMessage> = await axios(
      `${baseUrl}/api/messages.info?uid=${userInfoResp.data.uid}&messageId=${messageId}`,
    );
    return {
      props: {
        userInfo: userInfoResp.data,
        messageData: messageInfoResp.status !== 200 || messageInfoResp.data === undefined ? null : messageInfoResp.data,
        screenName: screenNameToStr,
        baseUrl,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
        baseUrl: '',
      },
    };
  }
};
export default MessagePage;
