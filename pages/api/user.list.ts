import { NextApiRequest, NextApiResponse } from 'next';
import MemberCtrl from '@/controllers/member.ctrl';
import handleError from '@/controllers/error/handle_error';

// user.list.ts : 유저 둘러보기 기능을 위해
// 모든 유저의 스크린네임을 불러옴

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const { method } = req;
  // const supportMethod = ['GET'];
  try {
    // checkSupportMethod(supportMethod, method);
    await MemberCtrl.findAllName(req, res);
  } catch (err) {
    console.error(err);
    //에러 처리
    handleError(err, res);
  }
}
