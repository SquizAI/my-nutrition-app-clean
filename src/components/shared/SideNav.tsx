import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';
import {
  FaHome,
  FaUser,
  FaUtensils,
  FaChartLine,
  FaUsers,
  FaBrain,
  FaMusic,
  FaBolt,
  FaMoon,
  FaHeartbeat,
  FaShoppingBasket,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const Nav = styled.nav`
  width: 280px;
  height: 100vh;
  background: ${theme.colors.background.card};
  border-right: 1px solid ${theme.colors.border.default};
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const UserSection = styled.div`
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border.default};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSizes.lg};
  color: ${theme.colors.text.primary};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSizes.md};
  margin: 0;
`;

const UserEmail = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSizes.sm};
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};

  h4 {
    color: ${theme.colors.text.secondary};
    font-size: ${theme.typography.fontSizes.sm};
    margin-bottom: ${theme.spacing.md};
    padding-left: ${theme.spacing.md};
  }
`;

interface NavItemProps {
  $active: boolean;
}

const NavItem = styled(motion.button)<NavItemProps>`
  width: 100%;
  padding: ${theme.spacing.md};
  border: none;
  background: ${props => props.$active ? 
    'linear-gradient(135deg, rgba(49, 229, 255, 0.15) 0%, rgba(151, 71, 255, 0.15) 100%)' : 
    'transparent'
  };
  border-radius: ${theme.borderRadius.medium};
  color: ${props => props.$active ? theme.colors.primary : theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: ${theme.spacing.sm};

  &:hover {
    background: linear-gradient(135deg, rgba(49, 229, 255, 0.1) 0%, rgba(151, 71, 255, 0.1) 100%);
    transform: translateX(4px);
  }

  svg {
    font-size: 20px;
    color: ${props => props.$active ? theme.colors.primary : theme.colors.text.secondary};
  }
`;

interface NavLinkProps {
  icon: React.ComponentType;
  label: string;
  to: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon: Icon, label, to, active }) => {
  const navigate = useNavigate();

  return (
    <NavItem
      $active={active}
      onClick={() => navigate(to)}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon />
      {label}
    </NavItem>
  );
};

export const SideNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Mock user data - replace with actual user context
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD'
  };

  return (
    <Nav>
      <UserSection>
        <Avatar>{user.avatar}</Avatar>
        <UserInfo>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>
      </UserSection>

      <Section>
        <h4>MAIN</h4>
        <NavLink icon={FaHome} label="Dashboard" to="/" active={currentPath === '/'} />
        <NavLink icon={FaUtensils} label="Meal Planner" to="/meal-planner" active={currentPath === '/meal-planner'} />
        <NavLink icon={FaChartLine} label="Progress" to="/progress" active={currentPath === '/progress'} />
      </Section>

      <Section>
        <h4>PROFILE & PREFERENCES</h4>
        <NavLink icon={FaUser} label="Profile" to="/profile" active={currentPath === '/profile'} />
        <NavLink icon={FaBolt} label="Energy & Lifestyle" to="/profile/lifestyle" active={currentPath === '/profile/lifestyle'} />
        <NavLink icon={FaHeartbeat} label="Health History" to="/profile/health" active={currentPath === '/profile/health'} />
        <NavLink icon={FaMoon} label="Sleep & Hydration" to="/profile/sleep" active={currentPath === '/profile/sleep'} />
        <NavLink icon={FaUtensils} label="Eating Habits" to="/profile/eating" active={currentPath === '/profile/eating'} />
        <NavLink icon={FaShoppingBasket} label="Shopping & Groceries" to="/profile/shopping" active={currentPath === '/profile/shopping'} />
      </Section>

      <Section>
        <h4>COMMUNITY</h4>
        <NavLink icon={FaUsers} label="Community" to="/community" active={currentPath === '/community'} />
        <NavLink icon={FaBrain} label="Insights" to="/insights" active={currentPath === '/insights'} />
        <NavLink icon={FaMusic} label="Music & Mood" to="/music-mood" active={currentPath === '/music-mood'} />
      </Section>

      <Section>
        <h4>SETTINGS</h4>
        <NavLink icon={FaCog} label="Settings" to="/settings" active={currentPath === '/settings'} />
        <NavItem
          $active={false}
          onClick={() => {
            localStorage.removeItem('onboardingCompleted');
            navigate('/onboarding');
          }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaSignOutAlt />
          Sign Out
        </NavItem>
      </Section>
    </Nav>
  );
}; 