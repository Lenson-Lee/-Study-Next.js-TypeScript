import moment from 'moment';

function convertDateToString(dateString: string): string {
  /** milliseconds(0) : 소숫점이 나오기 떄문에 (0)으로 설정 */
  const dateTime = moment(dateString, moment.ISO_8601).milliseconds(0);
  const now = moment();

  /**현재시간으로부터의 시간 차이 */
  const diff = now.diff(dateTime);
  const calDuration = moment.duration(diff);
  const years = calDuration.years();
  const months = calDuration.months();
  const days = calDuration.days();
  const hours = calDuration.hours();
  const minutes = calDuration.minutes();
  const seconds = calDuration.seconds();

  if (
    (years === 0 &&
      months === 0 &&
      days === 0 &&
      hours === 0 &&
      minutes === 0 &&
      seconds !== undefined &&
      seconds === 0) ||
    seconds < 1
  ) {
    return '0초';
  }
  if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 && seconds) {
    return `${Math.floor(seconds)}초`;
  }
  if (years === 0 && months === 0 && days === 0 && hours === 0) {
    return `${minutes}분`;
  }
  if (years === 0 && months === 0 && days === 0) {
    return `${hours}시간`;
  }
  if (years === 0 && months === 0) {
    return `${days}일`;
  }
  if (years === 0) {
    return `${months}개월`;
  }
  return `${years}년`;
}

export default convertDateToString;
