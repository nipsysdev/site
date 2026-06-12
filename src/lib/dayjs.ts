import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(localizedFormat);

dayjs.locale('en');

export default dayjs;
