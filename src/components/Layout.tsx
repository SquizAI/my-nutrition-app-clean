import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { SideNav } from './shared/SideNav';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  background: ${theme.colors.background.main};
  background-image: ${theme.colors.background.gradient};
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px; // Width of SideNav
  padding: ${theme.spacing.xl};
  min-height: 100vh;
  overflow-x: hidden;
`;

interface LayoutProps {
  children: React.ReactNode;
  showSideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSideNav = true }) => {
  return (
    <Container>
      {showSideNav && <SideNav />}
      <MainContent style={{ marginLeft: showSideNav ? '280px' : '0' }}>
        {children}
      </MainContent>
    </Container>
  );
};

export default Layout;