import { NextApiRequest, NextApiResponse } from 'next';
import MemberModel from '@/models/member/member.model';
import BadReqError from './error/bad_request_error';

/** 계정 추가 */
async function add(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;

  if (uid === undefined || uid === null) {
    throw new BadReqError('uid -> 누락되었어요.');
  }
  if (email === undefined || email === null) {
    throw new BadReqError('email -> 누락되었어요.');
  }

  const addResult = await MemberModel.add({ uid, email, displayName, photoURL });
  if (addResult.result === true) {
    return res.status(200).json(addResult);
  }
  if (addResult.result === false) {
    return res.status(500).json(addResult);
  }
}

/** screen name으로 유저 정보 조회 */
async function findByScreenName(req: NextApiRequest, res: NextApiResponse) {
  const { screenName } = req.query;
  if (screenName === undefined || screenName === null) {
    throw new BadReqError('screenName이 누락되었어요.');
  }
  //findByScreenName(screenName)이 Array일 수도 있음
  const extractScreenName = Array.isArray(screenName) ? screenName[0] : screenName;
  const findResult = await MemberModel.findByScreenName(extractScreenName);

  if (findResult === null) {
    return res.status(404).end();
  }
  res.status(200).json(findResult);
}

/** 홈화면 둘러보기 -> 모든 유저의 userName, screenName, photoURL GET */
async function findAllName(_req: NextApiRequest, res: NextApiResponse) {
  const findResult = await MemberModel.findAllName();

  if (findResult === null) {
    return res.status(404).end();
  }

  res.status(200).json(findResult);
}

/** 유저 정보 수정하기 */
async function update(req: any, res: NextApiResponse) {
  const { uid, email, displayName, introduce, photoURL } = req;

  if (uid === undefined || uid === null) {
    throw new BadReqError('uid -> 누락되었어요.');
  }
  if (displayName === undefined || displayName === null) {
    throw new BadReqError('displayName -> 누락되었어요.');
  }
  if (introduce === undefined || introduce === null) {
    throw new BadReqError('introduce -> 누락되었어요.');
  }
  if (email === undefined || email === null) {
    throw new BadReqError('email -> 누락되었어요.');
  }
  if (photoURL === undefined || photoURL === null) {
    throw new BadReqError('photoURL -> 누락되었어요.');
  }

  const updateResult = await MemberModel.update({ uid, email, displayName, introduce, photoURL });
  if (updateResult.result === true) {
    return res.status(200).json(updateResult);
  }
  if (updateResult.result === false) {
    return res.status(500).json(updateResult);
  }
}
const MemberCtrl = {
  add,
  findByScreenName,
  findAllName,
  update,
};

export default MemberCtrl;
