import { NextApiRequest, NextApiResponse } from 'next';
import FirebaseAdmin from '@/models/firebase_admin';
import MessageModel from '@/models/message/message.model';
import BadReqError from './error/bad_request_error';
import CustomServerError from './error/custom_server_error';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (message === undefined) {
    throw new BadReqError('메시지 누락');
  }
  await MessageModel.post({ uid, message, author });
  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid, page, size } = req.query;
  console.log('🌊 message.ctrl <list> 쿼리 : ', uid, page, size);
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  const convertPage = page === undefined ? '1' : page;
  const convertSize = size === undefined ? '10' : size;
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const pageToStr = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToStr = Array.isArray(convertSize) ? convertSize[0] : convertSize;

  console.log('🌊 message.ctrl String : ', uidToStr, pageToStr, sizeToStr);
  const listResp = await MessageModel.listWithPage({
    uid: uidToStr,
    page: parseInt(pageToStr, 10),
    size: parseInt(sizeToStr, 10),
  });
  return res.status(200).json(listResp);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;

  console.log('🍉 message.ctrl <get>쿼리 : ', uid, messageId);
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  const uidToStr = Array.isArray(uid) ? uid[0] : uid;
  const messageIdToStr = Array.isArray(messageId) ? messageId[0] : messageId;
  const data = await MessageModel.get({ uid: uidToStr, messageId: messageIdToStr });
  return res.status(200).json(data);
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId, reply } = req.body;
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  if (reply === undefined) {
    throw new BadReqError('reply 누락');
  }
  await MessageModel.postReply({ uid, messageId, reply });
  return res.status(201).end();
}

/** 수정은 아무나 하면 안되서 토큰값 비교 */
async function updateMessage(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;
  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '권한이 없습니다.' });
  }
  let tokenUid: null | string = null;
  try {
    const decode = FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    tokenUid = (await decode).uid;
  } catch (err) {
    throw new BadReqError('token에 문제가 있어용');
  }

  const { uid, messageId, deny } = req.body;
  if (uid === undefined) {
    throw new BadReqError('uid 누락');
  }
  if (uid !== tokenUid) {
    throw new CustomServerError({ statusCode: 401, message: '수정 권한이 없습니다.' });
  }
  if (messageId === undefined) {
    throw new BadReqError('messageId 누락');
  }
  if (deny === undefined) {
    throw new BadReqError('deny 누락');
  }
  const result = await MessageModel.updateMessage({ uid, messageId, deny });
  return res.status(200).json(result);
}

const MessageCtrl = {
  post,
  updateMessage,
  list,
  get,
  postReply,
};

export default MessageCtrl;
