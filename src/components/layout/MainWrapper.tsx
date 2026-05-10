'use client';

import Sidenav from './Sidenav';

export default function MainWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Sidenav>{children}</Sidenav>;
}
