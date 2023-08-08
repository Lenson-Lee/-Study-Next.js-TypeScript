import { NextApiRequest, NextApiResponse } from 'next';
import MemberCtrl from '@/controllers/member.ctrl';
import handleError from '@/controllers/error/handle_error';
import checkSupportMethod from '@/controllers/error/check_support_method';

// POST만 할 예정
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  console.log('🐹 photo api : ', req);
  const supportMethod = ['POST'];
  try {
    checkSupportMethod(supportMethod, method);
    // await MemberCtrl.add(req, res);
  } catch (err) {
    console.error(err);
    //에러 처리
    handleError(err, res);
  }
}
