import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Box,
  Avatar,
  Flex,
  Textarea,
  Button,
  useToast,
  FormControl,
  Switch,
  FormLabel,
  VStack,
  Input,
} from '@chakra-ui/react';
import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';
import ResizeTextArea from 'react-textarea-autosize';
import axios, { AxiosResponse } from 'axios';
import FirebaseClient from '@/models/firebase_client';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';
import { ScreenNameUser } from '@/models/in_auth_user';
import { UseAuth } from '@/contexts/auth_user.context';
import { ServiceLayout } from '@/components/service_layout';
import Default from '@/components/Info/Default';
// import { TriangleDownIcon } from '@chakra-ui/icons';
// const userInfo = {
//   uid: 'test',
//   email: 'totuworld@gmail.com',
//   displayName: 'lenson lee',
//   photoURL: 'https://lh3.googleusercontent.com/a/AEdFTp67L7vDPdVv4YcFxNmdeJZBkkWmdKiFa07Izgcf5A=s96-c',
// };

interface Props {
  userInfo: ScreenNameUser | null;
  screenName: string;
}

// 등록 클릭 시 등록 처리
async function postMessage({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  if (message.length <= 0) {
    return {
      result: false,
      message: '메시지를 입력해주세요',
    };
  }
  try {
    await fetch('/api/messages.add', {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        uid,
        message,
        author,
      }),
    });
    return {
      result: true,
    };
  } catch (err) {
    console.error(err);
    return {
      result: false,
      message: '메시지등록실패',
    };
  }
}

