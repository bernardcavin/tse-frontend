import { forwardRef, ReactNode, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, BoxProps } from '@mantine/core';
import { nprogress } from '@mantine/nprogress';
import { app } from '@/config';

interface PageProps extends BoxProps {
  children: ReactNode;
  meta?: ReactNode;
  title: string;
  withFooter?: boolean;
}
export const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ children, title = '', p = 'md', meta, withFooter = true, ...other }, ref) => {
    useEffect(() => {
      nprogress.complete();
      return () => nprogress.start();
    }, []);

    return (
      <>
        <Helmet>
          <title>{`${title} | ${app.name}`}</title>
          {meta}
        </Helmet>

        <Box ref={ref} {...other} p={p}>
          {children}
        </Box>
      </>
    );
  }
);
