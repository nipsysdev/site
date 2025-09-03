'use client';
import { Button } from '@nipsysdev/lsd-react/client/Button';
import { Modal } from '@nipsysdev/lsd-react/client/Modal';
import { ModalBody } from '@nipsysdev/lsd-react/client/ModalBody';
import { useTranslations } from 'next-intl';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/contexts/AppContext';
import { Link, usePathname } from '@/i18n/intl';
import styles from '@/styles/components.module.css';

export default function Sidenav() {
  const t = useTranslations('Pages');
  const { isMenuDisplayed, setIsMenuDisplayed } = useAppContext();
  const pathname = usePathname();

  const activePath = pathname === '/' ? pathname : pathname.replace(/\/+$/, '');
  const notfound = '404';
  const activeRouteName =
    Object.entries(Routes)
      .filter(([, routePath]) => routePath === activePath)
      .map(([routeName]) => routeName)
      .find(Boolean) ?? notfound;

  const btnList = (
    <>
      {Object.entries(Routes).map(([routeName, routePath]) => (
        <Button
          key={routeName}
          variant={activeRouteName === routeName ? 'filled' : 'outlined'}
          className={styles.ghostButton}
        >
          <Link href={routePath} onClick={() => setIsMenuDisplayed(false)}>
            {t(routeName)}
          </Link>
        </Button>
      ))}
    </>
  );

  return (
    <div>
      <div className="hidden sm:flex flex-col gap-y-5 border border-white h-fit py-5 mr-5">
        {btnList}
      </div>

      <Modal
        size="xsmall"
        isOpen={isMenuDisplayed}
        onClose={() => setIsMenuDisplayed(false)}
        className={styles.modal}
      >
        <ModalBody>
          <div className="grid grid-cols-3 h-fit">{btnList}</div>
        </ModalBody>
      </Modal>
    </div>
  );
}