const UserHomePage: NextPage<Props> = function ({ userInfo, screenName }) {
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setAnonymous] = useState<boolean>(true);
  const [messageList, setMessageList] = useState<InMessage[]>([]);
  const [userInfoFetchTrigger, setUserInfoFetchTrigger] = useState<boolean>(false);
  const [messageListFetchTrigger, setMessageListFetchTrigger] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  /** 정보수정 On / Off */
  const [updateInfo, setupdateInfo] = useState<boolean>(false);
  const [updateName, setupdateName] = useState<string>('');
  const [updateIntro, setupdateIntro] = useState<string>('');
  const toast = useToast();

  const { authUser } = UseAuth();
  const queryClient = useQueryClient();

  // 사용자들이 질문을 남긴 목록을 조회
  // user id를 알아야 하기 때문에 authUser가 null이 아닐때만 동작
  // 변경되었을때 자동으로 API core을 뿌릴거라 useEffect 사용
  // async function fetchMessageList(uid: string) {
  //   try {
  //     const resp = await fetch(`/api/messages.list?uid=${uid}&page=${page}&size=10`);
  //     if (resp.status === 200) {
  //       const data: {
  //         totalElements: number;
  //         totalPages: number;
  //         page: number;
  //         size: number;
  //         content: InMessage[];
  //       } = await resp.json();
  //       setTotalPages(data.totalPages);
  //       setMessageList((prev) => [...prev, ...data.content]);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // 사용자 정보 변경
  async function updateMember(props: any) {
    try {
      await fetch('/api/members.update', {
        method: 'post',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          uid: props.uid,
          email: props.email,
          displayName: props.displayName,
          introduce: props.introduce,
        }),
      });
      return {
        result: true,
      };
    } catch (err) {
      console.error(err);
      return {
        result: false,
        message: '정보 수정 실패',
      };
    }
  }
  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
      if (resp.status === 200) {
        const data: InMessage = await resp.json();
        setMessageList((prev) => {
          /** 등록하려는 댓글 하나만 뽑아서 넘어온 값이기 때문에 messageList 에서 동일한 id값을 찾는다. */
          const findIndex = prev.findIndex((fv) => fv.id === data.id);
          if (findIndex >= 0) {
            //findIndex는 찾는 값이 없을 때 -1 반환 : 0 이상이면 값이 있다는 뜻
            const updateArr = [...prev];
            updateArr[findIndex] = data;
            return updateArr;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 🤍사용자 정보 로드 : React Query 사용 ____________________________________________________
  const userInfoQueryKey = ['userInfo', userInfo?.uid, userInfoFetchTrigger];
  useQuery(
    userInfoQueryKey,
    async () =>
      // eslint-disable-next-line no-return-await
      await axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        content: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setTotalPages(data.data.totalPages);
        if (page === 1) {
          setMessageList([...data.data.content]);
          return;
        }
        setMessageList((prev) => [...prev, ...data.data.content]);
      },
    },
  );

  // 🤍메시지 리스트 로드 : React Query 사용 ____________________________________________________
  const messageListQueryKey = ['messageList', userInfo?.uid, page, messageListFetchTrigger];
  useQuery(
    messageListQueryKey,
    async () =>
      // eslint-disable-next-line no-return-await
      await axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        content: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setTotalPages(data.data.totalPages);
        if (page === 1) {
          setMessageList([...data.data.content]);
          return;
        }
        setMessageList((prev) => [...prev, ...data.data.content]);
      },
    },
  );

  // 메시지 리스트 삭제 : Delete Mutation
  /** useMutation(쿼리키, api호출함수, 쿼리옵션) */
  async function deleteMessage(props: any) {
    const token = (await FirebaseClient.getInstance().Auth.currentUser?.getIdToken()) || '없어요';
    const { uid, messageId } = props;
    const resp = await fetch('/api/messages.delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },
      body: JSON.stringify({
        uid,
        messageId,
      }),
    });
    if (resp.status < 300) {
      toast({
        title: '삭제되었습니다.',
        status: 'success',
        position: 'top-right',
      });
    }
  }
  const deleteMutation = useMutation((deleteData: { uid: string; messageId: string }) => deleteMessage(deleteData), {
    onSuccess: () => {
      queryClient.invalidateQueries('messageList');
    },
  });

  if (userInfo === null) {
    return <p>사용자를 찾을 수 없습니다.</p>;
  }

  const isOwner = authUser !== null && authUser.uid === userInfo.uid;

  return (
    <ServiceLayout title={`${userInfo.displayName}의 홈`} minH="100vh" backgroundColor="gray.50">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL ?? 'https://bit.ly/broken-link'} mr="3" />
            <Flex direction="column" justify="center" width="full">
              {/* Default UI _________________________________________*/}
              {updateInfo === false && (
                <Default
                  isOwner={isOwner}
                  displayName={userInfo.displayName}
                  email={userInfo.email}
                  intro={userInfo.introduce}
                  // photoURL={userInfo.photoURL}
                />
              )}
              {/* Editting UI _________________________________________ */}
              {isOwner && updateInfo && (
                // <Editting defaultName={userInfo.displayName} email={userInfo.email} updateName="" />
                <Box>
                  <Input
                    bg="gray.100"
                    border="none"
                    placeholder={userInfo.displayName ? userInfo.displayName : '이름'}
                    resize="none"
                    minH="unset"
                    overflow="hidden"
                    fontSize="md"
                    py="1"
                    mr="2"
                    maxRows={1}
                    value={updateName}
                    onChange={(e) => {
                      if (e.currentTarget.value) {
                        const textCount = e.currentTarget.value.length;
                        if (textCount > 10) {
                          toast({ title: '최대 10자까지 가능합니다.', position: 'top-right' });
                          return;
                        }
                      }
                      setupdateName(e.currentTarget.value);
                    }}
                    as={ResizeTextArea}
                  />
                  <Textarea
                    bg="gray.100"
                    border="none"
                    placeholder="소개글을 입력해주세요"
                    resize="none"
                    minH="unset"
                    overflow="hidden"
                    fontSize="md"
                    py="1"
                    mr="2"
                    maxRows={1}
                    value={updateIntro}
                    onChange={(e) => {
                      if (e.currentTarget.value) {
                        const textCount = e.currentTarget.value.length;
                        if (textCount > 16) {
                          toast({ title: '최대 글자수입니다.', position: 'top-right' });
                          return;
                        }
                      }
                      setupdateIntro(e.currentTarget.value);
                    }}
                    as={ResizeTextArea}
                  />
                </Box>
              )}

              {isOwner && updateInfo === false && (
                // default
                <Button
                  onClick={() => {
                    setupdateInfo(true);
                  }}
                  mt="3"
                  fontSize="xs"
                  color="blue.400"
                >
                  내 정보 수정
                </Button>
              )}
              {isOwner && updateInfo && (
                // 정보 수정중
                <Flex width="full" gap="2">
                  <Button
                    onClick={async () => {
                      const postData: {
                        uid: string;
                        displayName: string;
                        email: string;
                        introduce: string;
                      } = {
                        uid: userInfo.uid,
                        displayName: updateName || userInfo.displayName || 'sampleName',
                        email: userInfo.email ? userInfo.email : 'sample@mail.com',
                        introduce: updateIntro,
                      };
                      const infoResp = await updateMember(postData);
                      if (infoResp.result === false) {
                        toast({ title: '정보 수정 실패', position: 'top-right' });
                      }
                      setMessage('');
                      setPage(1);
                      //페이지 변경 후 로딩되어야해서 프레임 차이를 준다.
                      setTimeout(() => {
                        setMessageListFetchTrigger((prev) => !prev);
                      }, 50);

                      setupdateInfo(!updateInfo);
                    }}
                    width="full"
                    mt="3"
                    fontSize="xs"
                    color="blue.400"
                  >
                    수정하기
                  </Button>
                  <Button
                    onClick={() => {
                      setupdateInfo(!updateInfo);
                      setupdateName('');
                      setupdateIntro('');
                    }}
                    width="full"
                    mt="3"
                    fontSize="xs"
                    color="pink.400"
                  >
                    취소하기
                  </Button>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Box>
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb="2" bg="white">
          <Flex align="center" p="2">
            <Avatar
              size="xs"
              src={isAnonymous ? 'https://bit.ly/broken-link' : authUser?.photoURL ?? 'https://bit.ly/broken-link'}
              mr="2"
            />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="무엇이 궁금한가요?"
              resize="none"
              minH="unset"
              overflow="hidden"
              fontSize="xs"
              mr="2"
              maxRows={7}
              value={message}
              onChange={(e) => {
                if (e.currentTarget.value) {
                  const lineCount = e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length ?? 1;
                  if (lineCount + 1 > 7) {
                    toast({ title: '최대 7줄만 가능합니다.', position: 'top-right' });
                    return;
                  }
                }
                setMessage(e.currentTarget.value);
              }}
              as={ResizeTextArea}
            />
            <Button
              disabled={message.length === 0}
              bgColor="#FFB86C"
              color="white"
              colorScheme="yellow"
              variant="solid"
              size="sm"
              onClick={async () => {
                const postData: {
                  message: string;
                  uid: string;
                  author?: {
                    displayName: string;
                    photoURL?: string;
                  };
                } = {
                  message,
                  uid: userInfo.uid,
                };
                if (isAnonymous === false) {
                  postData.author = {
                    photoURL: authUser?.photoURL ?? 'https://bit.ly/broken-link',
                    displayName: authUser?.displayName ?? 'anonymous',
                  };
                }
                const messageResp = await postMessage(postData);
                if (messageResp.result === false) {
                  toast({ title: '메시지 등록 실패', position: 'top-right' });
                }
                setMessage('');
                setPage(1);
                //페이지 변경 후 로딩되어야해서 프레임 차이를 준다.
                setTimeout(() => {
                  setMessageListFetchTrigger((prev) => !prev);
                }, 50);
              }}
            >
              등록
            </Button>
          </Flex>
          <FormControl display="flex" alignItems="center" mt="1" mx="2" pb="2">
            <Switch
              size="sm"
              colorScheme="orange"
              id="anonymous"
              mr="1"
              isChecked={isAnonymous}
              onChange={() => {
                if (authUser === null) {
                  toast({ title: '로그인이 필요합니다.', position: 'top-right' });
                  return;
                }
                setAnonymous((prey) => !prey);
              }}
            />
            <FormLabel htmlFor="anonymous" mb="0" fontSize="xx-small">
              익명 여부
            </FormLabel>
          </FormControl>
        </Box>
        <VStack spacing="12px" mt="6">
          {messageList.map((msgData) => (
            <MessageItem
              key={`messageItem ${userInfo.uid} - ${msgData.id}`}
              item={msgData}
              uid={userInfo.uid}
              screenName={screenName}
              displayName={userInfo.displayName ?? ''}
              photoURL={userInfo.photoURL ?? 'https://bit.ly/broken-link'}
              isOwner={isOwner}
              onSendComplete={() => {
                // setMessageListFetchTrigger((prev) => !prev);
                fetchMessageInfo({ uid: userInfo.uid, messageId: msgData.id });
              }}
              onSendDelete={async () => {
                deleteMutation.mutate({
                  uid: userInfo.uid,
                  messageId: msgData.id,
                });
              }}
              // deleteMessage({ uid: userInfo.uid, messageId: msgData.id })}
              // deleteMessage.mutate()}
            />
          ))}
        </VStack>
        {totalPages > page && (
          <Button
            width="full"
            mt="2"
            fontSize="sm"
            onClick={() => {
              setPage((p) => p + 1);
            }}
            // leftIcon={<TriangleDownIcon />}
          >
            더보기
          </Button>
        )}
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName } = query;

  if (screenName === undefined) {
    console.info('😡 라우터에 screenName이 없어요!');
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }

  // 서버사이드에서 작동해서 fetch 사용불가. node.js에서 사용하는 라이브러리나 axios를 fetch해야함
  // 서버사이드이기때문에 '/'만으로는 위치를 몰라 baseURL 생성

  const screenNameToStr = Array.isArray(screenName) ? screenName[0] : screenName;

  try {
    const protocol = process.env.PROTOCOL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    //any같은게 들어와서 뭘 받을지 특정한다.
    const userInfoResp: AxiosResponse<ScreenNameUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);

    return {
      props: {
        userInfo: userInfoResp.data ?? null,
        screenName: screenNameToStr,
      },
    };
  } catch (err) {
    console.error('😡 [screenName]/index 오류 : ', err);
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }
};
export default UserHomePage;
