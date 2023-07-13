import { firestore } from 'firebase-admin';
import FirebaseAdmin from '../firebase_admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import { InMessage, InMessageServer } from './in_message';
import { InAuthUser } from '../in_auth_user';

const MEMBER_COL = 'members';
const MSG_COL = 'MESSAGES';
// const SCR_NAME_COL = 'screen_names';

const { Firestore } = FirebaseAdmin.getInstance();

async function post({
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
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  await Firestore.runTransaction(async (transaction) => {
    let messageCount = 1;
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'post : 존재하지 않는 사용자에용' });
    }
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    if (memberInfo.messageCount !== undefined) {
      messageCount = memberInfo.messageCount;
    }
    const newMessageRef = memberRef.collection(MSG_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      messageNo: number;
      author?: {
        photoURL?: string;
      };
    } = {
      message,
      messageNo: messageCount,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transaction.set(newMessageRef, newMessageBody);
    await transaction.update(memberRef, { messageCount: messageCount + 1 });
  });
}

/** 메시지 수정 */
async function updateMessage({ uid, messageId, deny }: { uid: string; messageId: string; deny: boolean }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);

  const result = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'update : 존재하지 않는 사용자에용' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'update : 존재하지 않는 문서에용' });
    }
    await transaction.update(messageRef, { deny });

    const messageData = messageDoc.data() as InMessageServer;
    return {
      ...messageData,
      id: messageId,
      deny,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return result;
}

/** get - 현재 listWithPage 사용 */
async function list({ uid }: { uid: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'list : 존재하지 않는 사용자에용' });
    }

    const messageCol = memberRef.collection(MSG_COL).orderBy('createAt', 'desc');
    const messageColDoc = await transaction.get(messageCol);
    /** returnData들이 배열로 들어갈 예정 */
    const data = messageColDoc.docs.map((mv) => {
      //mv:mapvalue의 줄이말
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return data;
  });
  return listData;
}

/** get - 현재 페이징 기능과 함께 사용중 */
async function listWithPage({ uid, page = 1, size = 10 }: { uid: string; page?: number; size?: number }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);

  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'listWithPage : 존재하지 않는 사용자에용' });
    }
    //페이지 세는 법..
    const memberInfo = memberDoc.data() as InAuthUser & { messageCount?: number };
    const { messageCount = 0 } = memberInfo;
    const totalElements = messageCount !== 0 ? messageCount - 1 : 0;
    /** 나머지 */
    const remains = totalElements % size;
    /** 총 페이지 수(나머지가 있으면 마지막 페이지 1개 추가생성) */
    const totalPages = (totalElements - remains) / size + (remains > 0 ? 1 : 0);
    /** 페이지 정보는 1부터 나오니 1을 빼고 시작 */
    const startAt = totalElements - (page - 1) * size;
    if (startAt < 0) {
      return { totalElements, totalpages: 0, page, size, content: [] };
    }
    const messageCol = memberRef.collection(MSG_COL).orderBy('messageNo', 'desc').startAt(startAt).limit(size); //limit만큼 잘려서 나옴
    const messageColDoc = await transaction.get(messageCol);
    /** returnData들이 배열로 들어갈 예정 */
    const data = messageColDoc.docs.map((mv) => {
      //mv:mapvalue의 줄이말
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const isDeny = docData.deny !== undefined && docData.deny === true;
      const returnData = {
        ...docData,
        id: mv.id,
        message: isDeny ? '비공개 처리된 메시지 입니다.' : docData.message,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt ? docData.replyAt.toDate().toISOString() : undefined,
      } as InMessage;
      return returnData;
    });
    return { totalElements, totalPages, page, size, content: data };
  });
  return listData;
}

//

async function get({ uid, messageId }: { uid: string; messageId: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);

  const data = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'get : 존재하지 않는 사용자에용' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'get : 존재하지 않는 문서에용' });
    }

    const messageData = messageDoc.data() as InMessageServer;
    const isDeny = messageData.deny !== undefined && messageData.deny === true;
    return {
      ...messageData,
      message: isDeny ? '비공개 처리된 메시지 입니다.' : messageData.message,
      id: messageId,
      createAt: messageData.createAt.toDate().toISOString(),
      replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
    };
  });
  return data;
}

async function postReply({ uid, messageId, reply }: { uid: string; messageId: string; reply: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL).doc(messageId);
  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'postReply : 존재하지 않는 사용자에용' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'postReply : 존재하지 않는 문서에용' });
    }

    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new CustomServerError({ statusCode: 400, message: '이미 댓글을 입력했습니다.' });
    }
    await transaction.update(messageRef, { reply, replyAt: firestore.FieldValue.serverTimestamp() });
  });
}

/** 메시지 삭제 */
async function deleteMessage({ uid, messageId }: { uid: string; messageId: string }) {
  // const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MSG_COL);

  /** 삭제 */
  messageRef.doc(messageId).delete();

  // const result = await Firestore.runTransaction(async (transaction) => {
  //   const memberDoc = await transaction.get(memberRef);
  //   const messageDoc = await transaction.get(messageRef);

  //   // if (memberDoc.exists === false) {
  //   //   throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 사용자에용' });
  //   // }
  //   // if (messageDoc.exists === false) {
  //   //   throw new CustomServerError({ statusCode: 400, message: '존재하지 않는 문서에용' });
  //   // }

  //   // console.log('🥚🍳🥞 message.model 도착', messageDoc);

  //   //트랜잭션 실행
  //   // await transaction.update(messageRef, { deny });
  //   // await deleteDoc(doc(db, "cities", "DC"));

  //   // const messageData = messageDoc.data() as InMessageServer;
  //   // return {
  //   //   ...messageData,
  //   //   id: messageId,
  //   //   createAt: messageData.createAt.toDate().toISOString(),
  //   //   replyAt: messageData.replyAt ? messageData.replyAt.toDate().toISOString() : undefined,
  //   // };
  // });

  // return result;
}
const MessageModel = {
  post,
  updateMessage,
  list,
  get,
  postReply,
  listWithPage,
  deleteMessage,
};

export default MessageModel;
