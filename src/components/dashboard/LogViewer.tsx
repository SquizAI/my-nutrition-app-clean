import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import useLoggingStore, { LogEntry } from '../../services/loggingService';
import { Download, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

const Container = styled.div`
  background: linear-gradient(135deg, #1a1f2c, #2d3748);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 0;
  background: linear-gradient(135deg, #81e6d9, #4fd1c5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(motion.button)`
  background: rgba(129, 230, 217, 0.1);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  color: #81e6d9;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(129, 230, 217, 0.2);
  }
`;

const FilterContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #81e6d9;
`;

const FilterSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(129, 230, 217, 0.2);
  border-radius: 4px;
  padding: 6px 12px;
  color: #fff;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #81e6d9;
  }
`;

const DateInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(129, 230, 217, 0.2);
  border-radius: 4px;
  padding: 6px 12px;
  color: #fff;

  &:focus {
    outline: none;
    border-color: #81e6d9;
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 12px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(129, 230, 217, 0.2);
    border-radius: 4px;
  }
`;

const LogItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
`;

const LogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const LogType = styled.span<{ type: LogEntry['type'] }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ type }) => {
    switch (type) {
      case 'error':
        return 'rgba(245, 101, 101, 0.2)';
      case 'warning':
        return 'rgba(246, 173, 85, 0.2)';
      case 'info':
        return 'rgba(72, 187, 120, 0.2)';
      case 'calculation':
        return 'rgba(129, 230, 217, 0.2)';
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'error':
        return '#fc8181';
      case 'warning':
        return '#f6ad55';
      case 'info':
        return '#48bb78';
      case 'calculation':
        return '#81e6d9';
      default:
        return '#fff';
    }
  }};
`;

const LogTime = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const LogMessage = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`;

const LogData = styled(motion.pre)`
  margin: 12px 0 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  color: rgba(255, 255, 255, 0.8);
`;

const LogViewer: React.FC = () => {
  const { logs, exportLogs } = useLoggingStore();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    type: LogEntry['type'] | '';
    category: LogEntry['category'] | '';
    startDate: string;
    endDate: string;
  }>({
    type: '',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [expandedLogs, setExpandedLogs] = useState<string[]>([]);

  const toggleLogExpansion = (timestamp: string) => {
    setExpandedLogs(prev =>
      prev.includes(timestamp)
        ? prev.filter(t => t !== timestamp)
        : [...prev, timestamp]
    );
  };

  const handleExport = () => {
    const blob = new Blob([exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-app-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (filters.type) {
      result = result.filter(log => log.type === filters.type);
    }

    if (filters.category) {
      result = result.filter(log => log.category === filters.category);
    }

    if (filters.startDate) {
      result = result.filter(
        log => log.timestamp >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      result = result.filter(
        log => log.timestamp <= new Date(filters.endDate)
      );
    }

    return result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs, filters]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(logs.map(log => log.category)));
  }, [logs]);

  return (
    <Container>
      <Header>
        <Title>Activity Logs</Title>
        <Controls>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filters
            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Button>
          <Button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
          >
            <Download size={18} />
            Export
          </Button>
        </Controls>
      </Header>

      {showFilters && (
        <FilterContainer
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <FilterGroup>
            <FilterLabel>Type</FilterLabel>
            <FilterSelect
              value={filters.type}
              onChange={e => setFilters(prev => ({ ...prev, type: e.target.value as LogEntry['type'] | '' }))}
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="calculation">Calculation</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect
              value={filters.category}
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value as LogEntry['category'] | '' }))}
            >
              <option value="">All Categories</option>
              <option value="meal">Meal</option>
              <option value="macro">Macro</option>
              <option value="user">User</option>
              <option value="system">System</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Start Date</FilterLabel>
            <DateInput
              type="date"
              value={filters.startDate}
              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>End Date</FilterLabel>
            <DateInput
              type="date"
              value={filters.endDate}
              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </FilterGroup>
        </FilterContainer>
      )}

      <LogList>
        {filteredLogs.map((log, index) => {
          // Generate a unique key using timestamp and random string
          const uniqueId = Math.random().toString(36).substring(2, 15);
          const logKey = `log-${log.timestamp.getTime()}-${uniqueId}`;
          
          return (
            <LogItem
              key={logKey}
              onClick={() => toggleLogExpansion(log.timestamp.toISOString())}
              whileHover={{ scale: 1.01 }}
            >
              <LogHeader>
                <LogType type={log.type}>{log.type.toUpperCase()}</LogType>
                <LogTime>{log.timestamp.toLocaleString()}</LogTime>
              </LogHeader>
              <LogMessage>{log.message}</LogMessage>
              {expandedLogs.includes(log.timestamp.toISOString()) && log.data && (
                <LogData
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {JSON.stringify(log.data, null, 2)}
                </LogData>
              )}
            </LogItem>
          );
        })}
      </LogList>
    </Container>
  );
};

export default LogViewer; 