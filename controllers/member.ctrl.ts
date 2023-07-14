import { NextApiRequest, NextApiResponse } from 'next';
import MemberModel from '@/models/member/member.model';
import BadReqError from './error/bad_request_error';

/** 계정 추가 */
async function add(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;
  const introduce = '';
  const updateName = '';
  const updateIntro = ''; //소개글은 가입 이후에 직접 수정

  if (uid === undefined || uid === null) {
    throw new BadReqError('uid -> 누락되었어요.');
  }
  if (email === undefined || email === null) {
    throw new BadReqError('email -> 누락되었어요.');
  }

  const addResult = await MemberModel.add({ uid, email, displayName, photoURL, introduce, updateName, updateIntro });
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
  const {
    uid,
    email,
    updateName,
    updateIntro,
  }: {
    uid: string;
    email: string;
    updateName: string;
    updateIntro: string;
  } = req;

  if (uid === undefined || uid === null) {
    throw new BadReqError('uid -> 누락되었어요.');
  }
  if (updateName === undefined || updateName === null) {
    throw new BadReqError('updateName -> 누락되었어요.');
  }
  if (updateIntro === undefined || updateIntro === null) {
    throw new BadReqError('updateIntro -> 누락되었어요.');
  }
  if (email === undefined || email === null) {
    throw new BadReqError('email -> 누락되었어요.');
  }

  const updateResult = await MemberModel.update({ uid, email, updateName, updateIntro });
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
